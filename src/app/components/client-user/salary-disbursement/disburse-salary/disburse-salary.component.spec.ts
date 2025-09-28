import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisburseSalaryComponent } from './disburse-salary.component';

describe('DisburseSalaryComponent', () => {
  let component: DisburseSalaryComponent;
  let fixture: ComponentFixture<DisburseSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisburseSalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisburseSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
