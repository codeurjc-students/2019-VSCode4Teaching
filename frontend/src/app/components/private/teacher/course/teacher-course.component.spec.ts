import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCourseComponent } from './teacher-course.component';

describe('TeacherCourseComponent', () => {
  let component: TeacherCourseComponent;
  let fixture: ComponentFixture<TeacherCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherCourseComponent]
    });
    fixture = TestBed.createComponent(TeacherCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
