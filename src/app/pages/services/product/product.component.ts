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
import { FormsModule } from '@angular/forms';
import { FilterDialogComponent, FilterOptions } from './filter-dialog/filter-dialog.component';

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
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './product.component.html',
  standalone: true,
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  searchTerm: String = '';
  private themeSubscription: Subscription | undefined;
  protected readonly defaultImageUrl = `data:image/svg+xml;base64,${btoa(`
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="300" fill="#f3f4f6"/>
    <path d="M145 115 h10 v70 h-10z M115 145 h70 v10 h-70z" fill="#94a3b8"/>
    <text x="150" y="220" font-family="Arial" font-size="14" fill="#64748b" text-anchor="middle">
        Sin imagen
    </text>
</svg>
`)}`;

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
          this.productosFiltrados = [...this.productos];
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
        if (response && response.length > 0) {
          const lastItem = response[response.length - 1];
          if (lastItem.estado === 'exitoso') {
            product.imageUrl = lastItem.url;
          } else {
            product.imageUrl = this.defaultImageUrl;
          }
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

  onSearchChange() {
    this.productosFiltrados = this.productos.filter(producto => {
      return producto.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

    this.aplicarFiltros();
  }

  filterOptions: FilterOptions = {
    priceRange: {
      min: 0,
      max: 0
    },
    categories: []
  };

  openFilterDialog() {
    // Obtener categorías únicas de los productos
    const uniqueCategories = Array.from(new Set(
      this.productos.flatMap(p => p.categories.map(c => c.name))
    ));

    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '600px',
      data: {
        categories: uniqueCategories,
        currentFilters: this.filterOptions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.filterOptions = result;
        this.aplicarFiltros();
      }
    });
  }

  aplicarFiltros() {
    let productosFiltrados = [...this.productos];

    // Aplicar filtro de búsqueda por texto
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.name.toLowerCase().includes(searchTermLower) ||
        producto.description.toLowerCase().includes(searchTermLower) ||
        producto.skuCode.toLowerCase().includes(searchTermLower) ||
        producto.categories.some(cat => cat.name.toLowerCase().includes(searchTermLower))
      );
    }

    // Aplicar filtro de rango de precios
    if (this.filterOptions.priceRange.min > 0 || this.filterOptions.priceRange.max > 0) {
      productosFiltrados = productosFiltrados.filter(producto => {
        const price = producto.price;
        const min = this.filterOptions.priceRange.min;
        const max = this.filterOptions.priceRange.max;

        if (min > 0 && max > 0) {
          return price >= min && price <= max;
        } else if (min > 0) {
          return price >= min;
        } else if (max > 0) {
          return price <= max;
        }
        return true;
      });
    }

    // Aplicar filtro de categorías
    if (this.filterOptions.categories.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.categories.some(cat =>
          this.filterOptions.categories.includes(cat.name)
        )
      );
    }

    this.productosFiltrados = productosFiltrados;
  }
}

