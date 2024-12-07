
import { CartProductItem } from '../../../../models/cart.types';

import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {NgForOf, NgIf, CurrencyPipe, NgOptimizedImage, NgClass} from "@angular/common";
import {ConfirmationDialogComponent} from "./confirmation-dialog.component";

@Component({
  selector: 'app-cart-items',
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    CurrencyPipe,
    ConfirmationDialogComponent
  ],
  templateUrl: './cart-items.component.html',
  standalone: true,
  styleUrl: './cart-items.component.css'
})
export class CartItemsComponent implements OnInit, OnDestroy {
  @Input() cartProducts: CartProductItem[] = [];
  @Output() removeItemEvent = new EventEmitter<string>();
  @Output() updateQuantityEvent = new EventEmitter<{productId: string, quantity: number}>();
  @Output() nextStepEvent = new EventEmitter<void>();
  @Output() clearCartEvent = new EventEmitter<void>();

  showDeleteDialog = false;
  productToDelete: CartProductItem | null = null;

  protected readonly defaultImageUrl = 'https://via.placeholder.com/50';
  isLoading = true;
  private updateTimers: Map<string, NodeJS.Timeout> = new Map();

  ngOnInit() {
    console.log('CartProducts recibidos:', this.cartProducts);

    this.cartProducts = this.cartProducts.map(product => ({
      ...product,
      imageLoaded: false,
      imageError: false,
      imageUrl: product.imageUrl || this.defaultImageUrl,
      updating: false
    }));

    this.isLoading = false;
  }

  ngOnDestroy() {
    this.updateTimers.forEach(timer => clearTimeout(timer));
    this.updateTimers.clear();
  }

  onImageLoad(product: CartProductItem): void {
    product.imageLoaded = true;
    product.imageError = false;
    product.imageLoading = false;
  }

  onImageError(product: CartProductItem): void {
    product.imageError = true;
    product.imageLoaded = false;
    product.imageLoading = false;
    product.imageUrl = this.defaultImageUrl;
  }

  handleQuantityChange(product: CartProductItem, newQuantity: number): void {
    if (newQuantity < 1 || product.updating) return;

    if (this.updateTimers.has(product.id)) {
      clearTimeout(this.updateTimers.get(product.id));
      this.updateTimers.delete(product.id);
    }

    product.updating = true;
    product.error = undefined;

    const timer = setTimeout(() => {
      if (product.updating) {
        product.error = 'La actualización está tardando más de lo esperado...';
      }
      this.updateTimers.delete(product.id);
    }, 5000);

    this.updateTimers.set(product.id, timer);

    this.updateQuantityEvent.emit({
      productId: product.productId,
      quantity: newQuantity
    });

    setTimeout(() => {
      this.totalChanged.emit(this.calculateTotal());
    });
  }

  onRemoveItem(productId: string): void {
    const product = this.cartProducts.find(p => p.id === productId);
    if (product && !product.updating) {
      product.updating = true;
      this.removeItemEvent.emit(productId);
    }
  }

  onNextStep(): void {
    if (!this.hasUpdatingItems()) {
      this.nextStepEvent.emit();
    }
  }

  @Output() totalChanged = new EventEmitter<number>();

  calculateTotal(): number {
    const total = this.cartProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
    this.totalChanged.emit(total);
    return total;
  }

  hasUpdatingItems(): boolean {
    return this.cartProducts.some(product => product.updating);
  }

  openDeleteDialog(product: CartProductItem): void {
    console.log('Opening delete dialog for product:', product);
    if (!product.updating) {
      this.productToDelete = product;
      this.showDeleteDialog = true;
      console.log('Dialog state:', { showDeleteDialog: this.showDeleteDialog, productToDelete: this.productToDelete });
    }
  }

  onCancelDelete(): void {
    console.log('Canceling delete');
    this.showDeleteDialog = false;
    this.productToDelete = null;
  }

  onConfirmDelete(): void {
    console.log('Confirming delete');
    if (this.productToDelete) {
      console.log('Removing item with ID:', this.productToDelete.id);
      this.removeItemEvent.emit(this.productToDelete.id);
      this.showDeleteDialog = false;
      this.productToDelete = null;
      const total = this.calculateTotal();
      console.log('Total calculado para el pago:', total);
    }
  }
}
