import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelaySinceComponent } from './delay-since.component';

describe('DelaySinceComponent', () => {
  let component: DelaySinceComponent;
  let fixture: ComponentFixture<DelaySinceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DelaySinceComponent]
    });
    fixture = TestBed.createComponent(DelaySinceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
