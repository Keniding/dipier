import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from "../../service/theme.service";
import { Subscription } from 'rxjs';

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'nombre', 'cantidad', 'precio', 'acciones'];
  dataSource = new MatTableDataSource<Producto>();
  isDarkTheme = false;
  private themeSubscription: Subscription | undefined;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkTheme.subscribe(
      isDark => {
        this.isDarkTheme = isDark;
        if (isDark) {
          document.body.classList.add('dark-theme');
          document.body.classList.remove('light-theme');
        } else {
          document.body.classList.add('light-theme');
          document.body.classList.remove('dark-theme');
        }
      }
    );

    this.dataSource.data = [
      {id: 1, nombre: 'Producto A', cantidad: 100, precio: 10.99},
      {id: 2, nombre: 'Producto B', cantidad: 50, precio: 20.50},
      {id: 3, nombre: 'Producto C', cantidad: 200, precio: 5.99},
    ];
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleTheme() {
    this.themeService.toggleDarkTheme();
  }

  loadTheme(themeName: string) {
    const head = this.document.getElementsByTagName('head')[0];
    let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `${themeName}.css`;
    } else {
      const style = this.document.createElement('link');
      style.id = 'app-theme';
      style.rel = 'stylesheet';
      style.href = `${themeName}.css`;
      head.appendChild(style);
    }
  }

  editarProducto(producto: Producto) {
    console.log('Editar producto', producto);
  }

  eliminarProducto(producto: Producto) {
    console.log('Eliminar producto', producto);
  }
}
