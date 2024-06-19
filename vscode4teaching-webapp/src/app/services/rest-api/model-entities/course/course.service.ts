import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { lastValueFrom, map } from "rxjs";
import { Course } from "../../../../model/course.model";
import { CourseDTO } from "../../../../model/rest-api/course.dto";
import { UserDTO } from "../../../../model/rest-api/user.dto";
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
            .pipe(map((courseDTOList: CourseDTO[]) => courseDTOList?.map((courseDTO: CourseDTO) => new Course(courseDTO)) ?? []))
        );
    }


    public getSharingCodeByCourse = (course: Course): Promise<string> => {
        return lastValueFrom(this.http.get("/courses/" + course.id + "/code", { responseType: "text" }));
    }

    public getCourseBySharingCode = (sharingCode: string): Promise<Course> => {
        return lastValueFrom(this.http.get<CourseDTO>("/v2/courses/code/" + sharingCode)
            .pipe(map((courseDTO: CourseDTO) => new Course(courseDTO))));
    }

    public joinCourseBySharingCode = (sharingCode: string): Promise<Course> => {
        return lastValueFrom(this.http.put<CourseDTO>("/courses/code/" + sharingCode, {})
            .pipe(map((courseDTO: CourseDTO) => new Course(courseDTO))));
    }


    public getEnrolledUsersByCourse = (course: Course): Promise<User[]> => {
        return lastValueFrom(this.http.get<UserDTO[]>("/courses/" + course.id + "/users")
            .pipe(map((userDTOList: UserDTO[]) => userDTOList?.map((userDTO: UserDTO) => new User(userDTO)) ?? [])));
    }

    public addUserToCourse = (course: Course, user: User): Promise<Course> => {
        return lastValueFrom(this.http.post<CourseDTO>("/courses/" + course.id + "/users", { ids: [ user.id ] })
            .pipe(map((courseDTO: CourseDTO) => new Course(courseDTO))));
    }

    public removeUserFromCourse = (course: Course, user: User): Promise<Course> => {
        return lastValueFrom(this.http.delete<CourseDTO>("/courses/" + course.id + "/users", { body: { ids: [ user.id ] } })
            .pipe(map((courseDTO: CourseDTO) => new Course(courseDTO))));
    }
}
