import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthUser } from '../interfaces/auth-user';
import base64url from 'base64url';
import { Uri } from '../common/constants/uri';
import { PublicKeyCredentialAuthentication } from '../interfaces/public-key-credential-authentication';
import { AuthenticationResult } from '../interfaces/authentication-result';

@Injectable({
  providedIn: 'root'
})
export class SignInService {

  constructor(private readonly httpClient: HttpClient) { }

  /**
   * ユーザの認証処理を実行します。
   * @param email メールアドレス
   */
  async signIn(email: string): Promise<boolean> {
    // challengeの生成要求
    const loginResponse = await this.httpClient.post<AuthUser>(Uri.USER_LOGIN, { email }, {
      headers: {
        'Content-Type': 'application/json'
      },
      observe: 'response',
    }).toPromise();
    // WebAuthn API呼び出しに必要なパラメータを組み立て
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: base64url.toBuffer(loginResponse.body.data.challenge),
      allowCredentials: [{
        id: base64url.toBuffer(loginResponse.body.data.allowCredentials[0].id),
        type: loginResponse.body.data.allowCredentials[0].type,
        transports: loginResponse.body.data.allowCredentials[0].transports
      }],
    };
    // 明示的にPublicKeyCredentialAuthenticationにキャストする
    const assertionResponse = await this.getCredential(publicKey) as PublicKeyCredentialAuthentication;
    console.log(assertionResponse);
    return await this.validateAssertionResponse(assertionResponse);
  }

  /**
   * 認証器に対してユーザ認証の要求を行います。
   * @param publicKey 認証情報取得オプション
   */
  private async getCredential(publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions): Promise<Credential> {
    return navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });
  }

  /**
   * 認証情報をBase64Urlエンコードして認証サーバにPOSTします。
   * @param publicKeyCredential 認証器から取得した認証情報
   */
  private async validateAssertionResponse(publicKeyCredential: PublicKeyCredentialAuthentication): Promise<boolean> {
    const assertionResponse = await this.httpClient.post<AuthenticationResult>(Uri.ASSERTION_RESPONSE,
      {
        rawId: base64url.encode(Buffer.from(publicKeyCredential.id)),
        response: {
          authenticatorData: base64url.encode(Buffer.from(publicKeyCredential.response.authenticatorData)),
          signature: base64url.encode(Buffer.from(publicKeyCredential.response.signature)),
          clientDataJSON: base64url.encode(Buffer.from(publicKeyCredential.response.clientDataJSON)),
        },
        id: publicKeyCredential.id,
        type: publicKeyCredential.type,
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        observe: 'response'
      }).toPromise();
    return assertionResponse.body.status === 200 ? true : false;
  }
}
