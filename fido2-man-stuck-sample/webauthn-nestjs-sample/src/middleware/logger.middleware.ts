import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * リクエストのログを出力するMiddleware。
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    // リクエストボディーをログに出力する
    Logger.log(req.body, 'LoggerMiddlerware', true);
    next();
  }
}
