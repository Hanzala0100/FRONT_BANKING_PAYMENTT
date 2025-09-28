import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientUserLayoutComponent } from './client-user-layout.component';

describe('ClientUserLayoutComponent', () => {
  let component: ClientUserLayoutComponent;
  let fixture: ComponentFixture<ClientUserLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientUserLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientUserLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
