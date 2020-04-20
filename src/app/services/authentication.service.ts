import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  usersUrl = '/users';

  constructor(private httpClient: HttpClient) { }

  public register(user: string, pass: string, firstName: string, lastName: string): Observable<any>{
    const url =  `{$baseUrl}{this.usersUrl}/register`;
    const data = {
      username: user,
      password: pass,
      first_name: firstName,
      last_name: lastName
    };
    return this.httpClient.post(url, data);
  }

  public login(user: string, pass: string): Observable<any>{
    const url = `{$baseUrl}{$this.usersUrl}/login`;
    const data = {username: user, password: pass};
    return this.httpClient.post(url, data);
  }

  public logout(): Observable<any>{
     const url = `{$baseUrl}{this.usersUrl}/logout`;
     return this.httpClient.get(url);
  }
}
