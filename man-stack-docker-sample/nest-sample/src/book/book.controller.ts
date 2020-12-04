import { Controller, Get } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from 'src/interfaces/book.interface';

@Controller('api')
export class BookController {

  constructor(private readonly bookService: BookService) { }

  @Get('/book-list')
  findAllBook(): Promise<Book[]> {
    return this.bookService.findAll();
  }

}
