import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from "../../../services/auth/current-user/current-user.service";
import { User } from "../../../model/user.model";
import { AuthService } from "../../../services/rest-api/auth.service";
import { Event, NavigationStart, Router } from "@angular/router";

@Component({
    selector: 'app-layout-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    // User if existing any user, null if no user authenticated, undefined while checking backend
    public currentUserInfo: User | null | undefined;

    constructor(public authService: AuthService, private currentUserService: CurrentUserService, private router: Router) {
        this.currentUserInfo = undefined;

        this.router.events.subscribe(async (event: Event) => {
            if (event instanceof NavigationStart) {
                await this.checkCurrentUserInfo();
            }
        });
    }

    async ngOnInit() {
        await this.checkCurrentUserInfo();
    }

    private async checkCurrentUserInfo() {
        this.currentUserInfo = (this.authService.isUserLogged())
            ? await this.currentUserService.currentUser
            : null;
    }

    // Header buttons' actions
    public navigateToDashboard = async () => {
        await this.router.navigate(["/dashboard"]);
    }

    public logout = async () => {
        // TODO to be refactored
        this.authService.logout();
        this.currentUserService.disposeCurrentUserInfo();
        await this.router.navigate(["/"]);
    }
}
