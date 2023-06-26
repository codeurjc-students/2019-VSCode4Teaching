import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { fileSave } from "browser-fs-access";
import { ExerciseUserInfo, ExerciseUserInfoStatus } from "../../../../../../model/exercise-user-info.model";
import { FileExchangeService } from "../../../../../../services/rest-api/file-exchange/file-exchange.service";

/**
 * This is the first of three components generated to implement the functionality of downloading the progress of an exercise and synchronizing its progress with the server in real time.
 *
 * In the first step, students can perform several operations following this flow:
 * - In case they have not started the exercise, they can mark it as started.
 * - Download the exercise, for which they will press a button that will start the download. This download process is graphically illustrated by an interactive progress bar.
 * - Once the download is complete, a window opens automatically to select the destination of the downloaded compressed file.
 * - Finally, a button is displayed to allow students to continue to the next step.
 */
@Component({
    selector: 'app-exercise-step1',
    templateUrl: './exercise-step1.component.html',
})
export class ExerciseStep1Component implements OnChanges {
    // Incoming information from parent component
    /** Currently active step (1, 2 or 3) of synchronization progress. Its value comes from {@link ExerciseComponent} */
    @Input("activeStep") activeStep: number = 0;
    /** Exercise User Info (EUI) coming from backend server. It is changed when status is set to "IN_PROGRESS" and it is emitted through an event to its parent component. */
    @Input("exerciseUserInfo") exerciseUserInfo!: ExerciseUserInfo;

    // Outgoing information to parent component
    /** These events are emitted when the current step has been completed in order to communicate it to the next step as well as to the parent.
     *  Only one of these events is emitted per exercise, as it is not possible to go backwards in the step flow. */
    @Output("stepFinished") stepFinished: EventEmitter<void>;
    /** These asynchronous events are emitted when the status of the ExerciseUserInfo has been changed and instance has to be changed for parent component and other sibling components.
     *  Only one of these events is emitted per exercise, and it is emitted only if status is changed to "IN_PROGRESS". */
    @Output("exerciseStatusChanged") exerciseStatusChanged: EventEmitter<ExerciseUserInfoStatus>;

    // Intra-component information
    /** It is used during the download of the file of the student's current progress in the exercise. */
    percentageProgressBarDownload: number;
    /** Used to control the status of the progress file download in the exercise. */
    downloadStatus: 'NOT_REQUESTED' | 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'ERROR';


    constructor(private fileExchangeService: FileExchangeService) {
        // Outgoing information to parent component
        this.stepFinished = new EventEmitter();
        this.exerciseStatusChanged = new EventEmitter(true);

        // Intra-component information
        this.percentageProgressBarDownload = 0;
        this.downloadStatus = 'NOT_REQUESTED';
    }


    // ANGULAR LIFECYCLE HOOKS
    /** Only change that has to be attended is exercise user info's instance. It can be changed due to two possible causes:
     *
     * 1 -> Exercise has been changed, so a new backend instance has been retrieved in parent component.
     *      In that case, current instance of this component has to be "reloaded", re-initializing its own properties.
     *
     * 2 -> Status has been changed from "NOT_STARTED" to "IN_PROGRESS".
     *      Since that change can only be performed in this component, that scenario has to be ignored. */
    ngOnChanges(changes: SimpleChanges): void {
        if ("exerciseUserInfo" in changes && changes["exerciseUserInfo"].currentValue) {
            // Scenario 1: exercise has changed because exerciseUserInfo's ID has changed
            // Scenario 2 is ignored because a status change does not change exerciseUserInfo's ID
            if (changes["exerciseUserInfo"].previousValue?.id !== changes["exerciseUserInfo"].currentValue.id) {
                // Intra-component information is re-instantiated for new incoming exercise
                this.percentageProgressBarDownload = 0;
                this.downloadStatus = 'NOT_REQUESTED';
            }
        }
    }


    // USER INTERFACE INTERACTION HANDLERS
    /** When "Start exercise" button is clicked, exercise user info's status is changed to "IN_PROGRESS".
     *  This information is emitted to parent component, who sends this information to backend and changes current exercise user info's instance status' value. */
    async markAsInProgress() {
        if (this.exerciseUserInfo.status === "NOT_STARTED")
            this.exerciseStatusChanged.emit("IN_PROGRESS");
    }

    /** When "Download" button is clicked, a ZIP file with student's exercise files is requested to backend.
     *  Backend provides partial information about download process that it is interactively shown to user. */
    async downloadExerciseFiles() {
        this.downloadStatus = 'PENDING';
        this.fileExchangeService
            // Download is requested to backend
            .getExerciseFilesByExerciseId(this.exerciseUserInfo.exercise.id)

            // Backend provides multiple responses about HTTP request
            .subscribe({
                next: async (value: HttpEvent<Blob>) => {
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

                        // File name is obtained from Content-Disposition header (set in backend)
                        const fileName = value.headers.get("Content-Disposition")?.split(/"/)[1];

                        // File is saved where user wants it (a dialog box is opened in desktop browsers)
                        const file = new Blob([value.body ?? new Blob()], { type: "application/zip" });
                        await fileSave(file, {
                            fileName: fileName ?? "Download.zip",
                            mimeTypes: ["application/zip"]
                        });
                    }
                },

                // If an error occurred, user is notified
                error: () => this.downloadStatus = 'ERROR'
            });
    }
}
