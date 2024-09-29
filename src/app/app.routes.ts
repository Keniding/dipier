import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginFormComponent } from './login/login-form/login-form.component';
import {NotFoundComponent} from "./pages/not-found/not-found.component";
import {ProductComponent} from "./pages/services/product/product.component";
import {CategoryComponent} from "./pages/services/category/category.component";
import {InventoryComponent} from "./pages/services/inventory/inventory.component";

export const routes: Routes = [
  { path: 'product', component: ProductComponent },
  { path: 'home', component: HomeComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: '', component: LoginFormComponent },
  // Ruta comodín para manejar 404
  { path: '**', component: NotFoundComponent }
];
