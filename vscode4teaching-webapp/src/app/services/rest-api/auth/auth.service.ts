import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AuthPersistenceMethodInterface } from "../../auth/persistence-methods/auth-persistence-method-interface.service";

export type LoginCredentials = { username: string, password: string };

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private authPersistence: AuthPersistenceMethodInterface<string>, private http: HttpClient) {
    }

    public login = (userCredentials: LoginCredentials): Promise<string> => {
        return new Promise((resolve, reject) => {
            this.http.post("/login", userCredentials).subscribe({
                next: (res: any) => {
                    this.authPersistence.setAuthenticatedUser(res["encryptedJwtToken"]);
                    resolve(userCredentials.username);
                },
                error: (err: any) => reject(err)
            });
        });
    }

    public isUserLogged = (): boolean => {
        return this.authPersistence.existsUserAuthenticated();
    }

    public logout = (): void => {
        if (this.authPersistence.existsUserAuthenticated()) {
            this.authPersistence.setAuthenticatedUser(null);
        }
    }
}
