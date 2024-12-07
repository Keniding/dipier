// home.component.ts
import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { MatButton } from "@angular/material/button";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-home',
  imports: [
    NgClass
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isMenuActive: boolean = false;

  constructor() {}

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }
}
