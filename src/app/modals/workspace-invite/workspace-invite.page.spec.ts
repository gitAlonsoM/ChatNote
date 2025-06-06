import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceInvitePage } from './workspace-invite.page';

describe('WorkspaceInvitePage', () => {
  let component: WorkspaceInvitePage;
  let fixture: ComponentFixture<WorkspaceInvitePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceInvitePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
