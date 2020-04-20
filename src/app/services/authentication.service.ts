import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  usersUrl = `${environment.baseUrl}/users`;
  tokenKey = 'auth_token';

  constructor(private httpClient: HttpClient, private messageService: MessageService) { }

  public register(user: string, pass: string, firstName: string, lastName: string): Observable<any>{
    const url =  `${this.usersUrl}/register/`;
    const data = {
      username: user,
      password: pass,
      first_name: firstName,
      last_name: lastName
    };
    return this.httpClient.post(url, data);
  }

  public login(user: string, pass: string): Observable<any>{
    const url = `${this.usersUrl}/login/`;
    const data = {username: user, password: pass};
    return this.httpClient.post(url, data)
      .pipe(tap((res) => {
        localStorage.setItem(this.tokenKey, res.auth_token);
      }));
  }

  public logout(): Observable<any>{
     const url = `${this.usersUrl}/logout/`;
     return this.httpClient.get(url).pipe(tap((res) => {
       localStorage.removeItem(this.tokenKey);
     }));
  }

  // public handleError(err){
  //   this.messageService.add({severity:'error', summary:'Error Message', detail:str(err)})
  // }
}
