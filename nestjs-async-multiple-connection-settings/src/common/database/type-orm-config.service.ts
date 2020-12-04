import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

/**
 * DBの接続情報を作成するServiceクラスです。
 */
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {

  /**
   * DBの接続設定を環境変数をもとに作成します。
   * 環境変数に設定されていない場合は、デフォルトの設定値を返却します。
   * @returns 接続情報
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configService = new ConfigService();
    return {
      type: 'postgres' as 'postgres',
      host: configService.get('DATABASE_HOST', 'localhost'),
      port: Number(configService.get('DATABASE_PORT', 5432)),
      username: configService.get('DATABASE_USERNAME', 'postgres'),
      password: configService.get('DATABASE_PASSWORD', 'postgres'),
      database: 'postgres' as 'postgres',
      entities: [join(__dirname + '../**/*.entity{.ts,.js}')],
      synchronize: false,
    };
  }
}