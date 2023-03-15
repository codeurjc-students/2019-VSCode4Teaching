import { Injectable } from "@angular/core";

@Injectable()
export abstract class AuthPersistenceMethodInterface<T> {
    public abstract readonly USER_INFO_ITEM_NAME: string;

    public abstract getAuthenticatedUser(): T;

    public abstract setAuthenticatedUser(authenticatedUserInfo: T | null): void;

    public abstract existsUserAuthenticated(): boolean;
}
