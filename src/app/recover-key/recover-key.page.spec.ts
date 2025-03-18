import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoverKeyPage } from './recover-key.page';

describe('RecoverKeyPage', () => {
  let component: RecoverKeyPage;
  let fixture: ComponentFixture<RecoverKeyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverKeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
