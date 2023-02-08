import { Component } from '@angular/core';
import { Data, Router, RoutesRecognized } from "@angular/router";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'VSCode4Teaching';

    showAside = true;
    showHeader = true;

    constructor(private router: Router) {
        router.events.subscribe((routerEvent) => {
            if (routerEvent instanceof RoutesRecognized) {
                this.readRouteData(routerEvent.state.root.firstChild?.data ?? {});
            }
        })
    }

    private readRouteData = (currentRouteData: Data) => {
        this.showAside = !("showAside" in currentRouteData && !currentRouteData["showAside"]);
        this.showHeader = !("showHeader" in currentRouteData && !currentRouteData["showHeader"]);
    }
}
