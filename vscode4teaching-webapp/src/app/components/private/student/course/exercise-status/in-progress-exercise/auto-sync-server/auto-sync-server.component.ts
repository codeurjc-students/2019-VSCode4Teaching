import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { supported as fileSystemAccessApiSupported } from "browser-fs-access";
import { ExerciseUserInfo } from "../../../../../../../model/exercise-user-info.model";
import { DirectoryNode, TreeDiffResult } from "../../../../../../../model/file-system/file-system.model";
import { SyncJobPriorityQueue } from "../../../../../../../model/file-system/syncjob-priority-queue";
import { SyncJob } from "../../../../../../../model/file-system/sync-job.model";
import { FileSystemReadDirectoryService } from "../../../../../../../services/file-system/read-directory/file-system-read-directory.service";
import { FileExchangeService } from "../../../../../../../services/rest-api/file-exchange/file-exchange.service";
import { Observable } from "rxjs";
import { HttpEvent, HttpEventType } from "@angular/common/http";
import * as bootstrap from "bootstrap";
import { ExerciseUserInfoService } from "../../../../../../../services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";

@Component({
  selector: 'app-student-exercise-sync',
  templateUrl: './auto-sync-server.component.html',
  styleUrls: ['../in-progress-exercise.component.scss']
})
export class AutoSyncServerComponent implements OnInit, OnDestroy {
    @Input("eui") eui!: ExerciseUserInfo;
    @Input("exerciseDirectoryHandle") exerciseDirectoryHandle: FileSystemDirectoryHandle | undefined;

    exerciseStructure: DirectoryNode | undefined;
    syncJobs: { pending: SyncJobPriorityQueue, current: SyncJob | undefined, finished: SyncJob[] };

    currentSyncStatus: "WAITING_FOR_CHANGES" | "SENDING_FILES";

    activeSyncSemaphore: boolean;
    syncIntervalId: number | undefined;

    @ViewChild("syncDetailsModal") syncDetailsModalElementRef!: ElementRef;
    syncDetailsModal!: bootstrap.Modal;


    constructor(private fileSystemReadDirectoryService: FileSystemReadDirectoryService,
                private fileExchangeService: FileExchangeService,
                private euiService: ExerciseUserInfoService) {
        this.syncJobs = {
            pending: new SyncJobPriorityQueue(2),
            current: undefined,
            finished: []
        };

        this.currentSyncStatus = "WAITING_FOR_CHANGES";

        this.activeSyncSemaphore = false;
    }


    async ngOnInit() {
        if (this.exerciseDirectoryHandle) {
            this.exerciseStructure = await this.fileSystemReadDirectoryService.supportedFileSystemAPI(this.exerciseDirectoryHandle);
        }

        this.syncDetailsModal = new bootstrap.Modal(`#${this.syncDetailsModalElementRef.nativeElement.id}`, {});

        this.syncIntervalId = setInterval(() => this.completeSync(), 500);
    }

    ngOnDestroy() {
        if (this.syncIntervalId !== undefined) clearInterval(this.syncIntervalId);
    }


    // MODAL
    openModal() {
        this.syncDetailsModal.show();
    }

    closeModal() {
        this.syncDetailsModal.hide();
    }


    // SYNCHRONIZATION ORCHESTRATION
    public completeSync() {
        this.directorySync().then(() => this.serverSync());
    };


    public async directorySync(): Promise<void> {
        // The current directory structure is obtained in the same way as in step 2.
        // If a FileSystemDirectoryHandle already exists (in case the File System Access API can be used), it is not necessary to ask user for the directory again.
        let currentDirectoryStructure: DirectoryNode | undefined;
        if (fileSystemAccessApiSupported && this.exerciseDirectoryHandle) {
            currentDirectoryStructure = await this.fileSystemReadDirectoryService.supportedFileSystemAPI(this.exerciseDirectoryHandle);
        }

        // If directory structure could be obtained, diff algorithm is executed and results (new files, deleted files, modified files) are enqueued
        if (currentDirectoryStructure !== undefined && this.exerciseStructure !== undefined) {
            const comparison: TreeDiffResult = this.fileSystemReadDirectoryService.directoryNodeFilesDiff(this.exerciseStructure, currentDirectoryStructure);
            this.syncJobs.pending.enqueueFromTreeDiffResult(comparison);

            // Current directory structure is saved as rootDirectoryNode (to be used in the next algorithm execution)
            this.exerciseStructure = currentDirectoryStructure;
        }
    }

    public async serverSync(): Promise<void> {
        if (!this.activeSyncSemaphore) {
            while (this.syncJobs.pending.pendingElements() !== 0) {
                this.activeSyncSemaphore = true;

                // A new work is extracted from pending works' queue
                // If undefined there are no more works, so loop is broken (should have been broken by its condition)
                let newSyncWork = this.syncJobs.pending.dequeue();
                if (newSyncWork === undefined) break;
                this.syncJobs.current = newSyncWork;
                this.currentSyncStatus = "SENDING_FILES";

                /* Whether the current job is a creation, deletion or modification job, the general procedure is the same:
                 * - An HTTP request is generated and sent (through fileExchangeService methods).
                 * - The returned Observable is "flattened" in the form of a promise and waits for that promise to be finished (httpEventObservableAsPromise)
                 * - The job is moved to the completed list when promise is finished to continue with other job (httpEventPromiseFinalizationHandler).
                 */
                let fileReqPromise: Promise<any> = Promise.resolve();
                if (this.syncJobs.current.type === "CREATION") {
                    fileReqPromise = this.httpEventObservableAsPromise(
                        this.fileExchangeService.createExerciseSingleFileByExerciseIdRelativePath(
                            this.eui.exercise.id, this.syncJobs.current.node.relativePath, this.syncJobs.current.node.fileBlob
                        )
                    );
                } else if (this.syncJobs.current.type === "MODIFICATION") {
                    fileReqPromise = this.httpEventObservableAsPromise(
                        this.fileExchangeService.editExerciseSingleFileByExerciseIdRelativePath(
                            this.eui.exercise.id, this.syncJobs.current.node.relativePath, this.syncJobs.current.node.fileBlob
                        )
                    );
                } else if (this.syncJobs.current.type === "DELETION") {
                    fileReqPromise = this.httpEventObservableAsPromise(
                        this.fileExchangeService.deleteExerciseSingleFileByExerciseIdRelativePath(
                            this.eui.exercise.id, this.syncJobs.current.node.relativePath
                        )
                    );
                }

                if (fileReqPromise !== undefined) {
                    this.eui.modifiedFiles = [this.syncJobs.current.node.relativePath];
                    await this.euiService.editExerciseUserInfoByExercise(this.eui.exercise, this.eui);
                    await this.httpEventPromiseFinalizationHandler(fileReqPromise);
                }
            }

            this.currentSyncStatus = "WAITING_FOR_CHANGES";
        }

        // When loop is finished, semaphore allows to start algorithm again
        this.activeSyncSemaphore = false;
    }

    // AUXILIARY METHODS (for serverSync() routine)
    private httpEventObservableAsPromise(obs: Observable<HttpEvent<any>>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.syncJobs.current !== undefined)
                obs.subscribe({
                    next: (value: HttpEvent<any>) => {
                        if (this.syncJobs.current !== undefined) {
                            // Case 1: HTTP request has been sent to server
                            if (value.type === HttpEventType.Sent) {
                                this.syncJobs.current.syncStatus = 'IN_PROGRESS';
                            }
                            // Case 2: HTTP server returned first response Header
                            if (value.type === HttpEventType.ResponseHeader) {
                                if (value.status !== 200) reject();
                            }
                            // Case 3: upload is in progress, server periodically reports progress
                            else if (value.type === HttpEventType.UploadProgress) {
                                if (value.total) this.syncJobs.current.progress = Math.round(100 * value.loaded / value.total);
                            }
                            // Case 4: upload has been finished
                            else if (value.type === HttpEventType.Response) {
                                if (value.status === 200) {
                                    this.syncJobs.current.syncStatus = 'FINISHED';
                                    resolve();
                                } else {
                                    reject();
                                }
                            }
                        }
                    },
                    // If an error occurs during observable lifecycle, promise fails (gets rejected)
                    error: () => reject()
                });
        });
    }

    private async httpEventPromiseFinalizationHandler(promise: Promise<void>): Promise<void> {
        if (this.syncJobs.current !== undefined) await promise;
        if (this.syncJobs.current !== undefined) this.syncJobs.finished.unshift(this.syncJobs.current);
        this.syncJobs.current = undefined;
    }
}
