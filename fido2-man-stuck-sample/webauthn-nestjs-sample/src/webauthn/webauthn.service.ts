import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserCreationOptions } from 'src/interface/user-creation-options.interface';
import { v4 as uuid } from 'uuid';
import base64url from 'base64url';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/interface/user.interface';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { Decoder } from 'cbor';
import { CborParseAttestationObject } from 'src/interface/cbor-parse-attestation-object.interface';
import { CborParseAuthData } from 'src/interface/cbor-parse-auth-data.interface';
import * as crypto from 'crypto';
import { DecodedClientDataJson } from 'src/interface/decoded-client-data-json.interface';
import { VerifiedAuthenticatorAttestationResponse } from 'src/interface/verified-authenticator-attestation-response.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { UserAuthenticationOption } from 'src/interface/user-authentication-option.interface';
import { AuthenticationCredentialDto } from './dto/authentication-credential-dto';
import { CborParseAssertionObject } from 'src/interface/cbor-parse-assertion-object.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebauthnService {

  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private readonly configServise: ConfigService,
  ) { }

  /**
   * 認証器が鍵の生成に必要なパラメータを生成します。
   * @param createUserDto リクエストボディー
   */
  async generateServerMakeCredRequest(createUserDto: CreateUserDto): Promise<UserCreationOptions> {
    // challengeをuuid(v4) を元に生成する
    const challenge = base64url.encode(Buffer.from(Uint8Array.from(uuid(), c => c.charCodeAt(0))));
    // user.idをuuid(v4)を元に生成する
    const userId = base64url.encode(Buffer.from(Uint8Array.from(uuid(), c => c.charCodeAt(0))));
    // UserCreationOptionsのパラメータを組み立てる
    const userCreationOptions: UserCreationOptions = {
      email: createUserDto.email,
      challenge,
      rp: {
        name: this.configServise.get('RP_NAME'),
      },
      user: {
        id: userId,
        name: createUserDto.email,
        displayName: createUserDto.email,
      },
      attestation: 'direct',
    };
    // DBに保存する
    const saveResult = await this.saveUser(userCreationOptions);
    // falsyだった場合、nullを返却する
    if (!saveResult) {
      return null;
    }
    return userCreationOptions;
  }

  /**
   * 認証器が生成した認証情報の検証を行います。
   * @param createCredentialDto 認証器が生成した認証情報
   */
  async isValidCredential(createCredentialDto: CreateCredentialDto): Promise<boolean> {
    // clientDataJSONをデコードし、JSON形式にパースする
    const clientData: DecodedClientDataJson = JSON.parse(base64url.decode(createCredentialDto.response.clientDataJSON));
    // originの検証を行う
    if (clientData.origin !== this.configServise.get('ORIGIN')) {
      // do something
    }
    // challengeの検証を行う
    const count = await this.userModel.findOne({ challenge: clientData.challenge }).count();
    if (count === 0) {
      // do something
    }
    // attestationObjectの検証を行う
    const validateResult = await this.verifyAuthenticatorAttestationResponse(createCredentialDto);
    // 公開鍵をDBに登録する
    await this.userModel.findOneAndUpdate({ challenge: clientData.challenge },
      { $set: { id: createCredentialDto.id, authInfo: validateResult.authInfo } }, error => {
        if (error) {
          throw new Error('Update failed.');
        }
      });
    return validateResult.verified;
  }

  /**
   * ユーザの認証処理のためにchallengeを新規に生成します。
   * @param loginUserDto リクエストボディー
   */
  async generateServerGetAssertion(loginUserDto: LoginUserDto): Promise<UserAuthenticationOption> {
    // ユーザが登録済みかどうかチェックする
    const count = await this.userModel.findOne({ email: loginUserDto.email }).count();
    if (count === 0) {
      // do something
      Logger.error(`User ${loginUserDto.email} does not exist!`);
    }
    // 認証用にchallengeを生成する
    const challenge = base64url.encode(Buffer.from(Uint8Array.from(uuid(), c => c.charCodeAt(0))));
    // 認証用に生成したchallengeをDBに保存する
    await this.userModel.updateOne({ email: loginUserDto.email }, { $set: { challenge } }).exec();
    const user = await this.userModel.findOne({ email: loginUserDto.email }).exec();
    if (!user) {
      return null;
    }
    Logger.log(user, 'generateServerGetAssertion', true);
    // DBに保存されている公開鍵、challngeを使用して、レスポンス用のパラメータを組み立てる
    return {
      challenge: user.challenge,
      allowCredentials: [{
        type: 'public-key',
        id: user.id,
        transports: [
          'usb',
          'nfc',
          'ble',
        ],
      }],
    };
  }

  /**
   * 認証器から取得した情報の検証を行います。
   * @param authenticationCredewntialDto リクエストボディー
   */
  async isValidCredentialForAuthentication(authenticationCredentialDto: AuthenticationCredentialDto): Promise<boolean> {
    // clientDataJSONをデコードし、JSON形式にパースする
    const clientData: DecodedClientDataJson = JSON.parse(base64url.decode(authenticationCredentialDto.response.clientDataJSON));
    // originの検証
    if (clientData.origin !== this.configServise.get('ORIGIN')) {
      // do something
      Logger.error('origin is not correct!');
    }
    // challengeの検証
    const count = await this.userModel.findOne({ challenge: clientData.challenge }).count();
    if (count === 0) {
      // do something
      Logger.error('challenge is not correct!');
    }
    // assertionResponseの検証を行う
    const validResult = await this.verifyAuthenticatorAssertionResponse(authenticationCredentialDto);
    return validResult.verified;
  }

  /**
   * ユーザをDBに保存します。
   * @param userCreationOptions ユーザの認証情報
   */
  private async saveUser(userCreationOptions: UserCreationOptions): Promise<User> {
    // ユーザが保存済みがどうか確認する
    const userCount = await this.userModel.find({ email: userCreationOptions.email }).count();
    if (userCount !== 0) {
      // do something
    }
    return new this.userModel(userCreationOptions).save();
  }

  /**
   * AttestationObjectの検証を行います。
   * @param createCredentialDto 認証器が生成した認証データ
   */
  private async verifyAuthenticatorAttestationResponse(createCredentialDto: CreateCredentialDto): Promise<VerifiedAuthenticatorAttestationResponse> {
    // 認証器でbase64urlエンコードされているので、認証サーバでデコードする
    const attestationBuffer = base64url.toBuffer(createCredentialDto.response.attestationObject);
    // attestationObjectをCBORデコードする
    const ctapMakeCredentialResponse: CborParseAttestationObject = Decoder.decodeAllSync(attestationBuffer)[0];
    const response: VerifiedAuthenticatorAttestationResponse = {
      verified: false,
    };
    if (ctapMakeCredentialResponse.fmt === 'fido-u2f') {
      const authDataStruct = this.parseMakeCredAuthData(ctapMakeCredentialResponse.authData);
      if (!authDataStruct.flags) {
        // do something
      }
      const clientDataHash = this.hash(base64url.toBuffer(createCredentialDto.response.clientDataJSON));
      const reservedByte = Buffer.from([0x00]);
      const publicKey = this.convertCoseEncodedPublicKeyToRawPkcsKey(authDataStruct.cosePublicKey);
      const signatureBase = Buffer.concat([reservedByte, authDataStruct.rpIdHash, clientDataHash, authDataStruct.credID, publicKey]);
      const pemCertificate = this.convertPemTextFormat(ctapMakeCredentialResponse.attStmt.x5c[0]);
      const signature = ctapMakeCredentialResponse.attStmt.sig;
      response.verified = this.verifySignature(signature, signatureBase, pemCertificate);
      const validateResult = this.verifySignature(signature, signatureBase, pemCertificate);
      // Attestation Signatureの有効性を検証する
      return validateResult ? {
        verified: validateResult,
        authInfo: {
          fmt: 'fido-u2f',
          publicKey: base64url.encode(publicKey),
          counter: authDataStruct.counter,
          credId: base64url.encode(authDataStruct.credID),
        },
      } : response;
    }
  }

  /**
   * Assertionの検証を行います。
   * @param authenticationCredewntialDto 認証器から取得した認証データ
   */
  private async verifyAuthenticatorAssertionResponse(authenticationCredewntialDto: AuthenticationCredentialDto) {
    // クライアントから送信されてきた公開鍵のIDがDBに存在しているかチェック
    const authr = await this.userModel.findOne({ id: authenticationCredewntialDto.id }).exec();
    // 認証器でbase64urlエンコードされているので、認証サーバでデコードする
    const authenticatorData = base64url.toBuffer(authenticationCredewntialDto.response.authenticatorData);
    const response = {
      verified: false,
    };
    if (authr.authInfo.fmt === 'fido-u2f') {
      const authDataStruct = this.parseGetAssertionAuthData(authenticatorData);
      if (!authDataStruct.flags) {
        // do something
      }
      const clientDataHash = this.hash(base64url.toBuffer(authenticationCredewntialDto.response.clientDataJSON));
      const signatureBase = Buffer.concat([authDataStruct.rpIdHash, authDataStruct.flagsBuf, authDataStruct.counterBuf, clientDataHash]);
      const publicKey = this.convertPemTextFormat(base64url.toBuffer(authr.authInfo.publicKey));
      const signature = base64url.toBuffer(authenticationCredewntialDto.response.signature);
      response.verified = this.verifySignature(signature, signatureBase, publicKey);
      Logger.log(response.verified);
    }
    return response;
  }

  /**
   * AttestationのAuthDataをCBORパースします。
   * @param authData 認証器の信頼性、セキュリティ等のバイナリデータ
   */
  private parseMakeCredAuthData(authData: Buffer): CborParseAuthData {
    const rpIdHash = authData.slice(0, 32);
    authData = authData.slice(32);
    const flagsBuf = authData.slice(0, 1);
    authData = authData.slice(1);
    const flags = flagsBuf[0];
    const counterBuf = authData.slice(0, 4);
    authData = authData.slice(4);
    const counter = counterBuf.readUInt32BE(0);
    const aaguid = authData.slice(0, 16);
    authData = authData.slice(16);
    const credIDLenBuf = authData.slice(0, 2);
    authData = authData.slice(2);
    const credIDLen = credIDLenBuf.readUInt16BE(0);
    const credID = authData.slice(0, credIDLen);
    authData = authData.slice(credIDLen);
    const cosePublicKey = authData;
    return {
      rpIdHash,
      flagsBuf,
      flags,
      counter,
      counterBuf,
      aaguid,
      credID,
      cosePublicKey,
    } as CborParseAuthData;
  }

  /**
   * AssertionのAuthDataをCBORパースします。
   * @param assertionData 認証器の信頼性、セキュリティ等のバイナリデータ
   */
  private parseGetAssertionAuthData(assertionData: Buffer): CborParseAssertionObject {
    const rpIdHash = assertionData.slice(0, 32);
    assertionData = assertionData.slice(32);
    const flagsBuf = assertionData.slice(0, 1);
    assertionData = assertionData.slice(1);
    const flags = flagsBuf[0];
    const counterBuf = assertionData.slice(0, 4);
    assertionData = assertionData.slice(4);
    const counter = counterBuf.readUInt32BE(0);
    return { rpIdHash, flagsBuf, flags, counter, counterBuf };
  }

  /**
   * COSEエンコードされた公開鍵をPKCS ECDHA Keyに変換します。
   * @param cosePublicKey COSEエンコードされた公開鍵
   */
  private convertCoseEncodedPublicKeyToRawPkcsKey(cosePublicKey: Buffer): Buffer {
    /*
     +------+-------+-------+---------+----------------------------------+
     | name | key   | label | type    | description                      |
     |      | type  |       |         |                                  |
     +------+-------+-------+---------+----------------------------------+
     | crv  | 2     | -1    | int /   | EC Curve identifier - Taken from |
     |      |       |       | tstr    | the COSE Curves registry         |
     |      |       |       |         |                                  |
     | x    | 2     | -2    | bstr    | X Coordinate                     |
     |      |       |       |         |                                  |
     | y    | 2     | -3    | bstr /  | Y Coordinate                     |
     |      |       |       | bool    |                                  |
     |      |       |       |         |                                  |
     | d    | 2     | -4    | bstr    | Private key                      |
     +------+-------+-------+---------+----------------------------------+
  */
    const coseStruct = Decoder.decodeAllSync(cosePublicKey)[0];
    const tag = Buffer.from([0x04]);
    const x = coseStruct.get(-2);
    const y = coseStruct.get(-3);
    return Buffer.concat([tag, x, y]);
  }

  /**
   * バイナリ形式の公開鍵をOpenSSL PEM text形式に変換します。
   * @param publicKeyBuffer バイナリの公開鍵
   */
  private convertPemTextFormat(publicKeyBuffer: Buffer): string {
    if (!Buffer.isBuffer(publicKeyBuffer)) {
      // do something
    }
    let type: any;
    if (publicKeyBuffer.length === 65 && publicKeyBuffer[0] === 0x04) {
      publicKeyBuffer = Buffer.concat([Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex'), publicKeyBuffer]);
      type = 'PUBLIC KEY';
    } else {
      type = 'CERTIFICATE';
    }
    const b64cert = publicKeyBuffer.toString('base64');
    let pemKey = '';
    for (let i = 0; i < Math.ceil(b64cert.length / 64); i++) {
      const start = 64 * i;
      pemKey += b64cert.substr(start, 64) + '\n';
    }
    pemKey = `-----BEGIN ${type}-----\n` + pemKey + `-----END ${type}-----\n`;
    return pemKey;
  }

  /**
   * 署名の妥当性を検証します。
   * @param signature 署名
   * @param data データ
   * @param publicKey 公開鍵
   */
  private verifySignature(signature: Buffer, data: Buffer, publicKey: string): boolean {
    return crypto.createVerify('SHA256')
      .update(data)
      .verify(publicKey, signature);
  }

  /**
   * バイナリデータをSHA256でハッシュ化します。
   * @param data hash化するデータ
   */
  private hash(data: Buffer): Buffer {
    return crypto.createHash('SHA256').update(data).digest();
  }

}
