import { Component } from '@angular/core';
import {LoaderService} from './services/loader.service';
import {Observable, Subject} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'thevault-chrome-extension';

  showSpinner: Observable<boolean>;

  constructor(private loadingService: LoaderService) {
    this.showSpinner = this.loadingService.isLoading;
  }
}
