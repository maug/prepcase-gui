import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PleaseWaitOverlayComponent } from './please-wait-overlay.component';

describe('PleaseWaitOverlayComponent', () => {
  let component: PleaseWaitOverlayComponent;
  let fixture: ComponentFixture<PleaseWaitOverlayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PleaseWaitOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PleaseWaitOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
