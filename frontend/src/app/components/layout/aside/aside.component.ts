import { NgClass } from "@angular/common";
import { Component } from '@angular/core';
import { AsideItem } from "@app-model/aside/aside.model";
import { AsideService } from "@app-services/aside/aside.service";

@Component({
    selector: 'app-layout-aside',
    templateUrl: './aside.component.html',
    imports: [
        NgClass
    ],
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
