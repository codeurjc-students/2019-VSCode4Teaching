import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { User } from "../../../model/user.model";
import { Course } from "../../../model/course.model";
import { lastValueFrom, of, switchMap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient) { }

    public getCoursesByUser = (user: User): Promise<Course[]> => {
        return lastValueFrom(
            this.http
                .get<Course[]>("/users/" + user.id + "/courses", {})
                .pipe(
                    switchMap((courseList: Course[]) => of(courseList ?? []) )
                )
        );
    }
}
