import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseDirectoryComponent } from './exercise-directory.component';

describe('ExerciseDirectoryComponent', () => {
  let component: ExerciseDirectoryComponent;
  let fixture: ComponentFixture<ExerciseDirectoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseDirectoryComponent]
    });
    fixture = TestBed.createComponent(ExerciseDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
