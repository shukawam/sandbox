import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/interface/item';
import { ItemSearchService } from 'src/app/service/items/item-search.service';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.css']
})
export class ItemSearchComponent implements OnInit {

  private href: string = '';

  private code: string = '';

  private accessToken: string = '';

  items: Item[] = null;

  constructor(private readonly router: Router, private readonly itemSearchService: ItemSearchService) { }

  async ngOnInit(): Promise<void> {
    this.href = this.router.url;
    console.log('Show the URL now.');
    console.log(this.href);
    this.code = decodeURIComponent(this.href.split('?')[1].split('=')[1]);
    console.log('Show the code from IDCS.(URI Decoded)');
    console.log(this.code);
    await this.itemSearchService.getAccessToken(this.code).then(data => {
      this.accessToken = data.access_token;
      console.log('Show Access Token.');
      console.log(this.accessToken);
    }).catch(error => {
      throw new Error(error)
    });
  }

  async itemSearch(): Promise<void> {
    await this.itemSearchService.getAllItems().then(data => {
      console.log('Show Response Body.');
      console.log(data);
      this.items = data;
    }).catch(error => {
      throw new Error(error);
    });
  }

}
