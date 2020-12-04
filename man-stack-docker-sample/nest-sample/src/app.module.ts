import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // MongoDBコンテナに接続する
    MongooseModule.forRoot('mongodb://mongo:27017/sample-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    BookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
