import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-progress-steps',
  standalone: true,
  imports: [],
  templateUrl: './progress-steps.component.html',
  styleUrl: './progress-steps.component.css'
})
export class ProgressStepsComponent {
  @Input() currentStep: number = 1;
}
