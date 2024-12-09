import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginFormComponent } from './login/login-form/login-form.component';
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ProductComponent } from "./pages/services/product/product.component";
import { CategoryComponent } from "./pages/services/category/category.component";
import { InventoryComponent } from "./pages/services/inventory/inventory.component";
import { CustomerComponent } from "./pages/services/customer/customer.component";
import { CartComponent } from "./pages/services/cart/cart/cart.component";
import { DashboardLayoutComponent } from "./dashboard-layout/dashboard-layout.component";
import { PaymentHistoryComponent } from "./pages/services/report/graph/payment-history.component";
import { UserComponent } from "./pages/services/configuration/user/user.component";
import { CustomerFormComponent } from "./pages/services/customer/customer-form/customer-form.component";
import { AuthGuard } from "./guard/auth.guard";
import {ProfileComponent} from "./pages/services/profile/profile.component";

export const routes: Routes = [
  // Ruta por defecto
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas públicas
  { path: 'login', component: LoginFormComponent },
  { path: 'home', component: HomeComponent },

  // Dashboard y rutas protegidas
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // No es necesario repetir canActivate en los children ya que el padre ya está protegido
      { path: 'products', component: ProductComponent },
      { path: 'categories', component: CategoryComponent },
      { path: 'inventory', component: InventoryComponent },

      // Rutas de clientes agrupadas
      {
        path: 'customers',
        children: [
          { path: '', component: CustomerComponent },
          { path: 'new', component: CustomerFormComponent },
          { path: 'edit/:id', component: CustomerFormComponent }
        ]
      },

      // Reportes
      { path: 'reports', component: PaymentHistoryComponent },

      // Carrito
      { path: 'carts', component: CartComponent },
      { path: 'cart/:customerId', component: CartComponent },

      // Configuración
      { path: 'settings', component: UserComponent }
    ]
  },
  {
    path: 'mi-perfil', component: ProfileComponent, canActivate: [AuthGuard]
  },

  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];
