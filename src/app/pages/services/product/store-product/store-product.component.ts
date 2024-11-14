import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {ProductService} from "../../../../services/product.service";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {isPlatformBrowser, NgForOf, NgIf} from "@angular/common";
import {Category, CategoryService} from "../../../../services/category.service";
import {MinioService} from "../../../../services/minio.service";
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

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
    MatSelectModule,
    NgIf
  ],
  styleUrls: ['./store-product.component.css']
})
export class StoreProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<StoreProductComponent>,
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    private minioService: MinioService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      skuCode: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      categories: [[], Validators.required],
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
    this.getCategory()
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

  private handleImageUploadError(productId: string) {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        console.log('Producto eliminado debido a fallo en subida de imagen');
        alert('Error al subir la imagen. El producto ha sido eliminado.');
      },
      error: (error) => {
        console.error('Error al eliminar producto después de fallo en subida de imagen:', error);
        alert('Error al procesar la solicitud. Por favor, inténtelo de nuevo.');
      }
    });
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

      this.productService.storeProduct(productRequest).pipe(
        switchMap(productResponse => {
          console.log('Producto guardado:', productResponse);

          if (this.selectedFile) {
            return this.uploadImage(this.selectedFile, productResponse.id).pipe(
              map(imageResponse => ({
                product: productResponse,
                image: imageResponse
              }))
            );
          } else {
            return of({ product: productResponse });
          }
        })
      ).subscribe({
        next: (result) => {
          console.log('Operación completada:', result);
          alert('Producto guardado exitosamente');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error en la operación:', error);
          if (error.product) {
            this.handleImageUploadError(error.product.id);
          }
          alert('Error al guardar el producto. Por favor, inténtelo de nuevo.');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
