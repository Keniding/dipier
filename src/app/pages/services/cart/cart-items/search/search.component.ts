// search.component.ts
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgForOf, NgIf, CurrencyPipe, NgClass } from "@angular/common";
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {MinioResponseItem, Producto} from "../../../../../models/cart.types";
import {ProductService} from "../../../../../services/product.service";
import {MinioService} from "../../../../../services/minio.service";
import {FormsModule} from "@angular/forms";
@Component({
  selector: 'app-search',
  imports: [
    NgForOf,
    NgIf,
    CurrencyPipe,
    FormsModule,
    FormsModule
  ],
  templateUrl: './search.component.html',
  standalone: true,
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() addProduct = new EventEmitter<Producto>();

  searchTerm = '';
  searchResults: (Producto & { imageUrl: string; imageLoading: boolean })[] = [];
  isLoading = false;
  private searchSubject = new Subject<string>();
  private subscription = new Subscription();
  protected readonly defaultImageUrl = 'https://via.placeholder.com/50';

  constructor(
    private productService: ProductService,
    private minioService: MinioService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(term => {
        this.performSearch(term);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(term: string) {
    if (!term.trim()) {
      this.searchResults = [];
      return;
    }

    this.isLoading = true;
    this.productService.searchProducts(term).subscribe({
      next: (products) => {
        this.searchResults = products.map(product => ({
          ...product,
          imageUrl: this.defaultImageUrl,
          imageLoading: true
        }));
        this.loadProductImages();
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.isLoading = false;
      }
    });
  }

  private loadProductImages() {
    this.searchResults.forEach(product => {
      this.minioService.getObjectById(product.id).subscribe({
        next: (response: MinioResponseItem[]) => {
          if (response &&
            Array.isArray(response) &&
            response.length > 0 &&
            response[0].estado === 'exitoso') {
            product.imageUrl = response[0].url;
          } else {
            product.imageUrl = this.defaultImageUrl;
          }
          product.imageLoading = false;
        },
        error: () => {
          product.imageUrl = this.defaultImageUrl;
          product.imageLoading = false;
        }
      });
    });
  }

  onAddProduct(product: Producto) {
    this.addProduct.emit(product);
  }

  onClose() {
    this.close.emit();
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
  }
}
