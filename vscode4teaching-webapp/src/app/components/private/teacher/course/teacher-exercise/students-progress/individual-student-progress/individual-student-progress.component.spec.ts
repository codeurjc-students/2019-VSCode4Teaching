import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualStudentProgressComponent } from './individual-student-progress.component';

describe('IndividualStudentProgressComponent', () => {
  let component: IndividualStudentProgressComponent;
  let fixture: ComponentFixture<IndividualStudentProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualStudentProgressComponent]
    });
    fixture = TestBed.createComponent(IndividualStudentProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
