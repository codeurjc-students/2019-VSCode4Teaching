import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { User } from "../model/user.model";
import { CommonService } from "./common.service";

@Injectable({
    providedIn: "root",
})
export class TeacherSignUpService {
    constructor(private http: HttpClient, private common: CommonService) {}

    // Password modification process
    changePassword(id: number, newPassword: string): Observable<User | undefined> {
        if (id === 0) {
            return of();
        }
        return this.http.patch<User>(this.common.baseURL + "/api/users/" + id + "/password", newPassword, {
            withCredentials: true,
        });
    }
}
