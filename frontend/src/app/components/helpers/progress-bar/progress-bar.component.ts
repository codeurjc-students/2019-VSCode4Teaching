import { CommonModule } from "@angular/common";
import { Component, Input } from '@angular/core';

export interface ProgressBarDTO {
    percentage: number;
    process: string | undefined;
    visible: boolean;
}

@Component({
    selector: 'app-helper-progress-bar',
    imports: [
        CommonModule
    ],
    templateUrl: './progress-bar.component.html'
})
export class ProgressBarComponent {
    @Input("info") public info!: ProgressBarDTO;

    protected readonly Math = Math;
}
