import { Component, OnInit } from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // TODO: redirect to home if user already logged in
  }

  ngOnInit(): void {

  }

  onSubmit(): void{
    return;
  }

}
