import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceFolderPage } from './workspace-folder.page';

describe('WorkspaceFolderPage', () => {
  let component: WorkspaceFolderPage;
  let fixture: ComponentFixture<WorkspaceFolderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceFolderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
