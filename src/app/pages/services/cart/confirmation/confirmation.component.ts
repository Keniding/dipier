import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  @Output() prevStepEvent = new EventEmitter<void>();

  onPrevStep(): void {
    this.prevStepEvent.emit();
  }
}
