import { Component, OnInit } from '@angular/core';
import { BookListService } from '../services/book-list.service';
import { Book } from './book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  bookList: Book[] = [];

  constructor(private readonly bookListService: BookListService) { }

  ngOnInit(): void {
  }

  async search(): Promise<void> {
    await this.bookListService.findAll().then(response => {
      response.body.forEach(element => {
        this.bookList.push(element);
      });
    });
    this.bookList.forEach(element => console.log(element));
    console.log(this.bookList);
  }

}
