import { TestBed } from '@angular/core/testing';

import { SchemaValidationService } from './schema-validation.service';

describe('SchemaValidationService', () => {
  let service: SchemaValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchemaValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
