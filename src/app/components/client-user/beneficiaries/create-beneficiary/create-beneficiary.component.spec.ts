import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBeneficiaryComponent } from './create-beneficiary.component';

describe('CreateBeneficiaryComponent', () => {
  let component: CreateBeneficiaryComponent;
  let fixture: ComponentFixture<CreateBeneficiaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBeneficiaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
