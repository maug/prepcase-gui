import { TestBed } from '@angular/core/testing'

import { SuitesService } from './suites.service'

describe('SuitesService', () => {
  let service: SuitesService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(SuitesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
