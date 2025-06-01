import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceDetailPage } from './workspace-detail.page';

describe('WorkspaceDetailPage', () => {
  let component: WorkspaceDetailPage;
  let fixture: ComponentFixture<WorkspaceDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
