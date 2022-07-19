import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SuitesComponent } from './suites.component'

describe('SuitesComponent', () => {
  let component: SuitesComponent
  let fixture: ComponentFixture<SuitesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuitesComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(SuitesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
