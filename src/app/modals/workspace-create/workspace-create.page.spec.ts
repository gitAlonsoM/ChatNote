
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceCreatePage } from './workspace-create.page';

describe('WorkspaceCreatePage', () => {
  let component: WorkspaceCreatePage;
  let fixture: ComponentFixture<WorkspaceCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
