import { AuthPersistenceMethodInterface } from "./auth-persistence-method-interface.service";

export class AuthSessionstorage implements AuthPersistenceMethodInterface<string>{

    public readonly USER_INFO_ITEM_NAME = "Encrypted-Authorization";

    constructor() {
    }

    public getAuthenticatedUser(): string {
        return sessionStorage.getItem(this.USER_INFO_ITEM_NAME) ?? "";
    }

    public setAuthenticatedUser(authenticatedUserInfo: string | null): void {
        if (typeof authenticatedUserInfo === "string") {
            sessionStorage.setItem(this.USER_INFO_ITEM_NAME, authenticatedUserInfo);
        } else {
            sessionStorage.removeItem(this.USER_INFO_ITEM_NAME);
        }
    }

    public existsUserAuthenticated(): boolean {
        return sessionStorage.getItem(this.USER_INFO_ITEM_NAME) !== null;
    }
}
