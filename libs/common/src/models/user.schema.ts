import { AbstractDocument, AddressDto } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../../../../apps/auth/src/users/enums/role.enum';
import { LoginType } from '../../../../apps/auth/src/users/enums/login-type.enum';
import { UserGender } from '../../../../apps/auth/src/users/enums/user-gender.enum';

@Schema()
export class User extends AbstractDocument {
  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dnv2v2tiz/image/upload/v1679802559/instagram-avt-profile/unknow_fc0uaf.jpg',
  })
  avatar: string;

  @Prop({ default: [Role.User] })
  roles: Role[];

  @Prop()
  phone: string;

  @Prop()
  address: AddressDto;

  @Prop({ type: String, default: UserGender.MALE })
  gender: UserGender;

  @Prop()
  dateOfbirth: Date;

  @Prop({ type: String, default: LoginType.LOCAL })
  type: LoginType;

  @Prop()
  rf_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
