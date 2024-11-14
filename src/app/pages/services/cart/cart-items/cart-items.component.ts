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

interface CartProductItem extends Producto, CartItem {
  updating?: boolean;
  error?: string;
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgForOf, NgIf, CurrencyPipe } from "@angular/common";

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    CurrencyPipe
  ],
  templateUrl: './cart-items.component.html',
  styleUrl: './cart-items.component.css'
})
export class CartItemsComponent {
  @Input() cartProducts: CartProductItem[] = [];
  @Output() removeItemEvent = new EventEmitter<string>();
  @Output() updateQuantityEvent = new EventEmitter<{productId: string, quantity: number}>();
  @Output() nextStepEvent = new EventEmitter<void>();

  handleQuantityChange(product: CartProductItem, newQuantity: number): void {
    if (newQuantity < 1 || product.updating) return;

    const originalQuantity = product.quantity;
    product.updating = true;
    product.error = undefined;
    product.quantity = newQuantity;

    this.updateQuantityEvent.emit({
      productId: product.id,
      quantity: newQuantity
    });

    const timer = setTimeout(() => {
      if (product.updating) {
        product.error = 'La actualización está tardando más de lo esperado...';
      }
    }, 5000);

    // Simulación de respuesta del servidor
    setTimeout(() => {
      clearTimeout(timer);
      if (Math.random() > 0.5) {
        product.updating = false;
        product.error = undefined;
      } else {
        product.quantity = originalQuantity;
        product.error = 'Error al actualizar la cantidad';
        product.updating = false;
      }
    }, 2000 + Math.random() * 4000);
  }

  onRemoveItem(productId: string): void {
    this.removeItemEvent.emit(productId);
  }

  onNextStep(): void {
    this.nextStepEvent.emit();
  }

  calculateTotal(): number {
    return this.cartProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }

  hasUpdatingItems(): boolean {
    return this.cartProducts.some(product => product.updating);
  }
}
