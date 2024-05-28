import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherExerciseComponent } from './teacher-exercise.component';

describe('TeacherExerciseComponent', () => {
  let component: TeacherExerciseComponent;
  let fixture: ComponentFixture<TeacherExerciseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherExerciseComponent]
    });
    fixture = TestBed.createComponent(TeacherExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
