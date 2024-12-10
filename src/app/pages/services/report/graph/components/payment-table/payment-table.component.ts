import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentHistory } from "../../../../../../services/report.service";

@Component({
  selector: 'app-payment-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'payment-table.component.html'
})
export class PaymentTableComponent {
  @Input() payments: PaymentHistory[] = [];
  @Output() refresh = new EventEmitter<void>();

  currentPage = 1;
  pageSize = 5;

  onRefresh() {
    this.refresh.emit();
  }

  get totalPages(): number {
    return Math.ceil(this.payments.length / this.pageSize);
  }

  get paginatedPayments(): PaymentHistory[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.payments.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  protected readonly Math = Math;

  getVisiblePages(): number[] {
    const totalPages = this.totalPages;
    const current = this.currentPage;
    const delta = 2; // Número de páginas visibles a cada lado

    let pages: number[] = [];

    if (totalPages <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      pages = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
      // Siempre incluir primera página
      pages.push(1);

      if (current <= 4) {
        // Si estamos cerca del inicio
        pages.push(...[2, 3, 4, 5]);
        pages.push(-1); // Representa "..."
      } else if (current >= totalPages - 3) {
        // Si estamos cerca del final
        pages.push(-1);
        pages.push(...Array.from({length: 4}, (_, i) => totalPages - 4 + i));
      } else {
        // En medio
        pages.push(-1);
        pages.push(...Array.from({length: 3}, (_, i) => current - 1 + i));
        pages.push(-1);
      }

      // Siempre incluir última página
      pages.push(totalPages);
    }

    return pages;
  }
}
