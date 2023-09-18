import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-helper-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
    @Input("current") currentValue!: number;
    @Input("total") totalValue!: number;
    @Input("process") processTag!: string;
    @Input("visible") visible!: boolean;

    protected readonly Math = Math;
}
