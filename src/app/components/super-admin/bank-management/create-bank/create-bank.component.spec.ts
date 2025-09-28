import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBankComponent } from './create-bank.component';

describe('CreateBankComponent', () => {
  let component: CreateBankComponent;
  let fixture: ComponentFixture<CreateBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
