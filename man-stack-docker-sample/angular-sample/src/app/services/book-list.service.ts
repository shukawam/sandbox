import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Book } from '../book-list/book';

@Injectable({
  providedIn: 'root'
})
export class BookListService {

  constructor(private readonly httpClient: HttpClient) { }

  async findAll(): Promise<HttpResponse<Book[]>> {
    return await this.httpClient.get<Book[]>('/api/book-list', {
      observe: 'response'
    }).toPromise();
  }
}
