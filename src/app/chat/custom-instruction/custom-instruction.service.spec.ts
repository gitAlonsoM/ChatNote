import { TestBed } from '@angular/core/testing';

import { CustomInstructionService } from './custom-instruction.service';

describe('CustomInstructionService', () => {
  let service: CustomInstructionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomInstructionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
