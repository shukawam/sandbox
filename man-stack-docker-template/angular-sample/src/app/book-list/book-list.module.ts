import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from './book-list.component';
import { BookListService } from '../services/book-list.service';

@NgModule({
  declarations: [BookListComponent],
  imports: [
    CommonModule,
  ],
  providers: [BookListService]
})
export class BookListModule { }
