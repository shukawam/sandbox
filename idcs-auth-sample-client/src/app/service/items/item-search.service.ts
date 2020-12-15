import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetAccessTokenResponseBody } from 'src/app/interface/get-access-token-response-body';
import { Item } from 'src/app/interface/item';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemSearchService {

  constructor(private readonly httpClient: HttpClient) { }

  async getAccessToken(code: string): Promise<GetAccessTokenResponseBody> {
    console.log('Show the code.');
    console.log(code);
    console.log('Show the Base64Url Encoded credential.');
    console.log(environment.base64url_encoded_credential);
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${environment.base64url_encoded_credential}` // FIXME: base64url.encode(credential)
    });
    const payload: HttpParams = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code);
    return await this.httpClient.post<GetAccessTokenResponseBody>(
      `${environment.idcs_base_url}/oauth2/v1/token`, payload,
      {
        headers: headers,
        responseType: 'json'
      }
    ).toPromise();
  }

  async getAllItems(): Promise<Item[]> {
    return await this.httpClient.get<Item[]>(
      `${environment.item_base}`,
      {
        responseType: 'json'
      }
    ).toPromise();
  }

}
