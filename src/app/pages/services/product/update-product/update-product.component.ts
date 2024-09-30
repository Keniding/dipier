import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProductService} from "../../../../services/product.service";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {isPlatformBrowser, NgForOf} from "@angular/common";
import {Category, CategoryService} from "../../../../services/category.service";

interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
}

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
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
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<UpdateProductComponent>,
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    @Inject(MAT_DIALOG_DATA) public data: Producto
  ) {
    const categories = data?.categories ?? [];
    this.productForm = this.fb.group({
      id: [data.id, Validators.required],
      name: [data.name, Validators.required],
      description: [data.description, Validators.required],
      skuCode: [data.skuCode, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]],
      categories: [categories.map(c => c.id), Validators.required]
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
      const productData = this.productForm.value;

      if (!Array.isArray(productData.categories)) {
        console.error('El valor de categories no es un arreglo:', productData.categories);
        return;
      }

      const productRequest = {
        ...productData,
        categories: productData.categories.map((categoryId: string) => ({ id: categoryId }))
      };

      this.productService.updateProduct(productRequest.id, productRequest).subscribe({
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
