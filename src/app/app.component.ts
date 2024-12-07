import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet
  ],
  standalone: true,
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'dippier-frontend';
}
