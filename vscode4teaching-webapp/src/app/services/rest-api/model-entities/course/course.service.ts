import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { lastValueFrom, map } from "rxjs";
import { Course } from "../../../../model/course.model";
import { CourseDTO } from "../../../../model/rest-api/course.dto";
import { User } from "../../../../model/user.model";
import { ExerciseService } from "../exercise/exercise.service";

@Injectable({
    providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient,
                private exerciseService: ExerciseService
    ) {
    }

    public getCourseById = (courseId: number, includeExercises: boolean = false): Promise<Course> => {
        return new Promise<Course>(async (res, rej) => {
            try {
                const course = await lastValueFrom(this.http.get<CourseDTO>("/courses/" + courseId)
                    .pipe(map((courseDTO: CourseDTO) => new Course(courseDTO)))
                );
                if (includeExercises) {
                    course.exercises = await this.exerciseService.getExercisesInCourse(course);
                }
                return res(course);
            } catch (e) {
                return rej(e);
            }
        });
    }

    public getCoursesByUser = (user: User): Promise<Course[]> => {
        return lastValueFrom(this.http.get<CourseDTO[]>("/users/" + user.id + "/courses")
            .pipe(map((courseDTOList: CourseDTO[]) => courseDTOList.map((courseDTO: CourseDTO) => new Course(courseDTO))))
        );
    }
}
