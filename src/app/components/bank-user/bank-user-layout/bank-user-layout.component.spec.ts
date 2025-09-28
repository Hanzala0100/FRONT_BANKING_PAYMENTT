import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankUserLayoutComponent } from './bank-user-layout.component';

describe('BankUserLayoutComponent', () => {
  let component: BankUserLayoutComponent;
  let fixture: ComponentFixture<BankUserLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankUserLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankUserLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
