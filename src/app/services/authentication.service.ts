import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {ResponseData} from '../modles/response-data';
import {User} from '../modles/user';
import {EncryptionService} from './encryption.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  usersUrl = `${environment.baseUrl}/users`;
  userKey = 'user';
  authDataKey = 'artifacts';

  constructor(private httpClient: HttpClient, private encryptionService: EncryptionService) { }

  public register(firstName: string, lastName: string, user: string, masterKey: string): Observable<any>{
    const url =  `${this.usersUrl}/register/`;
    const pass = this.deriveKeysAndGetServerPassword(masterKey);
    const data = {
      username: user,
      password: pass,
      first_name: firstName,
      last_name: lastName
    };
    return this.httpClient.post(url, data);
  }

  public login(user: string, masterKey: string): Observable<ResponseData<User>>{
    const url = `${this.usersUrl}/login/`;
    const pass = this.deriveKeysAndGetServerPassword(masterKey);
    const data = {username: user, password: pass};
    return this.httpClient.post<ResponseData<User>>(url, data)
      .pipe(tap((res) => {
        localStorage.setItem(this.userKey, JSON.stringify(res.data));
      }));
  }

  public logout(): Observable<any>{
     const url = `${this.usersUrl}/logout/`;
     return this.httpClient.get(url).pipe(tap((res) => {
       this.encryptionService.clearKeys();
       localStorage.removeItem(this.userKey);
       localStorage.removeItem(this.authDataKey);
     }));
  }

  public getToken(): string {
    const userData = localStorage.getItem(this.userKey);
    if (!userData){
      return null;
    }
    const user: User = JSON.parse(userData);
    return user.authToken;
  }

  private deriveKeysAndGetServerPassword(masterKey: string){
    this.encryptionService.deriveKeys(masterKey);
    return this.encryptionService.getServerPassword();
  }
}
