import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportExelComponent } from './export-exel.component';

describe('ExportExelComponent', () => {
  let component: ExportExelComponent;
  let fixture: ComponentFixture<ExportExelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportExelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportExelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
