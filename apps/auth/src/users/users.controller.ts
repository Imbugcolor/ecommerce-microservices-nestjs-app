import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from '../dto/register.dto';
import { GetUser, User } from '@app/common';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('users')
@SerializeOptions({ strategy: 'excludeAll' })
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{ msg: string }> {
    return this.userService.register(registerDto);
  }

  @Get('active/:token')
  async activeAccount(
    @Param('token') token: string,
  ): Promise<{ msg: string; user: User }> {
    return this.userService.activeAccount(token);
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getProfile(@GetUser() user: User) {
    return this.userService.getUser(user);
  }

  @Patch('profile/update')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUser() user: User,
  ): Promise<User> {
    return this.userService.updateProfile(updateProfileDto, user);
  }

  @Patch('profile/upload-photo')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'), ClassSerializerInterceptor)
  async uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<User> {
    return this.userService.uploadPhotoProfile(file, user);
  }
}
