import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExercisesComponent } from './add-exercises.component';

describe('AddExercisesComponent', () => {
  let component: AddExercisesComponent;
  let fixture: ComponentFixture<AddExercisesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExercisesComponent]
    });
    fixture = TestBed.createComponent(AddExercisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
