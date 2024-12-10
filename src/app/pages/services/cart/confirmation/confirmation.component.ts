import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DownloadService} from "../../../../services/download.service";

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
  @Output() prevStepEvent = new EventEmitter<void>();

  constructor(private downloadService: DownloadService) {}

  onPrevStep(): void {
    this.prevStepEvent.emit();
  }

  downloadInvoice(): void {
    if (this.invoiceId) {
      this.downloadService.downloadInvoice(this.invoiceId).subscribe(
        blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `factura-${this.invoiceId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        },
        error => {
          console.error('Error al descargar la factura:', error);
        }
      );
    }
  }
}
