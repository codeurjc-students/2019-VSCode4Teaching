import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { CurrentUserService } from "../current-user/current-user.service";

@Injectable({
    providedIn: 'root'
})
export class Guards {

    constructor(private router: Router) {
    }

    public goToLogin(): Promise<boolean> {
        return this.router.navigate(["/login"]);
    }
}

export const isLoggedIn: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot, guards = inject(Guards)): Promise<boolean> => {
    const currentUser = await inject(CurrentUserService).currentUser;
    if (currentUser === undefined) {
        await guards.goToLogin();
        return false;
    }
    return true;
}

export const isTeacher: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot, guards = inject(Guards)): Promise<boolean> => {
    const currentUser = await inject(CurrentUserService).currentUser;
    if (currentUser === undefined) {
        return false;
    }
    const isTeacher = currentUser.isTeacher;
    if (!isTeacher) {
        await guards.goToLogin();
        return false;
    }
    return true;
}
