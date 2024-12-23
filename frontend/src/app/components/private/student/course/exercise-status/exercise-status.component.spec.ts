import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseStatusComponent } from './exercise-status.component';

describe('ExerciseTypeComponent', () => {
  let component: ExerciseStatusComponent;
  let fixture: ComponentFixture<ExerciseStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
