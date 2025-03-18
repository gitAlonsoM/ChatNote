import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibretaPage } from './libreta.page';

describe('LibretaPage', () => {
  let component: LibretaPage;
  let fixture: ComponentFixture<LibretaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LibretaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
