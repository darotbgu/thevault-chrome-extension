import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';
import {MessageService} from 'primeng/api';
import {HeaderService} from '../services/header.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private headerService: HeaderService,
              private messageService: MessageService) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  ngOnInit(): void {
    this.headerService.setHeader('Register');
    this.submitted = false;
    this.loading = false;
  }

  onSubmit(): void{
    // todo: need submitted??
    this.submitted = true;
    if (this.registerForm.invalid){
      return;
    }
    this.loading = true;
    const firstName = this.registerForm.controls.firstName.value;
    const lastName = this.registerForm.controls.lastName.value;
    const username = this.registerForm.controls.username.value;
    const password = this.registerForm.controls.password.value;
    this.authenticationService.register(firstName, lastName, username, password).subscribe(
      data => {
        this.router.navigate(['/login']);
      },
      error => {
        this.loading = false;
      });
  }
}
