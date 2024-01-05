import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from '@app/common';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ msg: string; user: User; accessToken: string }> {
    return this.authService.login(loginDto, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refreshtoken')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['_id'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('/logout')
  @UseGuards(AccessTokenGuard)
  signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ msg: string }> {
    const userId = req.user['_id'];
    return this.authService.signOut(userId, res);
  }

  @UseGuards(AccessTokenGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user;
  }

  @Post('forgotPassword')
  async forgotPassword(@Body('email') email: string): Promise<{ msg: string }> {
    return this.authService.forgotPassword(email);
  }

  @Get('verifypasswordrecovery/:id/:token')
  async verifyPasswordRecovery(
    @Param('id') id: string,
    @Param('token') token: string,
  ): Promise<{ msg: string }> {
    return this.authService.verifyUrlPasswordRecovery({ id, token });
  }

  @Patch('resetpassword')
  async resetPassword(
    @Body() resetPassword: ResetPasswordDto,
  ): Promise<{ msg: string }> {
    return this.authService.resetPassword(resetPassword);
  }
}
