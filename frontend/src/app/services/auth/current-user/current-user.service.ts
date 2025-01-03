import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { UserDTO } from "@app-model/rest-api/user.dto";
import { User } from "@app-model/user.model";
import { lastValueFrom, map } from 'rxjs';
import { AuthPersistenceMethodInterface } from "../persistence-methods/auth-persistence-method-interface.service";

@Injectable({
    providedIn: 'root'
})
export class CurrentUserService {

    constructor(private authPersistence: AuthPersistenceMethodInterface<string>, private http: HttpClient) {
        // this._currentUser = undefined;
    }

    private _currentUser: User | undefined;

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
        return lastValueFrom(this.http.get<UserDTO>("/currentuser")
            .pipe(map((userDTO: UserDTO) => new User(userDTO))));
    }
}
