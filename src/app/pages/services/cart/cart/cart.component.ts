import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProgressStepsComponent } from "../progress-steps/progress-steps.component";
import { CartItemsComponent } from "../cart-items/cart-items.component";
import { PaymentMethodComponent } from "../payment-method/payment-method.component";
import { ConfirmationComponent } from "../confirmation/confirmation.component";
import { NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartServiceServiceBusiness } from "../../../../services/business/cart-service-business.service";
import { CartService } from "../../../../services/cart.service";
import { Subscription, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    ProgressStepsComponent,
    CartItemsComponent,
    NgIf,
    PaymentMethodComponent,
    ConfirmationComponent,
    RouterLink
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  currentStep: number = 1;
  cartItems: CartItem[] = [];
  private subscription: Subscription = new Subscription();
  customerId: string | null = null;
  cart: Cart | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private cartServiceBusiness: CartServiceServiceBusiness,
    private cartService: CartService
    ) {}

  ngOnInit() {
    this.subscription = this.cartServiceBusiness.currentCustomerId.subscribe(id => {
      if (id) {
        this.customerId = id;
        this.loadCartData(id);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadCartData(customerId: string) {
    this.loading = true;
    this.error = null;

    forkJoin({
      cart: this.cartService.getCart(customerId),
      items: this.cartService.getCartItems(customerId)
    }).pipe(
      catchError(error => {
        console.error('Error loading cart data:', error);
        this.error = 'Error al cargar los datos del carrito';
        throw error;
      })
    ).subscribe({
      next: (data) => {
        this.cart = data.cart;
        this.cartItems = data.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  removeItem(itemId: string): void {
    if (this.customerId) {
      this.cartService.removeItemFromCart(this.customerId, itemId).subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        },
        error: (error) => {
          console.error('Error removing item:', error);
        }
      });
    }
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
    this.nextStep();
  }
}
