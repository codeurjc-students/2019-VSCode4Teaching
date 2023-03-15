import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { User } from "../../../model/user.model";
import { AuthPersistenceMethodInterface } from "../persistence-methods/auth-persistence-method-interface.service";

@Injectable({
    providedIn: 'root'
})
export class CurrentUserService {

    private _currentUser: User | undefined;

    constructor(private authPersistence: AuthPersistenceMethodInterface<string>, private http: HttpClient) {
        this._currentUser = undefined;
    }

    get currentUser(): Promise<User | undefined> {
        return (async () => {
            if (this._currentUser == undefined) {
                // Reload current user info from backend
                try {
                    this._currentUser = await this.reloadCurrentUserInfo();
                } catch (e) {
                    // No user logged in or persisted info, auth persistence should be deleted
                    this.authPersistence.setAuthenticatedUser(null);
                    return undefined;
                }
            }
            return this._currentUser;
        })();
    }

    public disposeCurrentUserInfo = (): void => {
        this._currentUser = undefined;
    }

    private reloadCurrentUserInfo = (): Promise<User> => {
        return new Promise((resolve, reject) => {
            this.http.get<User>("/currentuser").subscribe({
                next: (res: User) => resolve(res),
                error: () => reject()
            });
        })
    }
}
