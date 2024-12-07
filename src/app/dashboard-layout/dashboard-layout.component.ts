import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import {HeaderComponent} from "../header/header.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  standalone: true,
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent {}
