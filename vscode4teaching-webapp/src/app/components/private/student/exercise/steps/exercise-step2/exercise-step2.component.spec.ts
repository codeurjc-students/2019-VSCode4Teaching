import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseStep2Component } from './exercise-step2.component';

describe('ExerciseStep2Component', () => {
  let component: ExerciseStep2Component;
  let fixture: ComponentFixture<ExerciseStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseStep2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
