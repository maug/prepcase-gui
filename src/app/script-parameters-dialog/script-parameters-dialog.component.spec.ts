import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptParametersDialogComponent } from './script-parameters-dialog.component';

describe('ScriptParametersDialogComponent', () => {
  let component: ScriptParametersDialogComponent;
  let fixture: ComponentFixture<ScriptParametersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptParametersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptParametersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
