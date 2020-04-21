import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private headerData = new BehaviorSubject<string>('Initial Title');
  header = this.headerData.asObservable();

  constructor() { }

  setHeader(title: string) {
    this.headerData.next(title);
  }
}
