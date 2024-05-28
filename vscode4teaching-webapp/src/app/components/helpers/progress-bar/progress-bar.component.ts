import { Component, Input } from '@angular/core';

export interface ProgressBarDTO {
    percentage: number;
    process: string | undefined;
    visible: boolean;
}

@Component({
    selector: 'app-helper-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
    @Input("info") public info!: ProgressBarDTO;

    protected readonly Math = Math;
}
