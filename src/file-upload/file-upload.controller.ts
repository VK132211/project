import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { UploadFileDto } from './interfaces/upload-file-dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles-guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileData: UploadFileDto,
    @currentUser() user: User,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.fileUploadService.uploadFile(
      file,
      uploadFileData.description,
      user,
    );
  }

  @Get()
  async findAll() {
    return this.fileUploadService.findAll();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.fileUploadService.remove(id);
    return {
      message: 'File deleted succesfully',
    };
  }
}
