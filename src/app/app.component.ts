import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgChartsModule } from "ng2-charts";
import {ErrorDisplayComponent} from "./pages/services/error-display/error-display.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgChartsModule,
    ErrorDisplayComponent
  ],
  template: `
    <router-outlet></router-outlet>
    <app-error-display></app-error-display>
  `
})
export class AppComponent {
  title = 'dippier-frontend';
}
