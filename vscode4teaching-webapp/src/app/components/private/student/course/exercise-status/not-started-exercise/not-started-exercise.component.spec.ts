import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotStartedExerciseComponent } from './not-started-exercise.component';

describe('NotStartedExerciseComponent', () => {
    let component: NotStartedExerciseComponent;
    let fixture: ComponentFixture<NotStartedExerciseComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NotStartedExerciseComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(NotStartedExerciseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
