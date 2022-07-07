import { TestBed } from '@angular/core/testing'

import { JsonRpcService } from './json-rpc.service'

describe('JsonRpcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: JsonRpcService = TestBed.get(JsonRpcService)
    expect(service).toBeTruthy()
  })
})
