import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartServiceServiceBusiness {
  private selectedCustomerId = new BehaviorSubject<string | null>(null);
  currentCustomerId = this.selectedCustomerId.asObservable();

  setCustomerId(id: string) {
    this.selectedCustomerId.next(id);
  }

  clearCustomerId() {
    this.selectedCustomerId.next(null);
  }
}
