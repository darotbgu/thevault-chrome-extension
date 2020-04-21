import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {User} from '../modles/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  firstName: string;
  lastName: string;


  constructor(private authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnInit(): void {
    const userData = localStorage.getItem(this.authenticationService.userKey);
    if (!userData){
      this.router.navigate(['/login']);
    }
    const user: User = JSON.parse(userData);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }

  public logout(event){
    this.authenticationService.logout().subscribe(value => {
      this.router.navigate(['/login']);
    });

  }
}
