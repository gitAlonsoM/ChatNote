import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityLogPage } from './activity-log.page';

describe('ActivityLogPage', () => {
  let component: ActivityLogPage;
  let fixture: ComponentFixture<ActivityLogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
