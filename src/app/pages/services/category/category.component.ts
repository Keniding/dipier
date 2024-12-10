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
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {CategoryFormDialogComponent} from "./category-form-dialog/category-form-dialog.component";
import {ConfirmDialogComponent} from "../customer/confirm-dialog/confirm-dialog.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-category',
  imports: [CommonModule, MatCard, MatCardHeader, MatCardContent, MatCardTitle, MatCardActions, MatButton, MatIcon, MatToolbar, MatProgressSpinner],
  templateUrl: './category.component.html',
  standalone: true,
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  private themeSubscription: Subscription | undefined;
  isLoading = false;
  errorMessage: string = '';

  // Agregar para el manejo del formulario
  categoryForm: FormGroup;
  isEditing = false;
  selectedCategoryId: string | null = null;

  constructor(
    private categoryService: CategoryService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  ngOnDestroy() {

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

  editarCategoria(category: Category) {
    this.isEditing = true;
    this.selectedCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name
    });

    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      data: { category: category, isEditing: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.updateCategory(category.id, result).subscribe({
          next: () => {
            this.loadCategories();
            this.resetForm();
          },
          error: (error) => {
            this.errorMessage = 'Error al actualizar la categoría';
            console.error(error);
          }
        });
      }
    });
  }

  eliminarCategoria(category: Category) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Está seguro de eliminar esta categoría?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.loadCategories();
          },
          error: (error) => {
            this.errorMessage = 'Error al eliminar la categoría';
            console.error(error);
          }
        });
      }
    });
  }

  agregarCategoria() {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      data: { isEditing: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.createCategory(result).subscribe({
          next: () => {
            this.loadCategories();
            this.resetForm();
          },
          error: (error) => {
            this.errorMessage = 'Error al crear la categoría';
            console.error(error);
          }
        });
      }
    });
  }

  private resetForm() {
    this.categoryForm.reset();
    this.isEditing = false;
    this.selectedCategoryId = null;
  }
}
