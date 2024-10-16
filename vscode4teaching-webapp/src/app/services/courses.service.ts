import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Course } from "../model/course.model";
import { CommonService } from "./common.service";

@Injectable({
    providedIn: "root",
})
export class CoursesService {
    constructor(private http: HttpClient, private common: CommonService) {}

    // In version 2.1
    getCourseByCode(code: string): Observable<Course> {
        return this.http.get<Course>(this.common.baseURL + "/api/v2/courses/code/" + code, { withCredentials: true });
    }
}
