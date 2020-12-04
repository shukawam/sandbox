import { Module } from '@nestjs/common';
import { WebauthnController } from './webauthn.controller';
import { WebauthnService } from './webauthn.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [WebauthnController],
  providers: [WebauthnService],
})
export class WebauthnModule { }
