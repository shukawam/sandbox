import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInComponent } from './sign-in.component';
import { FormsModule } from '@angular/forms';
import { SignInService } from 'src/app/services/sign-in.service';



@NgModule({
  declarations: [SignInComponent],
  imports: [
    CommonModule,
    FormsModule,
  ],
  providers: [SignInService]
})
export class SignInModule { }
