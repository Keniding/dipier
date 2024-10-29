import { Component } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartItems: CartItem[] = [
    { id: 1, name: 'Paracetamol', price: 10, quantity: 2 },
    { id: 2, name: 'Ibuprofeno', price: 15, quantity: 1 },
  ];

  currentStep: number = 1; // Paso inicial

  totalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  removeItem(id: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  confirmPayment(): void {
    this.currentStep = 3;
  }
}
