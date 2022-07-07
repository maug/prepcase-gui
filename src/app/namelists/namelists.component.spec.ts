import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NamelistsComponent } from './namelists.component'

describe('NamelistsComponent', () => {
  let component: NamelistsComponent
  let fixture: ComponentFixture<NamelistsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NamelistsComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(NamelistsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
