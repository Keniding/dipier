import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginFormComponent } from './login/login-form/login-form.component';
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ProductComponent } from "./pages/services/product/product.component";
import { CategoryComponent } from "./pages/services/category/category.component";
import { InventoryComponent } from "./pages/services/inventory/inventory.component";
import { CustomerComponent } from "./pages/services/customer/customer.component";
import { CartComponent } from "./pages/services/cart/cart/cart.component";
import {DashboardLayoutComponent} from "./dashboard-layout/dashboard-layout.component";
import {PaymentHistoryComponent} from "./pages/services/report/graph/payment-history.component";

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginFormComponent },

  { path: 'test', component: PaymentHistoryComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: 'products', component: ProductComponent },
      { path: 'categories', component: CategoryComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'customers', component: CustomerComponent },

      { path: 'reports', component: PaymentHistoryComponent },

      { path: 'carts', component: CartComponent },
      { path: 'cart/:customerId', component: CartComponent },
    ]
  },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];
