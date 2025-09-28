import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminLayoutComponent } from './super-admin-layout.component';

describe('SuperAdminLayoutComponent', () => {
  let component: SuperAdminLayoutComponent;
  let fixture: ComponentFixture<SuperAdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
