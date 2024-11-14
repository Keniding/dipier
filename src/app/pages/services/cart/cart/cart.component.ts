import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProgressStepsComponent } from "../progress-steps/progress-steps.component";
import { CartItemsComponent } from "../cart-items/cart-items.component";
import { PaymentMethodComponent } from "../payment-method/payment-method.component";
import { ConfirmationComponent } from "../confirmation/confirmation.component";
import {NgClass, NgIf} from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartServiceServiceBusiness } from "../../../../services/business/cart-service-business.service";
import { CartService } from "../../../../services/cart.service";
import {Subscription, forkJoin, map} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {ProductService} from "../../../../services/product.service";
import {MinioService} from "../../../../services/minio.service";

interface CartProductItem extends Producto, CartItem {
  updating?: boolean;
  error?: string;
  imageLoading?: boolean;
  imageError?: boolean;
  imageLoaded?: boolean
}


interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];

  imageUrl?: string
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


interface MinioResponseMetadata {
  nombre_original: string;
  mime_type: string;
  tamanio: string;
  hash_md5: string;
  fecha_subida: string;
  object_id: string;
}

interface MinioResponseItem {
  estado: string;
  url: string;
  nombreArchivo: string;
  metadata: MinioResponseMetadata;
  tamanio: number;
  tipoContenido: string;
  ultimaModificacion: string;
  tiempoExpiracion: string;
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
    RouterLink,
    NgClass
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

  constructor(
    private cartServiceBusiness: CartServiceServiceBusiness,
    private cartService: CartService,
    private productService: ProductService,
    private minioService: MinioService
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
          return { product, response };
        }),
        catchError(error => {
          console.error(`Error loading image for productId ${product.productId}:`, error);
          return [{ product, response: null }];
        })
      );
    });

    forkJoin(imageRequests).subscribe({
      next: (results) => {
        console.log('Resultados de todas las imágenes:', results);
        results.forEach((result) => {
          const productToUpdate = this.cartProducts.find(p => p.id === result.product.id);
          if (productToUpdate) {
            const response = result.response as MinioResponseItem[];
            if (!response || response.length === 0 || response[0].estado !== 'exitoso') {
              productToUpdate.imageUrl = this.defaultImageUrl;
              productToUpdate.imageError = true;
              console.log('Usando imagen por defecto para productId:', productToUpdate.productId);
            } else {
              productToUpdate.imageUrl = response[0].url;
              console.log('URL de imagen asignada para productId:', productToUpdate.productId, response[0].url);
              productToUpdate.imageError = false;
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

  updateQuantity(productId: string, quantity: number): void {
    if (this.customerId) {
      const productToUpdate = this.cartProducts.find(p => p.id === productId);
      if (productToUpdate) {
        productToUpdate.updating = true;
        this.cartService.updateItemQuantity(this.customerId, productId, quantity).subscribe({
          next: () => {
            productToUpdate.quantity = quantity;
            productToUpdate.updating = false;
          },
          error: (error) => {
            console.error('Error updating quantity:', error);
            productToUpdate.error = 'Error al actualizar la cantidad';
            productToUpdate.updating = false;
          }
        });
      }
    }
  }

  removeItem(itemId: string): void {
    if (this.customerId) {
      const productToRemove = this.cartProducts.find(p => p.id === itemId);
      if (productToRemove) {
        productToRemove.updating = true;
        this.cartService.removeItemFromCart(this.customerId, itemId).subscribe({
          next: () => {
            this.cartProducts = this.cartProducts.filter(product => product.id !== itemId);
          },
          error: (error) => {
            console.error('Error removing item:', error);
            productToRemove.error = 'Error al eliminar el producto';
            productToRemove.updating = false;
          }
        });
      }
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

  retryLoad(): void {
    this.error = null;
    if (this.customerId) {
      this.loadCartData(this.customerId);
    }
  }

  get isLoading(): boolean {
    return this.loading;
  }

  calculateTotal(): number {
    return this.cartProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }

  hasUpdatingItems(): boolean {
    return this.cartProducts.some(product => product.updating);
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
    this.updateQuantity(product.id, newQuantity);
  }

  onNextStep(): void {
    this.nextStep();
  }

  onRemoveItem(productId: string): void {
    this.removeItem(productId);
  }
}
