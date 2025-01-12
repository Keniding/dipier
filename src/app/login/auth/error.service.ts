import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ErrorState {
  show: boolean;
  message: string;
  status?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorState = new BehaviorSubject<ErrorState>({ show: false, message: '' });
  errorState$ = this.errorState.asObservable();

  showError(message: string, status?: number) {
    this.errorState.next({ show: true, message, status });
  }

  hideError() {
    this.errorState.next({ show: false, message: '' });
  }
}
