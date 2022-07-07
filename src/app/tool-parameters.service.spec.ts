import { TestBed } from '@angular/core/testing'

import { ToolParametersService } from './tool-parameters.service'

describe('ToolParametersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ToolParametersService = TestBed.get(ToolParametersService)
    expect(service).toBeTruthy()
  })
})
