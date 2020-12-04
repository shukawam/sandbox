import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignInService } from 'src/app/services/sign-in.service';
import { Message } from 'src/app/common/constants/message';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  email = '';
  message = '';

  constructor(private readonly router: Router, private readonly signInService: SignInService) { }

  ngOnInit(): void {
  }

  async signIn() {
    const signInResult = await this.signInService.signIn(this.email);
    if (signInResult) {
      this.message = Message.USER_AUTHENTICATION_SUCCESS;
      this.clearForm();
    } else {
      this.message = Message.USER_AUTHENTICATION_FAILED;
    }
  }

  goSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

  private clearForm(): void {
    this.email = '';
  }

}
