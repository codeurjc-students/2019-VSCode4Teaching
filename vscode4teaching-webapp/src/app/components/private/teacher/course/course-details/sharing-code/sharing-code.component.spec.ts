import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharingCodeComponent } from './sharing-code.component';

describe('SharingCodeComponent', () => {
  let component: SharingCodeComponent;
  let fixture: ComponentFixture<SharingCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SharingCodeComponent]
    });
    fixture = TestBed.createComponent(SharingCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
