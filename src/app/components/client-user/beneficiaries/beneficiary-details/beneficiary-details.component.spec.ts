import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryDetailsComponent } from './beneficiary-details.component';

describe('BeneficiaryDetailsComponent', () => {
  let component: BeneficiaryDetailsComponent;
  let fixture: ComponentFixture<BeneficiaryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiaryDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
