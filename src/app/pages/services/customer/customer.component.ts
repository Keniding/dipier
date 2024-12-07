import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {CustomerService} from "../../../services/customer.service";
import {DatePipe, isPlatformBrowser, NgForOf} from "@angular/common";
import {MatCard, MatCardContent, MatCardHeader, MatCardModule} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {Router} from "@angular/router";
import {CartServiceServiceBusiness} from "../../../services/business/cart-service-business.service";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  address: string;
  allergies: string[];
  chronicConditions: string[];
  lastVisit: Date;
}

@Component({
  selector: 'app-customer',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    NgForOf,
    MatCardModule,
    DatePipe,
    MatButton,
    MatIcon,
    MatToolbar
  ],
  templateUrl: './customer.component.html',
  standalone: true,
  styleUrl: './customer.component.css'
})

export class CustomerComponent implements OnInit {
  public customers: Customer[] = [];

  constructor(
    private customerService: CustomerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private cartServiceServiceBusiness: CartServiceServiceBusiness
  ) {
  }

  ngOnInit(): void {
    this.loadCustomers()
  }

  loadCustomers() {
    const fullDetails = true;

    if (isPlatformBrowser(this.platformId)) {
      this.customerService.getCustomers(fullDetails).subscribe({
        next: (data) => {
          this.customers = data;
          console.log('Datos recibidos:', data);
        },
        error: (error) => {
          console.error('Error al cargar los datos:', error);
        },
        complete: () => {
          console.log('Carga de datos completada');
        }
      });
    } else {
      console.error('La carga de datos no está disponible en este entorno');
    }
  }

  agregarCustomer() {

  }

  navigateToCart(customerId: string) {
    this.cartServiceServiceBusiness.setCustomerId(customerId);
    this.router.navigate(['/dashboard/carts']).then(r => console.log(r));
  }
}
