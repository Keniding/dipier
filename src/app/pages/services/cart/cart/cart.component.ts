import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProgressStepsComponent } from "../progress-steps/progress-steps.component";
import { CartItemsComponent } from "../cart-items/cart-items.component";
import { PaymentMethodComponent } from "../payment-method/payment-method.component";
import { ConfirmationComponent } from "../confirmation/confirmation.component";
import { NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartServiceServiceBusiness } from "../../../../services/business/cart-service-business.service";
import { CartService } from "../../../../services/cart.service";
import {Subscription, forkJoin, map} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {ProductService} from "../../../../services/product.service";

interface CartProductItem extends Producto, CartItem {
  updating?: boolean;
  error?: string;
}

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
  productIds: string[] = [];
  cart: Cart | null = null;
  loading: boolean = false;
  error: string | null = null;
  cartProducts: (Producto & CartItem)[] = [];

  constructor(
    private cartServiceBusiness: CartServiceServiceBusiness,
    private cartService: CartService,
    private productService: ProductService
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
      items: this.cartService.getCartItems(customerId),
      products: this.productService.getProducts()
    }).pipe(
      map(data => {
        const cartProductMap = new Map(data.items.map(item => [item.productId, item]));
        return {
          cart: data.cart,
          cartProducts: data.products
            .filter(product => cartProductMap.has(product.id))
            .map(product => ({
              ...product,
              ...cartProductMap.get(product.id)!
            }))
        };
      }),
      catchError(error => {
        this.handleError(error);
        throw error;
      })
    ).subscribe({
      next: (data) => {
        this.cart = data.cart;
        this.cartProducts = data.cartProducts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    if (this.customerId) {
      this.cartService.updateItemQuantity(this.customerId, productId, quantity).subscribe({
        next: () => {
          const product = this.cartProducts.find(p => p.id === productId);
          if (product) {
            product.quantity = quantity;
          }
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
        }
      });
    }
  }

  removeItem(itemId: string): void {
    if (this.customerId) {
      this.cartService.removeItemFromCart(this.customerId, itemId).subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(item => item.id !== itemId);
          this.cartProducts = this.cartProducts.filter(product =>
            !this.cartItems.some(item => item.productId === product.id)
          );
        },
        error: (error) => {
          console.error('Error removing item:', error);
        }
      });
    }
  }

  get isCartEmpty(): boolean {
    return this.cartProducts.length === 0;
  }

  private handleError(error: any): void {
    this.loading = false;
    if (error.status === 404) {
      this.error = 'No se encontró el carrito';
    } else if (error.status === 401) {
      this.error = 'No está autorizado para ver este carrito';
    } else {
      this.error = 'Error al cargar los datos del carrito';
    }
    console.error('Error details:', error);
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
