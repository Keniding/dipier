import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, CategoryService } from "../../../services/category.service";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardHeader, MatCardContent, MatCardTitle],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
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
  }

}
