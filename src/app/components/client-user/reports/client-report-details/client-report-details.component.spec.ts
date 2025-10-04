import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientReportDetailsComponent } from './client-report-details.component';

describe('ClientReportDetailsComponent', () => {
  let component: ClientReportDetailsComponent;
  let fixture: ComponentFixture<ClientReportDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientReportDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
