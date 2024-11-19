// confirmation.component.ts
import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  @Input() invoiceId: string | null = null;
  @Input() totalAmount: number = 0;
  @Output() prevStepEvent = new EventEmitter<void>();

  onPrevStep(): void {
    this.prevStepEvent.emit();
  }
}
