import { Component, OnInit } from '@angular/core';
import {HeaderService} from '../../services/header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  header = '';
  constructor(private headerService: HeaderService) { }

  ngOnInit(): void {
    this.headerService.header.subscribe(newHeader => {
      this.header = newHeader;
    });
  }

}
