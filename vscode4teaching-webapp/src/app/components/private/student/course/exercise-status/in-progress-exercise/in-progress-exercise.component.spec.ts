import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InProgressExerciseComponent } from './in-progress-exercise.component';

describe('InProgressExerciseComponent', () => {
    let component: InProgressExerciseComponent;
    let fixture: ComponentFixture<InProgressExerciseComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InProgressExerciseComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(InProgressExerciseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
