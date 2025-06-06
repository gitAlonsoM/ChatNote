import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitationsManagerPage } from './invitations-manager.page';

describe('InvitationsManagerPage', () => {
  let component: InvitationsManagerPage;
  let fixture: ComponentFixture<InvitationsManagerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationsManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
