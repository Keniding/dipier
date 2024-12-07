import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProgressStepsComponent } from "../progress-steps/progress-steps.component";
import { CartItemsComponent } from "../cart-items/cart-items.component";
import { PaymentMethodComponent } from "../payment-method/payment-method.component";
import { ConfirmationComponent } from "../confirmation/confirmation.component";
import {NgClass, NgIf} from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartServiceServiceBusiness } from "../../../../services/business/cart-service-business.service";
import { CartService } from "../../../../services/cart.service";
import {Subscription, forkJoin, map, delay} from 'rxjs';
import {catchError, finalize} from 'rxjs/operators';
import {ProductService} from "../../../../services/product.service";
import {MinioService} from "../../../../services/minio.service";
import {SearchComponent} from "../cart-items/search/search.component";

import {
  Cart,
  CartItem,
  CartProductItem, CreateCartItem,
  MinioResponseItem,
  Producto
} from '../../../../models/cart.types';
import {PaymentMethod, PaymentMethodService} from "../../../../services/payment.service";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    ProgressStepsComponent,
    CartItemsComponent,
    NgIf,
    PaymentMethodComponent,
    ConfirmationComponent,
    RouterLink,
    NgClass,

    SearchComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  currentStep: number = 1;
  private subscription: Subscription = new Subscription();
  customerId: string | null = null;
  cart: Cart | null = null;
  loading: boolean = false;
  error: string | null = null;
  cartProducts: CartProductItem[] = [];
  private readonly defaultImageUrl = 'https://via.placeholder.com/50';

  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod: PaymentMethod | null = null;
  paymentError: string | null = null;

  lastInvoiceId: string | null = null;
  lastPaymentTotal: number = 0;

  isSearchModalOpen = false;

  constructor(
    private cartServiceBusiness: CartServiceServiceBusiness,
    private cartService: CartService,
    private productService: ProductService,
    private minioService: MinioService,
    private paymentMethodService: PaymentMethodService
  ) {
  }

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
        console.log('Cart data:', data.cart);
        console.log('Cart items:', data.items);
        console.log('Products:', data.products);

        const productsMap = new Map(data.products.map(product => [product.id, product]));

        const cartProducts = data.items
          .filter(item => productsMap.has(item.productId))
          .map(item => {
            const product = productsMap.get(item.productId)!;
            return {
              ...product,
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              imageUrl: this.defaultImageUrl,
              imageLoading: true,
              imageError: false,
              imageLoaded: false,
              updating: false
            };
          });

        return {
          cart: data.cart,
          cartProducts
        };
      }),
      catchError(error => {
        console.error('Error en loadCartData:', error);
        this.handleError(error);
        throw error;
      })
    ).subscribe({
      next: (data) => {
        console.log('Processed cart products:', data.cartProducts);
        this.cart = data.cart;
        this.cartProducts = data.cartProducts;
        this.loadProductImages();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadProductImages() {
    console.log('Iniciando loadProductImages con productos:', this.cartProducts);

    const imageRequests = this.cartProducts.map(product => {
      console.log('Solicitando imagen para productId:', product.productId);
      return this.minioService.getObjectById(product.productId).pipe(
        map((response: MinioResponseItem[]) => {
          console.log('Respuesta de Minio para productId', product.productId, ':', response);
          return {product, response};
        }),
        catchError(error => {
          console.error(`Error loading image for productId ${product.productId}:`, error);
          return [{product, response: null}];
        })
      );
    });

    forkJoin(imageRequests).subscribe({
      next: (results) => {
        console.log('Resultados de todas las imágenes:', results);
        results.forEach((result) => {
          const productToUpdate = this.cartProducts.find(p => p.id === result.product.id);
          if (productToUpdate) {
            if (result.response &&
              Array.isArray(result.response) &&
              result.response.length > 0 &&
              result.response[0].estado === 'exitoso' &&
              result.response[0].url) {
              productToUpdate.imageUrl = result.response[0].url;
              productToUpdate.imageError = false;
              console.log('URL de imagen asignada para productId:', productToUpdate.productId, result.response[0].url);
            } else {
              productToUpdate.imageUrl = this.defaultImageUrl;
              productToUpdate.imageError = true;
              console.log('Usando imagen por defecto para productId:', productToUpdate.productId);
            }
            productToUpdate.imageLoading = false;
          }
        });

        this.cartProducts = [...this.cartProducts];
        console.log('CartProducts actualizados:', this.cartProducts);
      },
      error: (error) => {
        console.error('Error loading product images:', error);
        this.cartProducts = this.cartProducts.map(product => ({
          ...product,
          imageUrl: this.defaultImageUrl,
          imageLoading: false,
          imageError: true
        }));
      }
    });
  }

  updateQuantity(event: { productId: string, quantity: number }): void {
    if (!this.customerId) {
      console.error('No customer ID available');
      return;
    }

    const productToUpdate = this.cartProducts.find(p => p.productId === event.productId);
    if (!productToUpdate) {
      console.error('Product not found:', event.productId);
      return;
    }

    console.log(`Intentando actualizar producto ${event.productId} a cantidad ${event.quantity}`);

    productToUpdate.updating = true;
    productToUpdate.error = undefined;

    this.cartService.updateItemQuantity(this.customerId, event.productId, event.quantity)
      .pipe(
        delay(500),
        finalize(() => {
          productToUpdate.updating = false;
        })
      )
      .subscribe({
        next: () => {
          console.log('Actualización enviada exitosamente');

          productToUpdate.quantity = event.quantity;
          productToUpdate.error = undefined;

          this.verifyUpdate(this.customerId!, productToUpdate.id, event.productId, event.quantity);
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          productToUpdate.error = 'Error al actualizar la cantidad';
        }
      });
  }

  private verifyUpdate(customerId: string, itemId: string, productId: string, expectedQuantity: number): void {
    this.cartService.getCartItems(customerId).subscribe({
      next: (items) => {
        const updatedItem = items.find(item =>
          item.id === itemId && item.productId === productId
        );

        console.log('Verificación de actualización:', {
          itemId,
          productId,
          expectedQuantity,
          items,
          foundItem: updatedItem
        });

        if (updatedItem) {
          if (updatedItem.quantity !== expectedQuantity) {
            console.warn('¡La cantidad en la base de datos no coincide con la cantidad esperada!', {
              expected: expectedQuantity,
              actual: updatedItem.quantity
            });

            const productInCart = this.cartProducts.find(p => p.id === itemId);
            if (productInCart) {
              productInCart.quantity = updatedItem.quantity;
            }
          } else {
            console.log('Verificación exitosa: la cantidad coincide con lo esperado');
          }
        } else {
          console.error('Verificación: No se encontró el item', {
            itemId,
            productId,
            availableItems: items.map(i => ({id: i.id, productId: i.productId}))
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar la actualización:', error);
      }
    });
  }

  removeItem(itemId: string): void {
    if (this.customerId) {
      const productToRemove = this.cartProducts.find(p => p.id === itemId);
      if (productToRemove) {
        console.log('Attempting to remove item:', itemId);
        productToRemove.updating = true;

        this.cartService.removeItemFromCart(this.customerId, productToRemove.productId)
          .subscribe({
            next: () => {
              console.log('Item removed successfully');
              this.cartProducts = this.cartProducts.filter(product => product.id !== itemId);
            },
            error: (error) => {
              console.error('Error removing item:', error);
              productToRemove.updating = false;
              productToRemove.error = 'Error al eliminar el producto';
            },
            complete: () => {
              console.log('Remove operation completed');
            }
          });
      } else {
        console.error('Product not found:', itemId);
      }
    } else {
      console.error('No customer ID available');
    }
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

      if (this.currentStep === 2) {
        this.loadPaymentMethods();
        const total = this.calculateTotal();
        console.log('Total calculado para el pago:', total);
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  retryLoad(): void {
    this.error = null;
    if (this.customerId) {
      this.loadCartData(this.customerId);
    }
  }

  openSearchModal() {
    this.isSearchModalOpen = true;
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
  }

  onAddProduct(product: Producto) {
    const newCartItem: CreateCartItem = {
      productId: product.id,
      quantity: 1
    };

    if (this.customerId) {
      this.cartService.addItemToCart(this.customerId, newCartItem).subscribe({
        next: () => {
          this.cartService.getCartItems(this.customerId!).subscribe({
            next: (items) => {
              const addedItem = items.find(item => item.productId === product.id);

              if (addedItem) {
                const newProduct: CartProductItem = {
                  ...product,
                  id: addedItem.id,
                  productId: product.id,
                  quantity: addedItem.quantity,
                  imageUrl: product.imageUrl || this.defaultImageUrl,
                  imageLoading: true,
                  imageError: false,
                  imageLoaded: false,
                  updating: false
                };
                this.cartProducts = [...this.cartProducts, newProduct];
              }
              this.closeSearchModal();
            },
            error: (error) => {
              console.error('Error al obtener los items actualizados:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error al agregar producto al carrito:', error);
        }
      });
    }
  }

  loadPaymentMethods() {
    if (this.customerId) {
      this.paymentMethodService.getPaymentMethods(this.customerId).subscribe({
        next: (methods: PaymentMethod[]) => {
          this.paymentMethods = methods;
          console.log('Métodos de pago cargados:', this.paymentMethods);
        },
        error: (error: any) => {
          console.error('Error al obtener los métodos de pago:', error);
          this.paymentError = 'Error al cargar los métodos de pago';
        }
      });
    }
  }

  onPaymentMethodChange(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
    console.log('Método de pago seleccionado:', method);
  }

  onConfirmPurchase() {
    if (!this.selectedPaymentMethod) {
      this.paymentError = 'Por favor seleccione un método de pago';
      return;
    }

    if (!this.customerId || !this.cart) {
      this.paymentError = 'Error: Información de carrito no disponible';
      return;
    }
  }

  calculateTotal(): number {
    return this.cartProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }

  onPaymentProcessed(invoiceId: string) {
    this.lastInvoiceId = invoiceId;
    this.lastPaymentTotal = this.calculateTotal();
    this.currentStep = 3;
  }
}
