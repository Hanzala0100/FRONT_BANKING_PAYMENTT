import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientUserDashboardComponent } from './client-user-dashboard.component';

describe('ClientUserDashboardComponent', () => {
  let component: ClientUserDashboardComponent;
  let fixture: ComponentFixture<ClientUserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientUserDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientUserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
