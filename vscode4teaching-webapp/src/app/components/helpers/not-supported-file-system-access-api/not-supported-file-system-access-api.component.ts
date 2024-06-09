import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationStart, Router } from "@angular/router";
import { supported as fileSystemAccessApiSupported } from "browser-fs-access";
import { Subscription } from "rxjs";
import { CurrentUserService } from "../../../services/auth/current-user/current-user.service";

@Component({
  selector: 'app-not-supported-file-system-access-api',
  templateUrl: './not-supported-file-system-access-api.component.html',
  styleUrls: ['./not-supported-file-system-access-api.component.scss']
})
export class NotSupportedFileSystemAccessApiComponent implements OnInit, OnDestroy {
    public showFsaAPINotSupportedMessage: boolean;
    public routerSubscription?: Subscription;

    constructor(private curUser: CurrentUserService, private router: Router) {
        this.showFsaAPINotSupportedMessage = false;
    }

    async ngOnInit(): Promise<void> {
        this.routerSubscription = this.router.events.subscribe({
            next: async (event: Event) => {
                if (event instanceof NavigationStart) {
                    this.showFsaAPINotSupportedMessage = !fileSystemAccessApiSupported && (await this.curUser.currentUser) !== undefined
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.routerSubscription?.unsubscribe();
    }
}
