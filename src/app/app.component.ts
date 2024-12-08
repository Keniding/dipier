import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {NgChartsModule} from "ng2-charts";

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NgChartsModule
  ],
  standalone: true,
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'dippier-frontend';
}
