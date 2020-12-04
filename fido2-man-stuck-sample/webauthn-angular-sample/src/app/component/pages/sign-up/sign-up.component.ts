import { Component, OnInit } from '@angular/core';
import { SignUpService } from 'src/app/services/sign-up.service';
import { Router } from '@angular/router';
import { Message } from '../../../common/constants/message';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  // 画面表示項目
  email = '';
  message = '';

  constructor(private readonly signUpService: SignUpService, private readonly router: Router) { }

  ngOnInit(): void {
  }

  /**
   * SignUpボタン押下時のイベントハンドラです。
   */
  async signUp(): Promise<void> {
    if (!this.email) {
      this.message = Message.EMAIL_INPUT_REQUIRED;
      return;
    }
    const isSignUpSuccess = await this.signUpService.signUp(this.email);
    isSignUpSuccess ? this.message = Message.USER_CREATE_SUCCESS : this.message = Message.USER_CREATE_FAILED;
    this.clearForm();
  }

  /**
   * サインインボタン押下時のイベントハンドラです。
   */
  goSignIn(): void {
    this.router.navigate(['/sign-in']);
  }

  /**
   * 入力フォームをクリアします。
   */
  private clearForm(): void {
    this.email = '';
  }

}
