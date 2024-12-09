import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {DatePipe, isPlatformBrowser, NgForOf} from "@angular/common";
import {MatCard, MatCardContent, MatCardHeader, MatCardModule} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {Router} from "@angular/router";
import {CartServiceServiceBusiness} from "../../../services/business/cart-service-business.service";
import {BasicCustomer, Customer, CustomerService} from "../../../services/customer.service";

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
          this.customers = (data as (Customer | BasicCustomer)[]).filter(
            (customer): customer is Customer =>
              'email' in customer &&
              'dateOfBirth' in customer &&
              'address' in customer &&
              'allergies' in customer &&
              'chronicConditions' in customer &&
              'lastVisit' in customer
          );
          console.log('Datos recibidos:', this.customers);
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

  // Helper method to check if customer is full Customer type
  isFullCustomer(customer: Customer): customer is Customer {
    return 'email' in customer && 'dateOfBirth' in customer;
  }

  agregarCustomer() {
    this.router.navigate(['/dashboard/customers/new']);
  }

  navigateToCart(customerId: string) {
    this.cartServiceServiceBusiness.setCustomerId(customerId);
    this.router.navigate(['/dashboard/carts']).then(r => console.log(r));
  }

  getEmail(customer: Customer): string {
    return this.isFullCustomer(customer) ? customer.email : 'No disponible';
  }
}
