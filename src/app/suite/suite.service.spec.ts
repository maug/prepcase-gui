import { TestBed } from '@angular/core/testing';

import { SuiteService } from './suite.service';

describe('SuiteService', () => {
  let service: SuiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
