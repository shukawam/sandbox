import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user';
import base64url from 'base64url';
import { PublicKeyCredential } from '../interfaces/public-key-credential';
import { Uri } from '../common/constants/uri';
import { RegistrationResult } from '../interfaces/registration-result';

/**
 * ユーザ登録処理のサービスクラスです。
 */
@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private readonly httpClient: HttpClient) { }

  /**
   * ユーザの登録処理を実行します。
   * @param email メールアドレス
   */
  async signUp(email: string): Promise<boolean> {
    // challengeの生成要求
    const registerResponse = await this.createChallenge(email);
    // `navigator.credentials.create()呼び出しのために必要なパラメータの組み立て
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: Buffer.from(base64url.decode(registerResponse.data.challenge)),
      rp: registerResponse.data.rp,
      user: {
        id: Buffer.from(base64url.decode(registerResponse.data.user.id)),
        name: registerResponse.data.user.name,
        displayName: registerResponse.data.user.displayName,
      },
      attestation: registerResponse.data.attestation,
      pubKeyCredParams: [{
        type: 'public-key' as 'public-key',
        alg: -7,
      }],
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        requireResidentKey: false,
        userVerification: 'discouraged'
      }
    };
    // 明示的にPublicKeyCredentialにキャストする
    const attestationObject = await this.createAttestationObject(publicKeyCredentialCreationOptions) as PublicKeyCredential;
    console.log(attestationObject);
    // 公開鍵をサーバに送信する
    return this.registerPublicKey(attestationObject);
  }

  /**
   * WebAuthn認証サーバに対して、チャレンジの生成要求を行います。
   * @param email メールアドレス
   */
  private async createChallenge(email: string): Promise<User> {
    const registerResponse = await this.httpClient.post<User>(Uri.USER_REGISTER, { email }, {
      headers: {
        'Content-Type': 'application/json'
      },
      observe: 'response',
    }).toPromise();
    console.log(registerResponse.body);
    return registerResponse.body;
  }

  /**
   * 認証器に対して公開鍵の生成要求を行います。
   * @param publicKeyCreationOptions 認証情報生成オプション
   */
  private async createAttestationObject(publicKeyCreationOptions: PublicKeyCredentialCreationOptions): Promise<Credential> {
    return navigator.credentials.create({
      publicKey: publicKeyCreationOptions
    });
  }

  /**
   * 認証情報をBase64Urlエンコードして認証サーバにPOSTします。
   * @param credential 認証器で生成した認証情報
   */
  private async registerPublicKey(publicKeyCredential: PublicKeyCredential): Promise<boolean> {
    const attestationResponse = await this.httpClient.post<RegistrationResult>(Uri.ATTESTATION_RESPONSE,
      {
        rawId: base64url.encode(Buffer.from(publicKeyCredential.rawId)),
        response: {
          attestationObject: base64url.encode(Buffer.from(publicKeyCredential.response.attestationObject)),
          clientDataJSON: base64url.encode(Buffer.from(publicKeyCredential.response.clientDataJSON)),
        },
        id: publicKeyCredential.id,
        type: publicKeyCredential.type
      }, {
      headers: {
        'Content-Type': 'application/json'
      },
      observe: 'response'
    }).toPromise();
    return attestationResponse.body.status === 201 ? true : false;
  }
}
