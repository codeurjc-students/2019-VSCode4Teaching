import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { User } from "../model/user.model";
import { AuthTokenService } from "./auth/auth-token.service";
import { environment } from "src/environments/environment";
@Injectable({
    providedIn: "root",
})
export class CommonService {
    // Base URL of REST API
    public baseURL: string = environment.production ? "//localhost:8080" : "//localhost:4200";

    constructor(private http: HttpClient, private auth: AuthTokenService) {}

    // XSRF Token has to be included in every request and it is saved as a cookie that is included in every request
    getXSRFToken(): Observable<string> {
        return this.http.get<string>(this.baseURL + "/api/csrf");
    }

    // Login into VSCode4Teaching webapp using username and password
    login(credentials: { username: string; password: string }): Observable<{ jwtToken: string }> {
        return this.http.post<{ jwtToken: string }>(this.baseURL + "/api/login", credentials, {
            withCredentials: true,
        });
    }

    // When a user is logged in, this method returns its information
    getCurrentUserInfo(): Observable<User | undefined> {
        if (this.auth.isLogged) {
            return this.http.get<User>(this.baseURL + "/api/currentuser", { withCredentials: true });
        } else {
            return of(undefined);
        }
    }
}
