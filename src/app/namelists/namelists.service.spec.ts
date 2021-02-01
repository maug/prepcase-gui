import { TestBed } from '@angular/core/testing';

import { NamelistsService } from './namelists.service';

describe('NamelistsService', () => {
  let service: NamelistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NamelistsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
