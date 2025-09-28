import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchSalaryComponent } from './batch-salary.component';

describe('BatchSalaryComponent', () => {
  let component: BatchSalaryComponent;
  let fixture: ComponentFixture<BatchSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchSalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
