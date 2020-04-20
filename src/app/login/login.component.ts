import { Component, OnInit } from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../services/authentication.service';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private messageService: MessageService) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // TODO: redirect to home if user already logged in
  }

  ngOnInit(): void {
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
          console.log(data.msg);
       // this.messageService.add({severity: 'success', summary: 'Login Message', detail: data.msg});
    },
        error => {
      this.loading = false;
      });
  }

}
