import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from "chart.js/auto";
import { ExerciseUserInfo, ExerciseUserInfoStatus } from "../../../../../../model/exercise-user-info.model";

type ConsideredTimePeriods = 5 | 30 | 60 | 120;

@Component({
    selector: 'app-teacher-exercise-general-statistics',
    templateUrl: './general-statistics.component.html',
    styleUrls: ['./general-statistics.component.scss']
})
export class GeneralStatisticsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    @Input("euis") public exerciseUsersInfo: ExerciseUserInfo[] | undefined;

    // Col 1: semicircle chart
    public chart!: Chart<"doughnut">;
    @ViewChild("semicircle") public chartElementRef!: ElementRef<HTMLCanvasElement>;

    // Col 2: status statistics
    public euisByStatus: Record<ExerciseUserInfoStatus, number>;

    // Col 3: modifications by time period
    public modificationsByTimePeriod: { minutesPeriod: ConsideredTimePeriods, textRepresentation: string, value?: number }[];
    public modificationsByTimePeriodInterval: number | undefined;

    constructor() {
        this.euisByStatus = { NOT_STARTED: 0, IN_PROGRESS: 0, FINISHED: 0 };
        this.modificationsByTimePeriod = [
            { minutesPeriod: 5, textRepresentation: "5 mins." },
            { minutesPeriod: 30, textRepresentation: "30 mins." },
            { minutesPeriod: 60, textRepresentation: "hour" },
            { minutesPeriod: 120, textRepresentation: "2 hours" }
        ];
    }

    ngOnInit() {
        this.getStatistics();
    }

    ngAfterViewInit() {
        this.renderChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        if ("exerciseUsersInfo" in changes && changes["exerciseUsersInfo"].previousValue !== undefined) {
            this.getStatistics();
        }
    }

    ngOnDestroy(): void {
        if (this.modificationsByTimePeriodInterval) {
            clearInterval(this.modificationsByTimePeriodInterval);
        }
    }

    private getStatistics() {
        Object.keys(this.euisByStatus).forEach((key) => {
            this.euisByStatus[key as ExerciseUserInfoStatus] = this.exerciseUsersInfo?.reduce(
                (acc, eui) => acc + (eui.status === key ? 1 : 0), 0
            ) ?? 0;
        });

        if (this.chartElementRef) {
            this.renderChart();
        }

        const updateModificationValues = () => {
            const currentTime: number = new Date().getTime();
            for (const euiNMinutes of this.modificationsByTimePeriod) {
                euiNMinutes.value = this.exerciseUsersInfo?.filter((eui: ExerciseUserInfo) =>
                    (eui.updateDateTime) ? ((currentTime - eui.updateDateTime.getTime()) / 60000) < euiNMinutes.minutesPeriod : false
                ).length ?? 0;
            }
        }
        updateModificationValues();

        if (this.modificationsByTimePeriodInterval) {
            clearInterval(this.modificationsByTimePeriodInterval);
        }
        this.modificationsByTimePeriodInterval = setInterval(updateModificationValues, 1000);
    }

    private renderChart() {
        const data: number[] = [this.euisByStatus.NOT_STARTED, this.euisByStatus.IN_PROGRESS, this.euisByStatus.FINISHED];
        if (this.chart) {
            this.chart.data.datasets[0].data = data;
            this.chart.update();
        } else {
            this.chart = new Chart(this.chartElementRef.nativeElement, {
                type: "doughnut",
                data: {
                    labels: ["Not Started", "In Progress", "Finished"],
                    datasets: [
                        {
                            data,
                            backgroundColor: [
                                "rgba(239, 83, 80, 0.2)",
                                "rgba(249, 168, 37, 0.2)",
                                "rgba(102, 187, 106, 0.2)"
                            ],
                            borderWidth: 1,
                            hoverBorderWidth: 1,
                            borderColor: "#FFFFFF",
                            hoverBorderColor: "#FFFFFF",
                            hoverOffset: 0
                        },
                    ]
                },
                options: {
                    animation: true,
                    responsive: true,
                    maintainAspectRatio: false,
                    rotation: -90,
                    circumference: 180,
                    cutout: "75%",
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
        }
    }
}
