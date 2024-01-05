import { AbstractDocument, AddressDto } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../enums/role.enum';
import { LoginType } from '../enums/login-type.enum';
import { UserGender } from '../enums/user-gender.enum';
import { Expose, Type } from 'class-transformer';

@Schema()
export class User extends AbstractDocument {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
  @Prop({ required: true, trim: true })
  @Expose()
  username: string;

  @Prop({ required: true, trim: true, unique: true })
  @Expose()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dnv2v2tiz/image/upload/v1679802559/instagram-avt-profile/unknow_fc0uaf.jpg',
  })
  @Expose()
  avatar: string;

  @Prop({ default: [Role.User] })
  @Expose()
  roles: Role[];

  @Prop()
  @Expose()
  phone: string;

  @Prop()
  @Expose()
  @Type(() => AddressDto)
  address: AddressDto;

  @Prop({ type: String, default: UserGender.MALE })
  @Expose()
  gender: UserGender;

  @Prop()
  @Expose()
  dateOfbirth: Date;

  @Prop({ type: String, default: LoginType.LOCAL })
  @Expose()
  type: LoginType;

  @Prop()
  rf_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
