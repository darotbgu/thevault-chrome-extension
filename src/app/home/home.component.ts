import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {User} from '../modles/user';
import {HeaderService} from '../services/header.service';
import {MessageService} from 'primeng/api';
import {AuthDataService} from '../services/auth-data.service';
import {AuthData} from '../modles/auth-data';
import {EncryptionService} from '../services/encryption.service';
import {EncryptionKey} from '../modles/encryption-key';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = false;
  userAuthData: AuthData[];
  user: User;
  encKeys;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private headerService: HeaderService,
              private messageService: MessageService,
              private authDataService: AuthDataService,
              private encryptionService: EncryptionService) {

    this.loading = false;
    const userData = localStorage.getItem(this.authenticationService.userKey);
    if (!userData){
      this.router.navigate(['/login']);
    }
    this.user = JSON.parse(userData);
    this.headerService.setHeader(`Welcome ${this.user.firstName} ${this.user.lastName}!`);
    this.encKeys = this.encryptionService.getKeys();
    this.authDataService.getAuthsData().subscribe(res => {
      if (res.success) {
        this.tryDecryptAuthsData(res.data);
        this.userAuthData = res.data;
        localStorage.setItem('authData', JSON.stringify(this.userAuthData));
        const message = {name: 'user-data', user: this.user, authData: this.userAuthData, encKeys: this.encKeys};
        chrome.runtime.sendMessage(message);
        console.log('sentMessage');
      }
      else {
        this.messageService.add({key: 'message', severity: 'error', summary: 'Error Message', detail: res.msg});
      }
    });

  }

  ngOnInit(): void {}

  public logout(event){
    this.loading = true;
    this.messageService.clear();
    this.messageService.add({key: 'confirm', sticky: true, severity: 'warn', summary: 'Are you sure?', detail: 'Confirm to proceed'});
  }

  onConfirm() {
    this.messageService.clear('confirm');
    this.authenticationService.logout().subscribe(
      data => {
        // todo: clear extension data
      this.router.navigate(['/login']);
      this.loading = false;
    },
      error => {this.loading = false; });
  }

  onReject() {
    this.messageService.clear('confirm');
    this.loading = false;
  }


  private tryDecryptAuthsData(data: AuthData[]){
    data.forEach(authData => {
      try {
        this.encryptionService.decryptMessage(authData.username);
        this.encryptionService.decryptMessage(authData.password);
      }
      catch (e) {
        this.messageService.add({key: 'message', severity: 'error', summary: 'Corrupted Data', detail: e.message});
      }
    });
  }
}
