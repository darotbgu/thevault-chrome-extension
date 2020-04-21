import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {User} from '../modles/user';
import {HeaderService} from '../services/header.service';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = false;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private headerService: HeaderService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.loading = false;
    const userData = localStorage.getItem(this.authenticationService.userKey);
    if (!userData){
      this.router.navigate(['/login']);
    }
    const user: User = JSON.parse(userData);
    this.headerService.setHeader(`Welcome ${user.firstName} ${user.lastName}!`);
  }

  public logout(event){
    this.loading = true;
    this.messageService.clear();
    this.messageService.add({key: 'confirm', sticky: true, severity: 'warn', summary: 'Are you sure?', detail: 'Confirm to proceed'});
  }

  onConfirm() {
    this.messageService.clear('confirm');
    this.authenticationService.logout().subscribe(value => {
      this.router.navigate(['/login']);
      this.loading = false;
    });
  }

  onReject() {
    this.messageService.clear('confirm');
    this.loading = false;
  }
}
