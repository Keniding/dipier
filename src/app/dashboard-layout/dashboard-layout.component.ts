import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import {HeaderComponent} from "../common/header/header.component";
import {FooterComponent} from "../common/footer/footer.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent],
  standalone: true,
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent {}
