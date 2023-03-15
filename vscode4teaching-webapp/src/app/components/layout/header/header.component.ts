import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from "../../../services/auth/current-user/current-user.service";
import { User } from "../../../model/user.model";
import { AuthService } from "../../../services/rest-api/auth.service";
import { Event, NavigationStart, Router } from "@angular/router";

@Component({
    selector: 'app-layout-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    // User if existing any user, null if no user authenticated, undefined while checking backend
    public currentUserInfo: User | null | undefined;

    constructor(public authService: AuthService, private currentUserService: CurrentUserService, private router: Router) {
        this.currentUserInfo = undefined;

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                this.checkCurrentUserInfo();
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
    public logout = (): void => {
        // TODO to be refactored
        this.authService.logout();
        this.currentUserService.disposeCurrentUserInfo();
        this.router.navigate(["/"]);
    }
}
