import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";

// category-form-dialog.component.ts
@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    MatDialogActions,
    MatButton,
    MatLabel,
    MatFormField,
    ReactiveFormsModule,
    MatDialogContent,
    MatInput,
    MatDialogTitle
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEditing ? 'Editar' : 'Nueva' }} Categoría</h2>
    <mat-dialog-content>
      <form [formGroup]="categoryForm">
        <mat-form-field appearance="fill">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="!categoryForm.valid"
              (click)="onSubmit()">
        {{ data.isEditing ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `
})
export class CategoryFormDialogComponent {
  categoryForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: [data.category?.name || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.dialogRef.close(this.categoryForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
