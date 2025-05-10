import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarpetaPage } from './carpeta.page';

describe('CarpetaPage', () => {
  let component: CarpetaPage;
  let fixture: ComponentFixture<CarpetaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarpetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
