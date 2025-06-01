import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceRenamePage } from './workspace-rename.page';

describe('WorkspaceRenamePage', () => {
  let component: WorkspaceRenamePage;
  let fixture: ComponentFixture<WorkspaceRenamePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceRenamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
