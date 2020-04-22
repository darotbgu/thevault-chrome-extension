import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  loaderData = new Subject<boolean>();
  isLoading = this.loaderData.asObservable();

  constructor() { }

  show() {
    this.loaderData.next(true);
  }
  hide() {
    this.loaderData.next(false);
  }
}
