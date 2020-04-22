import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {ResponseData} from '../modles/responseData';
import {User} from '../modles/user';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  usersUrl = `${environment.baseUrl}/users`;
  userKey = 'user';

  constructor(private httpClient: HttpClient) { }

  public register(firstName: string, lastName: string, user: string, pass: string): Observable<any>{
    const url =  `${this.usersUrl}/register/`;
    const data = {
      username: user,
      password: pass,
      first_name: firstName,
      last_name: lastName
    };
    return this.httpClient.post(url, data);
  }

  public login(user: string, pass: string): Observable<ResponseData<User>>{
    const url = `${this.usersUrl}/login/`;
    const data = {username: user, password: pass};
    return this.httpClient.post<ResponseData<User>>(url, data)
      .pipe(tap((res) => {
        localStorage.setItem(this.userKey, JSON.stringify(res.data));
      }));
  }

  public logout(): Observable<any>{
     const url = `${this.usersUrl}/logout/`;
     return this.httpClient.get(url).pipe(tap((res) => {
       localStorage.removeItem(this.userKey);
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
}
