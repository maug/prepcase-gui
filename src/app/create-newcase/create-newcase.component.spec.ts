import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateNewcaseComponent } from './create-newcase.component';

describe('CreateNewcaseComponent', () => {
  let component: CreateNewcaseComponent;
  let fixture: ComponentFixture<CreateNewcaseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewcaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
