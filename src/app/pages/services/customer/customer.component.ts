import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {DatePipe, isPlatformBrowser, NgForOf} from "@angular/common";
import {MatCard, MatCardContent, MatCardHeader, MatCardModule} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {Router} from "@angular/router";
import {CartServiceServiceBusiness} from "../../../services/business/cart-service-business.service";
import {BasicCustomer, Customer, CustomerService} from "../../../services/customer.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-customer',
  imports: [
    MatCard,
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
  public loading = false;

  constructor(
    private customerService: CustomerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private cartServiceServiceBusiness: CartServiceServiceBusiness,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
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
          this.showError('Error al cargar los clientes');
        },
        complete: () => {
          console.log('Carga de datos completada');
          this.loading = false;
        }
      });
    } else {
      console.error('La carga de datos no está disponible en este entorno');
      this.loading = false;
    }
  }

  agregarCustomer() {
    this.router.navigate(['/dashboard/customers/new']);
  }

  editCustomer(id: string) {
    this.router.navigate([`/dashboard/customers/edit/${id}`]);
  }

  deleteCustomer(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Está seguro que desea eliminar este cliente?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customerService.deleteCustomer(id).subscribe({
          next: () => {
            this.showSuccess('Cliente eliminado correctamente');
            this.loadCustomers();
          },
          error: (error) => {
            console.error('Error al eliminar el cliente:', error);
            this.showError('Error al eliminar el cliente');
          }
        });
      }
    });
  }

  navigateToCart(customerId: string) {
    this.cartServiceServiceBusiness.setCustomerId(customerId);
    this.router.navigate(['/dashboard/carts']).then(r => console.log(r));
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  openDetails(id: string) {
    this.router.navigate([`/dashboard/customers/${id}/payment-methods`]);
  }
}
