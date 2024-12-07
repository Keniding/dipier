import { Component, OnInit, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  standalone: true,
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  isOpen = true;
  isMobile = false;

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard/home' },
    { icon: 'shopping_cart', label: 'Carritos', route: '/dashboard/carts' },
    { icon: 'category', label: 'Categorías', route: '/dashboard/categories' },
    { icon: 'people', label: 'Clientes', route: '/dashboard/customers' },
    { icon: 'inventory', label: 'Inventario', route: '/dashboard/inventory' },
    { icon: 'inventory_2', label: 'Productos', route: '/dashboard/products' },
    { icon: 'assessment', label: 'Reportes', route: '/dashboard/reports' },
    { icon: 'settings', label: 'Configuración', route: '/dashboard/settings' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }
}
