import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { HttpEventType } from "@angular/common/http";
import { Exercise } from "../../../../../../model/exercise.model";
import { FileExchangeService } from "../../../../../../services/rest-api/file-exchange/file-exchange.service";
import { fileSave } from "browser-fs-access";

@Component({
  selector: 'app-exercise-step1',
  templateUrl: './exercise-step1.component.html',
})
export class ExerciseStep1Component {
    // Incoming information from parent component
    @Input("activeStep") activeStep: number = 0;
    @Input("exercise") exercise!: Exercise;

    // Outgoing information to parent component
    @Output("stepFinished") stepFinished: EventEmitter<void>;

    // Intra-component information
    percentageProgressBarDownload: number;
    downloadStatus: 'NOT_REQUESTED' | 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'ERROR';

    constructor(private fileExchangeService: FileExchangeService) {
        // Outgoing information to parent component
        this.stepFinished = new EventEmitter();

        // Intra-component information
        this.percentageProgressBarDownload = 0;
        this.downloadStatus = 'NOT_REQUESTED';
    }

    async downloadStudentFiles() {
        this.downloadStatus = 'PENDING';
        this.fileExchangeService.getExerciseFilesByExerciseId(this.exercise.id).subscribe({
            next: async (value) => {
                // Case 1: download has just started, a Header comes from server
                if (value.type === HttpEventType.ResponseHeader) {
                    this.downloadStatus = 'IN_PROGRESS';
                }
                // Case 2: download is in progress, server periodically reports progress
                else if (value.type === HttpEventType.DownloadProgress) {
                    if (value.total) this.percentageProgressBarDownload = Math.round(100 * value.loaded / value.total);
                }
                // Case 3: download has just finished, Blob is packed and downloaded (user chooses where to save it)
                else if (value.type === HttpEventType.Response) {
                    this.downloadStatus = 'FINISHED';
                    const fileName = value.headers.get("Content-Disposition")?.split(/"/)[1];

                    const file = new Blob([value.body ?? new Blob()], { type: "application/zip" });
                    await fileSave(file, {
                        fileName: fileName ?? "Download.zip",
                        mimeTypes: ["application/zip"]
                    });
                }
            },
            error: () => this.downloadStatus = 'ERROR'
        });
    }
}
