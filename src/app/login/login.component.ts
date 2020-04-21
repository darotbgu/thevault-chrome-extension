import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../services/authentication.service';
import {MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {HeaderService} from '../services/header.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private headerService: HeaderService,
              private messageService: MessageService) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    if (localStorage.getItem(this.authenticationService.userKey)){
      this.router.navigate(['/']);
    }

  }

  ngOnInit(): void {
    this.headerService.setHeader('Login');
    this.submitted = false;
    this.loading = false;
  }

  onSubmit(): void{
    // todo: need submitted??
    this.submitted = true;
    if (this.loginForm.invalid){
      return;
    }
    this.loading = true;
    const username = this.loginForm.controls.username.value;
    const password = this.loginForm.controls.password.value;
    this.authenticationService.login(username, password).subscribe(
      data => {
          this.router.navigate(['/']);
        },
        error => {
      this.loading = false;
      });
  }

}
