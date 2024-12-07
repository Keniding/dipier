import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProductService} from "../../../../services/product.service";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {isPlatformBrowser, NgForOf, NgIf} from "@angular/common";
import {Category, CategoryService} from "../../../../services/category.service";
import {MinioService} from "../../../../services/minio.service";
import { Observable, of, throwError } from 'rxjs';
import { switchMap, map, catchError, finalize } from 'rxjs/operators';

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
    MatSelectModule,
    NgIf
  ],
  standalone: true,
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<UpdateProductComponent>,
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    private minioService: MinioService,
    @Inject(MAT_DIALOG_DATA) public data: Producto
  ) {
    const categories = data?.categories ?? [];
    this.productForm = this.fb.group({
      id: [data.id, Validators.required],
      name: [data.name, Validators.required],
      description: [data.description, Validators.required],
      skuCode: [data.skuCode, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]],
      categories: [categories.map(c => c.id), Validators.required],
      imageFile: [null]
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
    this.getCategory();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  private uploadImage(file: File, productId: string): Observable<any> {
    return new Observable(observer => {
      this.minioService.uploadFile(file, productId).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor para imagen:', response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Error al subir la imagen:', error);
          observer.error(error);
        }
      });
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      const productId = this.data.id; // Usamos el ID que ya tenemos

      if (!Array.isArray(productData.categories)) {
        console.error('El valor de categories no es un arreglo:', productData.categories);
        return;
      }

      const productRequest = {
        ...productData,
        categories: productData.categories.map((categoryId: string) => ({ id: categoryId }))
      };

      this.productService.updateProduct(productId, productRequest).pipe(
        switchMap(productResponse => {
          console.log('Producto actualizado:', productResponse);

          if (this.selectedFile) {
            // Usamos el productId que ya tenemos en lugar de productResponse.id
            return this.uploadImage(this.selectedFile, productId).pipe(
              map(imageResponse => ({
                product: productResponse,
                image: imageResponse
              })),
              catchError(error => {
                console.error('Error al subir la imagen:', error);
                return of({ product: productResponse, imageError: error });
              })
            );
          } else {
            return of({ product: productResponse });
          }
        }),
        catchError(error => {
          console.error('Error al actualizar el producto:', error);
          return throwError(() => error);
        }),
        finalize(() => {
          console.log('Operación de actualización finalizada');
        })
      ).subscribe({
        next: (product) => {
          console.log('Producto guardado:', product);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error en la operación:', error);
          alert('Error al actualizar el producto. Por favor, inténtelo de nuevo.');
        }
      });
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
