import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class AuthTokenService {
    public jwtToken: string | undefined;

    constructor() {
        this.jwtToken = undefined;
    }

    get isLogged(): boolean {
        return !(this.jwtToken === undefined && this.jwtToken !== "");
    }
}
