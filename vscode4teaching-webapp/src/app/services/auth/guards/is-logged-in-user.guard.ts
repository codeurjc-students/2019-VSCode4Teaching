import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    Router,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentUserService } from "../current-user/current-user.service";

@Injectable({
    providedIn: 'root'
})
export class IsLoggedInUserGuard implements CanActivate, CanActivateChild {

    constructor(private currentUserService: CurrentUserService, private router: Router) {
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const validAccess = (await this.currentUserService.currentUser) !== undefined;
        if (!validAccess) {
            await this.router.navigate(["/login"]);
            return validAccess;
        }
        return (await this.currentUserService.currentUser) !== undefined;
    }

    async canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        return (await this.currentUserService.currentUser) === undefined;
    }
}
