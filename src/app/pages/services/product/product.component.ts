import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID} from '@angular/core';
import {ProductService} from "../../../services/product.service";
import {StoreProductComponent} from "./store-product/store-product.component";
import {MatDialog} from "@angular/material/dialog";
import {data} from "autoprefixer";
import {UpdateProductComponent} from "./update-product/update-product.component";


interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
}

interface ProductRequest {
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  product: Producto[] = [];

  displayedColumns: string[] = ['id', 'name', 'price', 'acciones'];
  dataSource = new MatTableDataSource<Producto>();
  isDarkTheme = false;
  private themeSubscription: Subscription | undefined;

  constructor(
    private productService: ProductService,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
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
          this.product = data;
          this.dataSource.data = data;
          console.log('Datos recibidos:', data);
        },
        error: (error) => {
          console.error('Error al cargar las categorías:', error);
        },
        complete: () => {
          console.log('Carga de categorías completada');
        }
      });
    } else {
      console.error('localStorage no está disponible en este entorno');
    }
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
      this.productService.deleteProduct(producto.id).subscribe(
        {
          next: () => {
            console.log('Eliminado: ', producto.id)
            this.loadProducts()
          },
          error: (error) => {
            console.log('error')
          }
        }
      )
    }
  }
}
