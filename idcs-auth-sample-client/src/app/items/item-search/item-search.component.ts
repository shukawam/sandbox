import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

}
