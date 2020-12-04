import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignUpComponent } from './sign-up.component';
import { SignUpService } from 'src/app/services/sign-up.service';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [SignUpComponent],
  imports: [
    CommonModule,
    FormsModule,
  ],
  providers: [SignUpService]
})
export class SignUpModule { }
