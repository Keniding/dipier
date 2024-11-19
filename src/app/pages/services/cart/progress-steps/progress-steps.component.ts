import {Component, Input} from '@angular/core';
import {CommonModule, NgStyle} from "@angular/common";

@Component({
  selector: 'app-progress-steps',
  standalone: true,
  imports: [
    NgStyle,
    CommonModule
  ],
  templateUrl: './progress-steps.component.html',
  styleUrl: './progress-steps.component.css'
})
export class ProgressStepsComponent {
  @Input() currentStep: number = 1;
}
