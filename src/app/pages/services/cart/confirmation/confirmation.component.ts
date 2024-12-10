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
    console.log("customer: ", this.customerId)
  }

  private extractInvoiceIdFromUrl(url: string): string | null {
    try {
      // Buscar el patrón invoice_XXXXXX en la URL
      const match = url.match(/invoice_([^_]+)_/);
      if (match && match[1]) {
        return match[1];
      }

      // Si no se encuentra el patrón anterior, intentar extraer el ID del final de la URL
      const pathParts = url.split('/');
      const filename = pathParts[pathParts.length - 1].split('?')[0]; // Obtener el nombre del archivo sin parámetros
      const parts = filename.split('_');
      for (let part of parts) {
        // Buscar una parte que coincida con el formato del ID (24 caracteres hexadecimales)
        if (part.match(/^[0-9a-f]{24}$/)) {
          return part;
        }
      }
      return null;
    } catch (error) {
      console.error('Error al extraer ID de la URL:', error);
      return null;
    }
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
        console.log('Respuesta de MinIO:', responses);
        Swal.close();

        if (responses && responses.length > 0) {
          const response = responses[0];
          console.log('URL del archivo:', response.url);

          if (this.customerId) {
            console.log('CustomerId encontrado:', this.customerId);
            try {
              const customers = await this.customerService.getCustomers(true).toPromise();
              console.log('Clientes obtenidos:', customers);
              const customer = customers?.find(c => c.id === this.customerId);
              console.log('Cliente encontrado:', customer);

              if (customer && 'email' in customer && typeof customer.email === 'string') {
                console.log('Preparando descarga y envío de email a:', customer.email);

                fetch(response.url)
                  .then(res => res.blob())
                  .then(async blob => {
                    const formData = new FormData();

                    const pdfFile = new File([blob], response.nombreArchivo, {
                      type: 'application/pdf',
                      lastModified: new Date().getTime()
                    });

                    const emailRequest = {
                      to: customer.email,
                      subject: `Factura #${this.invoiceId} - ${customer.firstName || customer.phoneNumber}`,
                      body: `Estimado/a ${customer.firstName},\n\n` +
                        `Adjunto encontrará su factura por el monto de S/. ${this.totalAmount.toFixed(2)}.\n\n` +
                        `Gracias por su preferencia.\n` +
                        `Saludos cordiales.`,
                      recipientName: customer.firstName
                    };

                    formData.append('file', pdfFile, pdfFile.name);
                    formData.append('emailRequest', new Blob([JSON.stringify(emailRequest)], {
                      type: 'application/json'
                    }));

                    // Servicio de email modificado
                    this.emailService.sendEmailWithAttachment(formData).subscribe({
                      next: (emailResponse) => {
                        console.log('Respuesta del servicio de email:', emailResponse);
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
                        console.error('Error detallado al enviar el email:', error);
                        Swal.fire({
                          icon: 'warning',
                          title: 'Advertencia',
                          text: `No se pudo enviar el email con la factura: ${error.message || 'Error desconocido'}`,
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
                  })
                  .catch(error => {
                    console.error('Error al descargar el archivo:', error);
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Error al descargar el archivo para enviar por email'
                    });
                  });
              }
            } catch (error) {
              console.error('Error al obtener datos del cliente:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al obtener datos del cliente: ${error || 'Error desconocido'}`,
                showCancelButton: true,
                confirmButtonText: 'Descargar Factura',
                cancelButtonText: 'Cerrar'
              });
            }
          } else {
            console.log('No hay customerId, mostrando solo opción de descarga');
            Swal.fire({
              icon: 'info',
              title: 'Descargar Factura',
              text: 'No se encontró información del cliente. ¿Desea descargar la factura?',
              showCancelButton: true,
              confirmButtonText: 'Descargar',
              cancelButtonText: 'Cancelar'
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
          console.error('No se encontraron archivos en la respuesta de MinIO');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró ningún archivo asociado a este ID'
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener archivo de MinIO:', error);
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error al descargar la factura: ${error.message || 'Error desconocido'}`
        });
      }
    });
  }
}
