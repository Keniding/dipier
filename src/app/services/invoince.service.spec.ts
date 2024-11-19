import { TestBed } from '@angular/core/testing';

import { InvoinceService } from './invoince.service';

describe('InvoinceService', () => {
  let service: InvoinceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoinceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
