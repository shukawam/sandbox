import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebauthnModule } from './webauthn/webauthn.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    WebauthnModule,
    MongooseModule.forRoot('mongodb://mongo:27017/webauthn-sample', {
      useFindAndModify: false,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
