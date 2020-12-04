import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from 'src/interfaces/book.interface';

@Injectable()
export class BookService {
  constructor(@InjectModel('Book') private bookModel: Model<Book>) { }

  async findAll(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }
}
