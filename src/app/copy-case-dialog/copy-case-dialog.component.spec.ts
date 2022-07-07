import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CopyCaseDialogComponent } from './copy-case-dialog.component'

describe('CloneCaseDialogComponent', () => {
  let component: CopyCaseDialogComponent
  let fixture: ComponentFixture<CopyCaseDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CopyCaseDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyCaseDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
