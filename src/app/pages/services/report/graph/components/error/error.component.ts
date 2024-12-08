import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle text-red-500 text-xl"></i>
        </div>
        <div class="ml-3">
          <p class="text-red-700">{{ message }}</p>
        </div>
      </div>
    </div>
  `
})
export class ErrorComponent {
  @Input() message: string = '';
}
