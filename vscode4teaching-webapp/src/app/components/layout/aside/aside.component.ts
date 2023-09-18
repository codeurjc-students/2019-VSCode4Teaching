import { Component } from '@angular/core';
import { AsideItem } from "../../../model/aside/aside.model";
import { AsideService } from "../../../services/aside/aside.service";

@Component({
    selector: 'app-layout-aside',
    templateUrl: './aside.component.html',
    styleUrls: ['./aside.component.scss']
})
export class AsideComponent {

    public asideContent!: AsideItem[];

    constructor(private asideService: AsideService) {
        this.asideService.asideEventEmitter.subscribe({
            next: (aside: AsideItem[]) => {
                this.asideContent = aside;
            }
        });
    }
}
