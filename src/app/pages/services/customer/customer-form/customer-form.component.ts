import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {CustomerRequest, CustomerService} from "../../../../services/customer.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatCardModule} from "@angular/material/card";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatCardModule,
    MatDatepickerModule,
    MatSnackBarModule,
    NgIf,
    NgForOf,
    MatNativeDateModule
  ],
  templateUrl: 'customer-form.component.html',
  styleUrl: './customer-form.component.css'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  loading = false;
  customerId: string | null = null;
  allergies: string[] = [];
  chronicConditions: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA];

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.customerId = params['id'];
        this.loadCustomerData();
      }
    });
  }

  loadCustomerData() {
    if (this.customerId) {
      this.customerService.getCustomer(this.customerId, true).subscribe({
        next: (customer: any) => {
          this.customerForm.patchValue({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            dateOfBirth: new Date(customer.dateOfBirth),
            address: customer.address
          });

          this.allergies = Array.isArray(customer.allergies) ? [...customer.allergies] : [];
          this.chronicConditions = Array.isArray(customer.chronicConditions) ? [...customer.chronicConditions] : [];

          console.log('Alergias cargadas:', this.allergies);
          console.log('Condiciones crónicas cargadas:', this.chronicConditions);
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          this.showError('Error al cargar los datos del cliente');
        }
      });
    }
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.loading = true;
      const formValue = this.customerForm.value;

      const customerData: CustomerRequest = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        dateOfBirth: formValue.dateOfBirth.toISOString().split('T')[0],
        address: formValue.address,
        allergies: this.allergies.length > 0 ? [...this.allergies] : [],
        chronicConditions: this.chronicConditions.length > 0 ? [...this.chronicConditions] : []
      };

      console.log('Datos a enviar:', customerData);

      const request = this.isEditMode && this.customerId
        ? this.customerService.updateCustomer(this.customerId, customerData)
        : this.customerService.createCustomer(customerData);

      request.subscribe({
        next: () => {
          this.showSuccess(`Cliente ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`);
          this.router.navigate(['/dashboard/customers']);
        },
        error: (error) => {
          console.error('Error:', error);
          this.showError(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} el cliente`);
          this.loading = false;
        }
      });
    }
  }

  addAllergy(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.allergies.push(value);
    }
    event.chipInput!.clear();
  }

  removeAllergy(allergy: string): void {
    const index = this.allergies.indexOf(allergy);
    if (index >= 0) {
      this.allergies.splice(index, 1);
    }
  }

  addCondition(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.chronicConditions.push(value);
    }
    event.chipInput!.clear();
  }

  removeCondition(condition: string): void {
    const index = this.chronicConditions.indexOf(condition);
    if (index >= 0) {
      this.chronicConditions.splice(index, 1);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/customers']);
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
}
