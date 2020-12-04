import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignUpComponent } from './component/pages/sign-up/sign-up.component';
import { SignInComponent } from './component/pages/sign-in/sign-in.component';


const routes: Routes = [
  { path: '', redirectTo: '/sign-up', pathMatch: 'full' },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'sign-in', component: SignInComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
