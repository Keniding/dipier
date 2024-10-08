import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreProductComponent } from './store-product.component';

describe('StoreProductComponent', () => {
  let component: StoreProductComponent;
  let fixture: ComponentFixture<StoreProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
