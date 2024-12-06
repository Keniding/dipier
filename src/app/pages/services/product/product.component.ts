import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ProductService } from "../../../services/product.service";
import { StoreProductComponent } from "./store-product/store-product.component";
import { MatDialog } from "@angular/material/dialog";
import { UpdateProductComponent } from "./update-product/update-product.component";
import { MinioService } from "../../../services/minio.service";

interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
  imageUrl?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    NgOptimizedImage,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  private themeSubscription: Subscription | undefined;
  protected readonly defaultImageUrl = 'https://via.placeholder.com/300';

  constructor(
    private productService: ProductService,
    private minioService: MinioService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    if (isPlatformBrowser(this.platformId)) {
      this.productService.getProducts().subscribe({
        next: (data) => {
          this.productos = data;
          this.productos.forEach(product => {
            this.loadProductImage(product);
          });
        },
        error: (error) => {
          console.error('Error al cargar los productos:', error);
        }
      });
    }
  }

  loadProductImage(product: Producto) {
    this.minioService.getObjectById(product.id).subscribe({
      next: (response) => {
        if (response && response.length > 0 && response[0].estado === 'exitoso') {
          product.imageUrl = response[0].url;
        } else {
          product.imageUrl = this.defaultImageUrl;
        }
      },
      error: (error) => {
        console.error('Error al cargar la imagen:', error);
        product.imageUrl = this.defaultImageUrl;
      }
    });
  }

  async uploadImage(producto: Producto) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          this.minioService.uploadFile(file, producto.id).subscribe({
            next: (response) => {
              if (response && response.length > 0 && response[0].estado === 'exitoso') {
                producto.imageUrl = response[0].url;
              } else {
                console.error('Error: Respuesta de carga no válida');
              }
            },
            error: (error) => {
              console.error('Error al subir la imagen:', error);
            }
          });
        } catch (error) {
          console.error('Error al procesar la imagen:', error);
        }
      }
    };

    input.click();
  }

  onImageError(event: any) {
    event.target.src = this.defaultImageUrl;
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  agregarProducto() {
    const dialogRef = this.dialog.open(StoreProductComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Producto agregado exitosamente');
        this.loadProducts();
      }
    });
  }

  editarProducto(producto: Producto) {
    const dialogRef = this.dialog.open(UpdateProductComponent, {
      width: '400px',
      data: producto
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Producto editado exitosamente');
        this.loadProducts();
      }
    });
  }

  eliminarProducto(producto: Producto) {
    if (isPlatformBrowser(this.platformId)) {
      this.productService.deleteProduct(producto.id).subscribe({
        next: () => {
          console.log('Eliminado: ', producto.id);
          this.loadProducts();
        },
        error: (error) => {
          console.log('error', error);
        }
      });
    }
  }
}
