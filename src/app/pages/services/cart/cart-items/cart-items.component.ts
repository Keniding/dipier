interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'EXPIRED';
  createdDate: Date;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  address: string;
  allergies: string[];
  chronicConditions: string[];
  lastVisit: Date;
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './cart-items.component.html',
  styleUrl: './cart-items.component.css'
})
export class CartItemsComponent {
  @Input() cartItems: CartItem[] = [];
  @Output() removeItemEvent = new EventEmitter<string>();
  @Output() nextStepEvent = new EventEmitter<void>();

  onRemoveItem(itemId: string): void {
    this.removeItemEvent.emit(itemId);
  }

  onNextStep(): void {
    this.nextStepEvent.emit();
  }

  totalPrice(): number {
    return 0;
    // return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
