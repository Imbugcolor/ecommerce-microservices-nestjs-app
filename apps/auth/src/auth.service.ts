import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './users/users.repository';
import { User } from '@app/common';
import { LoginType } from '../../../libs/common/src/enums/login-type.enum';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async login(
    loginDto: LoginDto,
    res: Response,
  ): Promise<{ msg: string; user: User; accessToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ email });

    if (user && user.type !== LoginType.LOCAL) {
      throw new UnauthorizedException(
        'This account has registed with other method.',
      );
    }

    if (user && (await bcryptjs.compare(password, user.password))) {
      const accessToken = await this.getAccessToken(user._id.toString());
      const refreshToken = await this.getRefreshToken(user._id.toString());

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        path: `/auth/refreshtoken`,
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      });

      await this.updateRefreshToken(user._id.toString(), refreshToken);

      return {
        msg: 'Login Success!',
        user: { ...user, password: '' },
        accessToken,
      };
    } else {
      throw new UnauthorizedException('Please check your login credentials.');
    }
  }

  async hashData(data: string) {
    const salt = await bcryptjs.genSalt();
    const hashedData = await bcryptjs.hash(data, salt);
    return hashedData;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userModel.findByIdAndUpdate(userId, {
      rf_token: hashedRefreshToken,
    });
  }

  async getAccessToken(userId: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        _id: userId,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    return accessToken;
  }

  async getRefreshToken(userId: string) {
    const refreshToken = await this.jwtService.signAsync(
      {
        _id: userId,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    return refreshToken;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.rf_token) throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await bcryptjs.compare(
      refreshToken,
      user.rf_token,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const accessToken = await this.getAccessToken(user._id.toString());
    return {
      accessToken,
    };
  }

  async signOut(userId: string, res: Response) {
    res.clearCookie('refresh_token', { path: `/auth/refreshtoken` });

    const user = await this.userModel.findById(userId);

    user.rf_token = '';

    await user.save();

    return { msg: 'Logged Out.' };
  }
}
