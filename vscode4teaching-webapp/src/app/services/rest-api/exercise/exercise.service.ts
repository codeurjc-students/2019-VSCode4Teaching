import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { lastValueFrom, of, switchMap } from "rxjs";
import { Exercise } from "../../../model/exercise.model";

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

    constructor(private http: HttpClient) {
    }

    public getExercisesByCourseId = (courseId: number): Promise<Exercise[]> => {
        return lastValueFrom(
            this.http
                .get<Exercise[]>("/courses/" + courseId + "/exercises", {})
                .pipe(
                    switchMap((exerciseList: Exercise[]) => of(exerciseList ?? []) )
                )
        );
    }

}
