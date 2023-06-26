import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseStep3Component } from './exercise-step3.component';

describe('ExerciseStep3Component', () => {
  let component: ExerciseStep3Component;
  let fixture: ComponentFixture<ExerciseStep3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseStep3Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
