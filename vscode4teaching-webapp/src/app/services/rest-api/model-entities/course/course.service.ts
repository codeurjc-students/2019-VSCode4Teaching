import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { User } from "../../../../model/user.model";
import { Course } from "../../../../model/course.model";
import { lastValueFrom, of, switchMap } from "rxjs";
import { Exercise } from "../../../../model/exercise.model";
import { ExerciseService } from "../exercise/exercise.service";

@Injectable({
    providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient, private exerciseService: ExerciseService) { }

    public getCourseById = (courseId: number, includeExercises: boolean = false): Promise<Course> => {
        return new Promise<Course>(async (res, rej) => {
            try {
                const course = await lastValueFrom(this.http.get<Course>("/courses/" + courseId));

                if (includeExercises) {
                    course.exercises = await this.exerciseService.getExercisesByCourseId(courseId);
                }

                return res(course);
            } catch (e) {
                return rej(e);
            }
        });
    }

    public getCoursesByUser = (user: User): Promise<Course[]> => {
        return lastValueFrom(
            this.http
                .get<Course[]>("/users/" + user.id + "/courses")
                .pipe(
                    switchMap((courseList: Course[]) => of(courseList ?? []) )
                )
        );
    }
}
