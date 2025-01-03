import { CommonModule } from "@angular/common";
import { Component } from '@angular/core';
import { Data, Event, NavigationEnd, ResolveEnd, Router, RouterOutlet } from "@angular/router";
import { Observable } from 'rxjs';
import { NotSupportedFileSystemAccessApiComponent } from "./components/helpers/not-supported-file-system-access-api/not-supported-file-system-access-api.component";
import { AsideComponent } from "./components/layout/aside/aside.component";
import { HeaderComponent } from "./components/layout/header/header.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
        AsideComponent,
        HeaderComponent,
        NotSupportedFileSystemAccessApiComponent,

        CommonModule,
        RouterOutlet
    ],
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'VSCode4Teaching';

    showAside = true;
    showHeader = true;

    nextShowAside: boolean | undefined = undefined;
    nextShowHeader: boolean | undefined = undefined;

    constructor(private router: Router) {
        (<Observable<Event>>this.router.events).subscribe((routerEvent: Event) => {
            if (routerEvent instanceof ResolveEnd) {
                const deepestChild = ((e) => {
                    while (e.firstChild !== null) e = e.firstChild;
                    return e;
                })(routerEvent.state.root);

                this.readRouteData(deepestChild.data ?? {});
            }
            if (routerEvent instanceof NavigationEnd) {
                this.changeLayout();
            }
        });
    }

    private readRouteData = (currentRouteData: Data) => {
        this.nextShowAside = !("showAside" in currentRouteData && !currentRouteData["showAside"]);
        this.nextShowHeader = !("showHeader" in currentRouteData && !currentRouteData["showHeader"]);
    }

    private changeLayout = () => {
        this.showAside = this.nextShowAside ?? this.showAside;
        this.showHeader = this.nextShowHeader ?? this.showHeader;
    }
}
