import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinioService } from "../../../../services/minio.service";
import { EmailService, EmailRequest } from "../../../../services/email.service";
import { CustomerService } from "../../../../services/customer.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  standalone: true,
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  @Input() invoiceId: string | null = null;
  @Input() totalAmount: number = 0;
  @Input() customerId: string | null = null;
  @Output() prevStepEvent = new EventEmitter<void>();

  constructor(
    private minioService: MinioService,
    private emailService: EmailService,
    private customerService: CustomerService
  ) {
  }

  onPrevStep(): void {
    this.prevStepEvent.emit();
  }

  downloadInvoice(): void {
    if (!this.invoiceId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el ID de la factura'
      });
      return;
    }

    // Mostrar loading mientras se procesa
    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.minioService.getObjectById(this.invoiceId).subscribe({
      next: async (responses) => {
        // Primero cerramos el loading
        Swal.close();

        if (responses && responses.length > 0) {
          const response = responses[0];

          // Si tenemos el customerId, enviamos el email con la factura
          if (this.customerId) {
            try {
              const customers = await this.customerService.getCustomers(true).toPromise();
              const customer = customers?.find(c => c.id === this.customerId);

              if (customer && 'email' in customer && typeof customer.email === 'string') {
                const emailRequest: EmailRequest = {
                  to: customer.email,
                  subject: `Su factura #${this.invoiceId} está lista`,
                  body: `Adjuntamos su factura por el monto de $${this.totalAmount}`,
                  recipientName: `${customer.firstName} ${customer.lastName}`,
                  buttonText: 'Descargar Factura',
                  buttonUrl: response.url,
                  footerText: 'Gracias por su preferencia'
                };

                this.emailService.sendEmail(emailRequest).subscribe({
                  next: () => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Email Enviado',
                      text: 'El email con la factura ha sido enviado correctamente',
                      showCancelButton: true,
                      confirmButtonText: 'Descargar Factura',
                      cancelButtonText: 'Cerrar'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        const link = document.createElement('a');
                        link.href = response.url;
                        link.download = response.nombreArchivo;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    });
                  },
                  error: (error) => {
                    console.error('Error al enviar el email:', error);
                    Swal.fire({
                      icon: 'warning',
                      title: 'Advertencia',
                      text: 'No se pudo enviar el email con la factura',
                      showCancelButton: true,
                      confirmButtonText: 'Descargar Factura',
                      cancelButtonText: 'Cerrar'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        const link = document.createElement('a');
                        link.href = response.url;
                        link.download = response.nombreArchivo;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    });
                  }
                });
              }
            } catch (error) {
              console.error('Error al obtener datos del cliente:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener datos del cliente',
                showCancelButton: true,
                confirmButtonText: 'Descargar Factura',
                cancelButtonText: 'Cerrar'
              }).then((result) => {
                if (result.isConfirmed) {
                  const link = document.createElement('a');
                  link.href = response.url;
                  link.download = response.nombreArchivo;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              });
            }
          } else {
            // Si no hay customerId, solo mostramos la opción de descarga
            Swal.fire({
              icon: 'success',
              title: 'Factura Lista',
              text: 'La factura está lista para descargar',
              showCancelButton: true,
              confirmButtonText: 'Descargar Factura',
              cancelButtonText: 'Cerrar'
            }).then((result) => {
              if (result.isConfirmed) {
                const link = document.createElement('a');
                link.href = response.url;
                link.download = response.nombreArchivo;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró ningún archivo asociado a este ID'
          });
        }
      },
      error: (error) => {
        // Cerramos el loading en caso de error
        Swal.close();

        console.error('Error al descargar el archivo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al descargar la factura'
        });
      }
    });
  }
}
