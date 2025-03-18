import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomInstructionPage } from './custom-instruction.page';

describe('CustomInstructionPage', () => {
  let component: CustomInstructionPage;
  let fixture: ComponentFixture<CustomInstructionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomInstructionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
