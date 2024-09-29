import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import { PLATFORM_ID} from '@angular/core';


interface Producto {
  id: string;
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
    MatCardModule
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'name', 'price', 'acciones'];
  dataSource = new MatTableDataSource<Producto>();
  isDarkTheme = false;
  private themeSubscription: Subscription | undefined;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get<Producto[]>('http://localhost:8000/api/product', { headers }).subscribe({
        next: (data) => {
          this.dataSource.data = data;
        },
        error: (error) => {
          console.error('Error al obtener los productos', error);
        },
        complete: () => {
          console.log('La solicitud de productos ha completado');
        }
      });
    } else {
      console.error('No se encontró un token de autenticación');
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  editarProducto(producto: Producto) {
    console.log('Editar producto', producto);
  }

  eliminarProducto(producto: Producto) {
    console.log('Eliminar producto', producto);
  }
}
