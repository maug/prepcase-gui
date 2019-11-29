import { TestBed } from '@angular/core/testing';

import { PleaseWaitOverlayService } from './please-wait-overlay/please-wait-overlay.service';

describe('PleaseWaitOverlayService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PleaseWaitOverlayService = TestBed.get(PleaseWaitOverlayService);
    expect(service).toBeTruthy();
  });
});
