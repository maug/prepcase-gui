import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitWithCylcDialogComponent } from './submit-with-cylc-dialog.component';

describe('SubmitWithCylcDialogComponent', () => {
  let component: SubmitWithCylcDialogComponent;
  let fixture: ComponentFixture<SubmitWithCylcDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitWithCylcDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitWithCylcDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
