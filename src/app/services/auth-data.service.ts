import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {ResponseData} from '../modles/response-data';
import {AuthData} from '../modles/auth-data';

@Injectable({
  providedIn: 'root'
})
export class AuthDataService {
  authDataUrl = `${environment.baseUrl}/artifacts/`;
  constructor(private httpClient: HttpClient) { }

  getAuthsData(): Observable<ResponseData<AuthData[]>>{
    const url = this.authDataUrl;
    return this.httpClient.get<ResponseData<AuthData[]>>(url);
  }
}
