import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { lastValueFrom, map } from "rxjs";
import { Course } from "../../../../model/course.model";
import { Exercise } from "../../../../model/exercise.model";
import { ExerciseDTO } from "../../../../model/rest-api/exercise.dto";

@Injectable({
    providedIn: 'root'
})
export class ExerciseService {

    constructor(private http: HttpClient) {
    }

    public getExerciseById = (exerciseId: number): Promise<Exercise> => {
        return lastValueFrom(this.http.get<ExerciseDTO>("/exercises/" + exerciseId)
            .pipe(map((exerciseDTO: ExerciseDTO) => new Exercise(exerciseDTO)))
        );
    }

    public getExercisesInCourse = (course: Course): Promise<Exercise[]> => {
        return lastValueFrom(this.http.get<ExerciseDTO[]>("/courses/" + course.id + "/exercises")
            .pipe(map((exerciseDTOList: ExerciseDTO[]) => exerciseDTOList.map((exerciseDTO: ExerciseDTO) => new Exercise(exerciseDTO))))
        );
    }

    public addExercisesToCourse = (exerciseDTOs: ExerciseDTO[], course: Course): Promise<Exercise[]> => {
        return lastValueFrom(this.http.post<ExerciseDTO[]>(`/v2/courses/${ course.id }/exercises`, exerciseDTOs)
            .pipe(map((exerciseDTOList: ExerciseDTO[]) => exerciseDTOList.map((exerciseDTO: ExerciseDTO) => new Exercise(exerciseDTO))))
        );
    }

    public editExercise = (exercise: Exercise): Promise<Exercise> => {
        return lastValueFrom(this.http.put<ExerciseDTO>("/exercises/" + exercise.id, exercise.toDTO())
            .pipe(map((exerciseDTO: ExerciseDTO) => new Exercise(exerciseDTO)))
        );
    }
}
