import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedExerciseComponent } from './finished-exercise.component';

describe('FinishedExerciseComponent', () => {
    let component: FinishedExerciseComponent;
    let fixture: ComponentFixture<FinishedExerciseComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FinishedExerciseComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(FinishedExerciseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
