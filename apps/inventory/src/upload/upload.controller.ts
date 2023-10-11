import {
  CloudinaryService,
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '@app/common';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.cloudinaryService.uploadFiles(files);
  }

  @Post('destroy')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  destroyImages(@Body('public_ids') public_ids: string[]) {
    return this.cloudinaryService.destroyFiles(public_ids);
  }
}
