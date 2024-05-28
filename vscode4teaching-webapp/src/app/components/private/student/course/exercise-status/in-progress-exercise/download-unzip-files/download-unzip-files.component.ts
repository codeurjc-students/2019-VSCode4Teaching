import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExerciseUserInfo, ExerciseUserInfoStatus } from "../../../../../../../model/exercise-user-info.model";
import { DownloadUnzipDTO, DownloadUnzipService } from "../../../../../../../services/file-system/download-unzip/download-unzip.service";
import { FileExchangeService } from "../../../../../../../services/rest-api/file-exchange/file-exchange.service";
import { ProgressBarDTO } from "../../../../../../helpers/progress-bar/progress-bar.component";

@Component({
    selector: 'app-student-exercise-download-unzip',
    templateUrl: './download-unzip-files.component.html',
    styleUrls: ['../in-progress-exercise.component.scss']
})
export class DownloadUnzipFilesComponent {
    @Input("exerciseDirectoryHandle") exerciseDirectoryHandle!: FileSystemDirectoryHandle | undefined;
    @Input("eui") eui!: ExerciseUserInfo;

    @Output("exercisePrepared") exercisePreparedEmitter: EventEmitter<boolean>;

    public showStepperProgress: boolean;
    public progressBar: ProgressBarDTO;
    public stepperStatus: { download: ExerciseUserInfoStatus, unzip: ExerciseUserInfoStatus }; // ExerciseUserInfoStatus used as a helper for defining the status of the download and unzip processes


    constructor(private downloadUnzipService: DownloadUnzipService,
                private fileExchangeService: FileExchangeService
    ) {
        this.exercisePreparedEmitter = new EventEmitter();

        this.showStepperProgress = false;
        this.progressBar = { percentage: 0, process: "", visible: true };
        this.stepperStatus = { download: "NOT_STARTED", unzip: "NOT_STARTED" };
    }

    public async downloadExercise() {
        this.showStepperProgress = true;

        if (this.exerciseDirectoryHandle) {
            this.downloadUnzipService.downloadAndUnzip(
                this.fileExchangeService.getOwnProposalByExerciseId(this.eui.exercise.id),
                this.exerciseDirectoryHandle
            ).subscribe({
                next: (progress: DownloadUnzipDTO) => {
                    if (progress.operation === "Downloading…") {
                        this.stepperStatus.download = "IN_PROGRESS";
                    } else if (progress.operation === "Unzipping…") {
                        this.stepperStatus.download = "FINISHED";
                        this.stepperStatus.unzip = "IN_PROGRESS";
                    }
                    this.progressBar.process = progress.operation;
                    this.progressBar.percentage = progress.percentage;
                },
                complete: () => {
                    this.stepperStatus.unzip = "FINISHED";
                    this.progressBar.visible = false;
                    this.exercisePreparedEmitter.emit(true);
                }
            })
        }
    }
}
