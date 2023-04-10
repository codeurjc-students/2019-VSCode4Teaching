import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseStep1Component } from './exercise-step1.component';

describe('ExerciseStep1Component', () => {
  let component: ExerciseStep1Component;
  let fixture: ComponentFixture<ExerciseStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseStep1Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
