import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { SignUpModule } from './component/pages/sign-up/sign-up.module';
import { SignInModule } from './component/pages/sign-in/sign-in.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    SignUpModule,
    SignInModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
