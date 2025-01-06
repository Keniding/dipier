import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
}

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Filtros</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-4 p-4">
        <!-- Rango de Precios -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold">Rango de Precios</h3>
          <div class="flex gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Precio Mínimo</mat-label>
              <input matInput type="number" [(ngModel)]="filters.priceRange.min">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Precio Máximo</mat-label>
              <input matInput type="number" [(ngModel)]="filters.priceRange.max">
            </mat-form-field>
          </div>
        </div>

        <!-- Categorías -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold">Categorías</h3>
          <mat-form-field appearance="outline">
            <mat-label>Seleccionar categorías</mat-label>
            <mat-select [(ngModel)]="filters.categories" multiple>
              <mat-option *ngFor="let category of availableCategories" [value]="category">
                {{category}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onApply()">Aplicar</button>
    </mat-dialog-actions>
  `
})
export class FilterDialogComponent {
  filters: FilterOptions;
  availableCategories: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: string[], currentFilters: FilterOptions }
  ) {
    this.availableCategories = data.categories;
    this.filters = {
      priceRange: { ...data.currentFilters.priceRange },
      categories: [...data.currentFilters.categories]
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    this.dialogRef.close(this.filters);
  }
}
