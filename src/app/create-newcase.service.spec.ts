import { TestBed } from '@angular/core/testing';

import { CreateNewcaseService } from './create-newcase.service';

describe('CreateNewcaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateNewcaseService = TestBed.get(CreateNewcaseService);
    expect(service).toBeTruthy();
  });
});
