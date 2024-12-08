import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentFiltersComponent } from './filters.component';

describe('FiltersComponent', () => {
  let component: PaymentFiltersComponent;
  let fixture: ComponentFixture<PaymentFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
