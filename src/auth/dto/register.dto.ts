import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Name is required!' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be atleat 3 characters' })
  @MaxLength(24, { message: 'Name can not be longer than 24 characters' })
  name: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'Password must contain atleast 6 characters long' })
  password: string;
}
