import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceMembersPage } from './workspace-members.page';

describe('WorkspaceMembersPage', () => {
  let component: WorkspaceMembersPage;
  let fixture: ComponentFixture<WorkspaceMembersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceMembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
