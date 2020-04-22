import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {LoaderService} from '../services/loader.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private messageService: MessageService, private  loaderService: LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request)
      .pipe(catchError((error: HttpErrorResponse) => {
          let errorMessage = '';
          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
          this.loaderService.hide();
          this.messageService.add({key: 'message', severity: 'error', summary: 'Error Message', detail: error.message});
          return throwError(errorMessage);
        })
      );
  }
}
