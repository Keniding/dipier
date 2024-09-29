import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {ProductService} from "../../../../services/product.service";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {isPlatformBrowser, NgForOf} from "@angular/common";
import {Category, CategoryService} from "../../../../services/category.service";

@Component({
  selector: 'app-store-product',
  templateUrl: './store-product.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelect,
    MatOption,
    NgForOf,
    MatSelectModule
  ],
  styleUrls: ['./store-product.component.css']
})
export class StoreProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<StoreProductComponent>,
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      skuCode: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });
  }

  getCategory() {
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
      console.error('localStorage no está disponible en este entorno');
    }
  }

  ngOnInit(): void {
    this.getCategory()
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.productService.storeProduct(this.productForm.value).subscribe({
        next: (product) => {
          console.log('Producto guardado:', product);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al guardar el producto:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
