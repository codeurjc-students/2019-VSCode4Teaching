import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-helper-delay-since',
    templateUrl: './delay-since.component.html'
})
export class DelaySinceComponent implements OnInit, OnChanges, OnDestroy {
    @Input("since") since!: Date;

    public readableElapsedTime: string;
    private elapsedTimeIntervalId?: number;

    constructor() {
        // Default value for the updatedElapsedTime (input value is not yet available)
        this.readableElapsedTime = "-";
    }

    ngOnInit() {
        // When onInit hook occurs, the input value is available, so elapsed time can be calculated
        this.getInterpretedElapsedTime();
    }

    ngOnChanges(changes: SimpleChanges) {
        // Base timestamp input can be changed, and the component should update accordingly
        if ("since" in changes) {
            this.getInterpretedElapsedTime();
        }
    }

    ngOnDestroy() {
        // Clear the interval when the component is destroyed
        if (this.elapsedTimeIntervalId) {
            clearInterval(this.elapsedTimeIntervalId);
        }
    }

    public getInterpretedElapsedTime() {
        let elapsedTime = (new Date().getTime() - this.since.getTime()) / 1000;
        if (elapsedTime < 0) {
            elapsedTime = 0;
        }
        let unit = "s";
        let nextDelay = 1000;
        if (elapsedTime > 60) {
            elapsedTime /= 60; // convert to minutes
            nextDelay = 1000;
            if (elapsedTime > 60) {
                elapsedTime /= 60; // convert to hours
                nextDelay = 60000;
                if (elapsedTime > 24) {
                    elapsedTime /= 24; // convert to days
                    nextDelay = 3600000;
                    if (elapsedTime > 365) {
                        elapsedTime /= 365; // convert to years
                        nextDelay = 86400000;
                        unit = "yr";
                    } else {
                        unit = "d";
                    }
                } else {
                    unit = "h";
                }
            } else {
                unit = "min";
            }
        }

        this.readableElapsedTime = `${Math.floor(elapsedTime)} ${unit}`;

        if (this.elapsedTimeIntervalId !== undefined) {
            clearInterval(this.elapsedTimeIntervalId);
        }
        this.elapsedTimeIntervalId = setInterval(() => {
            this.getInterpretedElapsedTime();
        }, nextDelay);
    }
}
