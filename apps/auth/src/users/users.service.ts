import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './users.repository';
import { RegisterDto } from '../dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@app/common';
import { Model, Types } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, email, password, cf_password } = registerDto;

    if (password !== cf_password) {
      throw new UnauthorizedException('cf_password does not match password.');
    }

    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = { username, email, password: hashedPassword };

    const createUser = new this.userModel({
      ...newUser,
      _id: new Types.ObjectId(),
    });

    let user: User;

    try {
      user = (await createUser.save()).toJSON() as unknown as User;
    } catch (error) {
      if (error.code === 11000) {
        //duplicate username
        throw new ConflictException('email already exists.');
      } else {
        throw new InternalServerErrorException();
      }
    }

    return { ...user, password: '' };
  }
}
