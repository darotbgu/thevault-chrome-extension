import { Injectable } from '@angular/core';
import {EncryptionService} from './encryption.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {ResponseData} from '../modles/response-data';
import {AuthData} from '../modles/auth-data';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthDataService {
  authDataUrl = `${environment.baseUrl}/authentications/`;
  constructor(private httpClient: HttpClient, private encryptionService: EncryptionService) { }

  getEncryptionKeys() {
    return this.encryptionService.getKeys();
  }

  getAuthsData(): Observable<ResponseData<AuthData[]>>{
    const url = this.authDataUrl;
    return this.httpClient.get<ResponseData<AuthData[]>>(url);
      // .pipe<ResponseData<AuthData[]>>(
      //   map( res => {
      //       if (res.success){
      //         this.decryptAuthsData(res.data);
      //       }
      //       return res;
      //   })
      // );
  }

  storeAuthData(site: string, user: string, pass: string): Observable<ResponseData<AuthData[]>>{
    const url = this.authDataUrl;
    const data = {
      site_name: site,
      username: this.encryptionService.encryptMessage(user),
      password: this.encryptionService.encryptMessage(pass)
    };
    return this.httpClient.post<ResponseData<AuthData[]>>(url, data);
  }

  updateAuthData(siteId: string, user: string, pass: string): Observable<ResponseData<AuthData>>{
   const url = `${this.authDataUrl}${siteId}/`;
   const data = {
     username: this.encryptionService.encryptMessage(user),
     password: this.encryptionService.encryptMessage(pass)
   };
   return this.httpClient.post<ResponseData<AuthData>>(url, data);
  }

  private decryptAuthsData(data: AuthData[]){
      data.forEach(authData => {
        authData.username = this.encryptionService.decryptMessage(authData.username);
        authData.password = this.encryptionService.decryptMessage(authData.password);
      });
  }
}
