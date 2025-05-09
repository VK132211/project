import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './utils/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './utils/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email already exists! Please try with a different mail',
      );
    }
    const hashedPassword = await this.hashedPassword(registerDto.password);

    const newlyCreatedUser = this.usersRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const savedUser = await this.usersRepository.save(newlyCreatedUser);
    const { password, ...result } = savedUser;
    return {
      user: result,
      message: 'Registartion Successfull',
    };
  }
  async createAdmin(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email already exists! Please try with a different mail',
      );
    }
    const hashedPassword = await this.hashedPassword(registerDto.password);

    const newlyCreatedUser = this.usersRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const savedUser = await this.usersRepository.save(newlyCreatedUser);
    const { password, ...result } = savedUser;
    return {
      user: result,
      message: 'Admin User created Successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid creds or account not exists');
    }
    const { password, ...result } = user;
    const tokens = this.generateTokens(user);

    return {
      user: result,
      tokens,
    };
  }

  async getUserById(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESHTOKEN_SECRET'),
      });
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('INvalid token');
      }
      const accessToken = this.generateAccessToken(user);
      return accessToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }

  private generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
  private generateAccessToken(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESSTOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESSTOKEN_EXPIRY'),
    });
  }
  private generateRefreshToken(user: User) {
    const payload = {
      sub: user.id,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESHTOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESHTOKEN_EXPIRY'),
    });
  }
  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private async hashedPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, 10);
  }
}
