import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from './common/database/type-orm-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      // ignoreEnvFile: true, <- 環境変数から取得する場合はコメントアウトを外す。
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      // 接続情報を作成するServiceクラスを定義
      useClass: TypeOrmConfigService,
    }),
  ],
})
export class AppModule {
}