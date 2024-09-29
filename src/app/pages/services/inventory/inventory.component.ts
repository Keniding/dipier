import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from "@angular/material/card";
import { ProductService } from "../../../services/product.service";
import { HttpClient } from "@angular/common/http";
import { InventoryService } from "../../../services/inventory.service";
import { MatDialog } from "@angular/material/dialog";
import { ProductDetailDialogComponent } from "./product-detail-dialog/product-detail-dialog.component";

import { Router } from '@angular/router';
import { MatFormField } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import {MatInput, MatInputModule} from "@angular/material/input";

interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
}

interface Inventario {
  skuCode: String,
  quantity: number
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardActions,
    MatButton,
    MatIcon,
    MatToolbar,
    MatFormField,
    FormsModule,
    MatInputModule,
    MatInput,
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})

export class InventoryComponent implements OnInit {
  products: Producto[] = [];
  inventory: Inventario[] = [];
  productInventoryList: any[] = [];
  filteredProductInventoryList: any[] = [];
  cantidadBase: number = 0;
  filterQuantity: number = -1;

  constructor(
    private productService: ProductService,
    private inventoryService: InventoryService,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProductsAndInventory();
  }

  loadProductsAndInventory() {
    if (isPlatformBrowser(this.platformId)) {
      this.productService.getProducts().subscribe({
        next: (productData) => {
          this.products = productData;
          this.combineProductAndInventory();
        },
        error: (error) => {
          console.log('Error al obtener productos: ', error);
        }
      });

      this.inventoryService.getInventories().subscribe({
        next: (inventoryData) => {
          this.inventory = inventoryData;
          this.combineProductAndInventory();
        },
        error: (error) => {
          console.log('Error al obtener inventario: ', error);
        }
      });
    }
  }

  combineProductAndInventory() {
    if (this.products.length > 0 && this.inventory.length > 0) {
      this.productInventoryList = this.products.map((product) => {
        const inventoryItem = this.inventory.find(
          (item) => item.skuCode === product.skuCode
        );
        return {
          ...product,
          quantity: inventoryItem ? inventoryItem.quantity : 0
        };
      });

      this.productInventoryList.sort((a, b) => b.quantity - a.quantity);

      this.filteredProductInventoryList = this.productInventoryList;

      console.log('Product Inventory List: ', this.productInventoryList);
    }
  }

  openDetailDialog(item: any): void {
    this.dialog.open(ProductDetailDialogComponent, {
      data: item,
    });
  }

  addInventory() {
    this.router.navigate(['/product']).then(success => {
      if (success) {
        console.log('Navegación exitosa a /product');
      } else {
        console.log('La navegación a /product falló');
      }
    }).catch(error => {
      console.error('Error durante la navegación:', error);
    });
  }

  filterByQuantity() {
    this.filteredProductInventoryList = this.productInventoryList.filter(item => item.quantity > this.filterQuantity - 1);
  }

  filterCantidadBase() {  }
}
