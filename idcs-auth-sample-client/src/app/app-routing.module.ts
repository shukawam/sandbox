import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ItemCreateComponent } from './items/item-create/item-create.component';
import { ItemSearchComponent } from './items/item-search/item-search.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'item-search', component: ItemSearchComponent },
  { path: 'item-create', component: ItemCreateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
