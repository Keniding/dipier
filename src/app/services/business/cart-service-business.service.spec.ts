import { TestBed } from '@angular/core/testing';

import { CartServiceBusinessService } from './cart-service-business.service';

describe('CartServiceBusinessService', () => {
  let service: CartServiceBusinessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartServiceBusinessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
