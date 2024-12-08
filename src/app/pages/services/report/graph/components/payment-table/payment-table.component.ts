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
}
