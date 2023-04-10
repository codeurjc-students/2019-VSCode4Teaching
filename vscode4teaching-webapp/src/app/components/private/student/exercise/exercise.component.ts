import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ExerciseService } from "../../../../services/rest-api/model-entities/exercise/exercise.service";
import { Exercise } from "../../../../model/exercise.model";

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExerciseComponent implements OnInit {
    exerciseId: number;
    exercise: Exercise | undefined;

    activeStep: number;

    constructor(private route: ActivatedRoute,
                private exerciseService: ExerciseService) {
        this.exerciseId = parseInt(route.snapshot.paramMap.get("exerciseId") ?? "0");

        this.activeStep = 1;
    }

    async ngOnInit(): Promise<void> {
        this.exercise = await this.exerciseService.getExerciseById(this.exerciseId);
    }


    nextStep() {
        // this.activeStep = this.activeStep + 1;
    }
}
