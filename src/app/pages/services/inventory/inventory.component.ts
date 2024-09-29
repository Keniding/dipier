import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {CommonModule, DOCUMENT, isPlatformBrowser} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatToolbar, MatToolbarModule} from "@angular/material/toolbar";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitle
} from "@angular/material/card";
import {ProductService} from "../../../services/product.service";
import {HttpClient} from "@angular/common/http";
import {InventoryService} from "../../../services/inventory.service";
import {MatDialog} from "@angular/material/dialog";
import {ProductDetailDialogComponent} from "./product-detail-dialog/product-detail-dialog.component";

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
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})

export class InventoryComponent implements OnInit {
  products: Producto[] = [];
  inventory: Inventario[] = [];
  productInventoryList: any[] = [];

  constructor(
    private productService: ProductService,
    private inventoryService: InventoryService,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
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
      console.log('Product Inventory List: ', this.productInventoryList);
    }
  }

  openDetailDialog(item: any): void {
    this.dialog.open(ProductDetailDialogComponent, {
      data: item,
    });
  }
}
