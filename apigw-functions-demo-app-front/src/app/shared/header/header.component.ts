import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
  }

  goItemSearch(): void {
    this.router.navigate(['item-search']);
  }

  goItemCreate(): void {
    this.router.navigate(['item-create']);
  }

}
