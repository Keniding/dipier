import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatToolbar } from "@angular/material/toolbar";
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Category, CategoryService } from "../../../services/category.service";
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-category',
  imports: [CommonModule, MatCard, MatCardHeader, MatCardContent, MatCardTitle, MatCardActions, MatButton, MatIcon, MatToolbar],
  templateUrl: './category.component.html',
  standalone: true,
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  private themeSubscription: Subscription | undefined;

  constructor(
    private categoryService: CategoryService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    if (isPlatformBrowser(this.platformId)) {
      this.categoryService.getCategories().subscribe({
        next: (data) => {
          this.categories = data;
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
      console.error('La carga de categorías no está disponible en este entorno');
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  editarCategoria(category: Category) {
    console.log('Editar category', category);
  }

  eliminarCategoria(category: Category) {
    console.log('Eliminar category', category);
  }

  categorySeleccionada: any;

  seleccionarCategoria(category: any) {
    this.categorySeleccionada = category;
    console.log('Categoría seleccionada:', category);
  }

  agregarCategoria() {
    console.log('Agregar category');
  }
}
