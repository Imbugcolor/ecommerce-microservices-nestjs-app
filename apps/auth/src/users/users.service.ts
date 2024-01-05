import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './users.repository';
import { RegisterDto } from '../dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CloudinaryService, MAIL_SERVICE, User } from '@app/common';
import { Model, Types } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(MAIL_SERVICE)
    private mailService: ClientProxy,
    private cloudinaryService: CloudinaryService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt();
    return await bcryptjs.hash(password, salt);
  }

  public async register(registerDto: RegisterDto): Promise<{ msg: string }> {
    const { username, email, password, cf_password } = registerDto;

    if (password !== cf_password) {
      throw new UnauthorizedException('cf_password does not match password.');
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = { username, email, password: hashedPassword };

    const active_token = await this.getActiveToken(newUser);

    const url = `${this.configService.get(
      'BASE_URL',
    )}/users/active/${active_token}`;

    this.mailService.emit('send-mail', {
      email,
      url,
      txt: 'Verify your email address.',
    });

    return { msg: 'Success! Pls check your email.' };
  }

  public async activeAccount(
    token: string,
  ): Promise<{ msg: string; user: User }> {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACTIVE_TOKEN_SECRET'),
    });

    const { user } = decoded;

    if (!user) {
      throw new UnauthorizedException('Please check your credentials.');
    }

    const createUser = new this.userModel({
      ...user,
      _id: new Types.ObjectId(),
    });

    let saveUser: User;

    try {
      saveUser = (await createUser.save()).toJSON() as unknown as User;
    } catch (error) {
      if (error.code === 11000) {
        //duplicate username
        throw new ConflictException('email already exists.');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return {
      msg: 'Account has been activated!',
      user: { ...saveUser, password: '' },
    };
  }

  private async getActiveToken(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<string> {
    const activeToken = this.jwtService.sign(
      {
        user,
      },
      {
        secret: this.configService.get<string>('JWT_ACTIVE_TOKEN_SECRET'),
        expiresIn: '5m',
      },
    );

    return activeToken;
  }

  public async getUser(user: User): Promise<User> {
    return new User(user);
  }

  public async updateProfile(
    updateProfileDto: UpdateProfileDto,
    user: User,
  ): Promise<User> {
    const updatedUser = await this.userRepository.findOneAndUpdate(
      user._id,
      updateProfileDto,
    );

    return new User(updatedUser);
  }

  public async uploadPhotoProfile(file: Express.Multer.File, user: User) {
    const response = await this.cloudinaryService.uploadFile(file);
    const updatedPhoto = await this.userRepository.findOneAndUpdate(user._id, {
      avatar: response.secure_url,
    });
    return new User(updatedPhoto);
  }

  public async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    user: User,
  ): Promise<{ msg: string }> {
    const { oldPassword, newPassword, cfNewPassword } = updatePasswordDto;

    if (newPassword !== cfNewPassword) {
      throw new UnauthorizedException(
        'cfNewPassword does not match newPassword.',
      );
    }

    const userData = await this.userRepository.findOne({ _id: user._id });

    if (userData.password !== oldPassword) {
      throw new UnauthorizedException('oldPassword does not match.');
    }

    userData.password = await this.hashPassword(newPassword);

    return { msg: 'Password updated.' };
  }
}
