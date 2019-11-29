import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PleaseWaitOverlayComponent } from './please-wait-overlay.component';

describe('PleaseWaitOverlayComponent', () => {
  let component: PleaseWaitOverlayComponent;
  let fixture: ComponentFixture<PleaseWaitOverlayComponent>;

  beforeEach(async(() => {
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
