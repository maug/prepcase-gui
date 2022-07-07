import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ScriptParametersDialogComponent } from './script-parameters-dialog.component'

describe('ScriptParametersDialogComponent', () => {
  let component: ScriptParametersDialogComponent
  let fixture: ComponentFixture<ScriptParametersDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScriptParametersDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptParametersDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
