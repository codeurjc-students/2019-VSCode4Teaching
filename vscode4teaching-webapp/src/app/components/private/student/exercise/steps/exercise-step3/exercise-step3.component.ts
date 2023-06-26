import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { directoryOpen } from "browser-fs-access";
import { Observable } from "rxjs";
import { ExerciseUserInfo, ExerciseUserInfoStatus } from "../../../../../../model/exercise-user-info.model";
import { DirectoryNode, TreeDiffResult } from "../../../../../../model/file-system/file-system.model";
import { SyncJobPriorityQueue } from "../../../../../../model/file-system/syncjob-priority-queue";
import { SyncJob } from "../../../../../../model/file-system/sync-job.model";
import { FileSystemService } from "../../../../../../services/file-system/file-system.service";
import { FileExchangeService } from "../../../../../../services/rest-api/file-exchange/file-exchange.service";

/**
 * This is the third of three components generated to implement the functionality of downloading the progress of an exercise and synchronizing its progress with the server in real time.
 *
 * In this third step, synchronization can work in two different ways depending on the availability of the File System Access API:
 * - In case the File System Access API is available, the synchronization routine will be executed automatically every 500 ms.
 * - Otherwise, it must be executed manually by the user who, in addition, will have to select the root directory of the exercise each time they want to synchronize its progress with the server.
 *
 * When directory is deep-scanned, it gets compared with previous scan and differences are retrieved as a 3-tuple of SyncWorks: creation (new files), deletion (deleted files) and modification (edited files).
 * This result is enqueued and, when idle, the browser will dequeue pending synchronization works (instances of SyncWork) and sending them to backend. All this process is shown graphically to user.
 *
 * The only interaction users can perform on this component is to mark the exercise as finished.
 */
@Component({
    selector: 'app-exercise-step3',
    templateUrl: './exercise-step3.component.html'
})
export class ExerciseStep3Component implements OnChanges, OnDestroy {
    // Incoming information from parent component
    /** Currently active step (1, 2 or 3) of synchronization progress. Its value comes from {@link ExerciseComponent} */
    @Input("activeStep") activeStep: number = 0;
    /** Exercise User Info (EUI) coming from backend server. It is changed when status is set to "FINISHED" and it is emitted through an event to its parent component. */
    @Input("exerciseUserInfo") exerciseUserInfo!: ExerciseUserInfo;
    /** Directory structure that initially comes from parent (generated in step 2).
     * It is changed every time a deep-scanning algorithm of the root directory of exercise is executed and compared with previously saved one. */
    @Input("rootDirectoryNode") rootDirectoryNode: DirectoryNode | undefined;
    /** When File System Access API is available, this is a reference to root directory on local file system, otherwise it will be undefined.
     * It comes from parent (set in step 2) and does not change during interaction. */
    @Input("fileSystemDirectoryHandle") fileSystemDirectoryHandle: FileSystemDirectoryHandle | undefined;

    // Outgoing information to parent component
    /** These asynchronous events are emitted when the status of the ExerciseUserInfo has been changed and instance has to be changed for parent component and other sibling components.
     *  Only one of these events is emitted per exercise, and it is emitted only if status is changed to "FINISHED". */
    @Output("exerciseStatusChanged") exerciseStatusChanged: EventEmitter<ExerciseUserInfoStatus>;

    // Intra-component information: SyncWorks
    /** It is a priority queue instance ({@link SyncJobPriorityQueue}) with two levels that contains pending sync works. */
    pendingSyncWorks: SyncJobPriorityQueue = new SyncJobPriorityQueue(2);
    /** When synchronization routine is working, this will refer to the synchronization work that will be being performed at that moment. */
    currentSyncWork: SyncJob | undefined;
    /** It is an ordered list of finished sync works. */
    finishedSyncWorks: SyncJob[];

    // Other intra-component information
    /** True when a sync routine is working, false otherwise. A new routine can only be started if semaphore allows it (when there is not another one). */
    semaphore: boolean = false;
    /** True if browser supports File System Access API, false otherwise. It is set on construction and never changes. */
    supportedFileSystemAccessAPI: boolean = false;
    /** When File System Access API is available, this contains the setInterval returned id to be able to perform the later clearInterval operation to stop synchronization. */
    syncIntervalId: number | undefined;


    constructor(private fileSystemService: FileSystemService,
                private fileExchangeService: FileExchangeService) {
        // Outgoing information to parent component
        this.exerciseStatusChanged = new EventEmitter(true);

        // Intra-component information: SyncWorks
        this.pendingSyncWorks = new SyncJobPriorityQueue(2);
        this.finishedSyncWorks = [];

        // Other intra-component information
        this.supportedFileSystemAccessAPI = this.fileSystemService.fileSystemAccessAPISupported();
    }


    // ANGULAR LIFECYCLE HOOKS
    /** Two possible changes in the values coming from the father need to be observed:
     *
     * - Step 3 activation. When this step is activated, it is necessary to run the automatic synchronization in browsers that can use the File System Access API.
     *   This execution of setInterval sets syncIntervalId to be able to clearInterval when component instance gets destroyed or exercise changes.
     * - ExerciseUserInfo's instance. This instance can be changed due to two possible causes:
     *   - User has changed currently active exercise, so a new backend instance has been retrieved in parent component.
     *     In that case, current instance of this component has to be deactivated and synchronization has to be stopped.
     *   - Status has been changed from "IN_PROGRESS" to "FINISHED".
     *     Since that change can only be performed in this component, that scenario has to be ignored.
     */
    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        // Scenario 1: step 3 activation and running of automatic completeSync every 500 ms if File System Access API is available.
        if ("activeStep" in changes && changes["activeStep"].currentValue === 3) {
            if (this.supportedFileSystemAccessAPI)
                this.syncIntervalId = setInterval(() => this.completeSync(), 500);
            else
                this.completeSync();
        }

        // Scenario 2: component's own contents have to be deactivated and disposed if exercise changed
        if ("exerciseUserInfo" in changes && changes["exerciseUserInfo"].currentValue) {
            if (changes["exerciseUserInfo"].previousValue?.id !== changes["exerciseUserInfo"].currentValue.id) {
                // Intra-component information is re-instantiated for new incoming exercise
                this.semaphore = false;
                this.currentSyncWork = undefined;
                this.pendingSyncWorks = new SyncJobPriorityQueue(2);
                this.finishedSyncWorks = [];

                // Automatic synchronization is stopped (if existing)
                this.ngOnDestroy();
                this.syncIntervalId = undefined;
            }
        }
    }

    /** When component's lifecycle ends or gets terminated (e.g. when user navigates to other page), automatic synchronization gets stopped. */
    ngOnDestroy() {
        if (this.syncIntervalId !== undefined) clearInterval(this.syncIntervalId);
    }


    // USER INTERFACE INTERACTION HANDLERS
    /** When "Mark as Finished" button is clicked, exercise user info's status is changed to "FINISHED".
     *  This information is emitted to parent component, who sends this information to backend and changes current exercise user info's instance status' value. */
    public markAsFinished() {
        this.exerciseStatusChanged.emit("FINISHED");
    }


    // SYNCHRONIZATION ORCHESTRATION
    /**
     * The synchronization of the files contained in the root directory of the exercise provided by the student in step 2 with the files stored on the server is clearly divided into two steps executed consecutively:
     *
     * - The fetching of files from the local root directory and the diff algorithm performed between the last synchronization and the current state, resulting in lists of created, deleted and modified files.
     * - Once the created, deleted and modified files have been retrieved, the creation of synchronization jobs for each of them by means of HTTP requests to the server, sending them sequentially to avoid blockages and problems derived from concurrent file writing.
     *
     * Thus, the implemented synchronization performs the first step (directorySync()) and, once completed, launches the synchronization with the server (serverSync()).
     */
    public completeSync() {
        this.directorySync().then(() => this.serverSync());
    };


    /**
     * This is the first step of file synchronization with the server.
     *
     * In case the File System Access API is available and in step 2 a pointer to the root directory (fileSystemDirectoryHandle) was successfully obtained, this procedure automatically obtains the new directory contents.
     * Otherwise, the user must reselect the directory in a local file system directory chooser.
     *
     * Once the directory contents are obtained, an algorithm is launched to detect differences between the tree structures representing the directory at its last synchronization and its current state.
     * This returns a 3-tuple of new files, deleted files and modified files that is enqueued in the priority queue of pending synchronization jobs.
     */
    public async directorySync(): Promise<void> {
        // The current directory structure is obtained in the same way as in step 2.
        // If a FileSystemDirectoryHandle already exists (in case the File System Access API can be used), it is not necessary to ask user for the directory again.
        let currentDirectoryStructure: DirectoryNode | undefined;
        if (this.fileSystemService.fileSystemAccessAPISupported() && this.fileSystemDirectoryHandle) {
            currentDirectoryStructure = await this.fileSystemService.supportedFileSystemAPI(this.fileSystemDirectoryHandle);
        } else {
            // User is asked for exercise's directory and a list of files deep-contained in directory is returned
            const recursiveFileList: File[] = (await directoryOpen({ recursive: true })) as File[];
            currentDirectoryStructure = this.fileSystemService.notSupportedFileSystemAPI(recursiveFileList);
        }

        // If directory structure could be obtained, diff algorithm is executed and results (new files, deleted files, modified files) are enqueued
        if (currentDirectoryStructure !== undefined && this.rootDirectoryNode !== undefined) {
            const comparison: TreeDiffResult = this.fileSystemService.directoryNodeFilesDiff(this.rootDirectoryNode, currentDirectoryStructure);
            this.pendingSyncWorks.enqueueFromTreeDiffResult(comparison);

            // Current directory structure is saved as rootDirectoryNode (to be used in the next algorithm execution)
            this.rootDirectoryNode = currentDirectoryStructure;
        }
    }

    /**
     * This is the second step of file synchronization with the server.
     *
     * When the new, deleted and modified files have been queued in the priority queue of pending jobs, the execution of the synchronization with the server is launched.
     *
     * In case it has been launched previously and has not been completed, the traffic light will prevent the synchronization from being launched again and the previously started execution will also take care of the new jobs that have arrived in the priority queue.
     * Otherwise, the semaphore will allow the synchronization to be executed, which will not finish until the queue is empty.
     *
     * The following flow is followed for each job:
     * - It is unglued from the priority queue of pending jobs and assigned as a running job.
     * - Depending on its type, the request to the backend is generated with the file and the necessary information to upload it.
     * - The process is blocked until the upload is completed.
     * - When finished, it is added to the list of completed jobs and the process looks for a new job in pending works' priority queue.
     *
     * The algorithm terminates when there are no more jobs to be uploaded.
     */
    public async serverSync(): Promise<void> {
        if (!this.semaphore) {
            while (this.pendingSyncWorks.pendingElements() !== 0) {
                this.semaphore = true;

                // A new work is extracted from pending works' queue
                // If undefined there are no more works, so loop is broken (should have been broken by its condition)
                let newSyncWork = this.pendingSyncWorks.dequeue();
                if (newSyncWork === undefined) break;
                this.currentSyncWork = newSyncWork;

                /* Whether the current job is a creation, deletion or modification job, the general operation is the same:
                 * - An HTTP request is generated and sent (fileExchangeService methods).
                 * - The returned Observable is "flattened" in the form of a promise and waits for that promise to be finished (httpEventObservableAsPromise)
                 * - The job is moved to the completed list when promise is finished to continue with other job (httpEventPromiseFinalizationHandler).
                 */
                if (this.currentSyncWork.type === "CREATION") {
                    await this.httpEventPromiseFinalizationHandler(this.httpEventObservableAsPromise(
                        this.fileExchangeService.createExerciseSingleFileByExerciseIdRelativePath(
                            this.exerciseUserInfo.exercise.id, this.currentSyncWork.node.relativePath, this.currentSyncWork.node.fileBlob
                        )
                    ));
                } else if (this.currentSyncWork.type === "MODIFICATION") {
                    await this.httpEventPromiseFinalizationHandler(this.httpEventObservableAsPromise(
                        this.fileExchangeService.modifyExerciseSingleFileByExerciseIdRelativePath(
                            this.exerciseUserInfo.exercise.id, this.currentSyncWork.node.relativePath, this.currentSyncWork.node.fileBlob
                        )
                    ));
                } else if (this.currentSyncWork.type === "DELETION") {
                    await this.httpEventPromiseFinalizationHandler(this.httpEventObservableAsPromise(
                        this.fileExchangeService.deleteExerciseSingleFileByExerciseIdRelativePath(
                            this.exerciseUserInfo.exercise.id, this.currentSyncWork.node.relativePath
                        )
                    ));
                }
            }
        }

        // When loop is finished, semaphore allows to start algorithm again
        this.semaphore = false;
    }

    // AUXILIARY METHODS (for serverSync() routine)
    /** HTTP requests are handled by a client in Angular that returns observables (a promise-based concept that allows more than one value to be returned).
     * To facilitate asynchronous management, the obtained observable is "flattened" and a single promise is returned.
     * This method is used in all types of synchronization jobs and makes it easy to manage the successive types of HTTP events returned by the client during the course of the upload. */
    private httpEventObservableAsPromise(obs: Observable<HttpEvent<any>>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.currentSyncWork !== undefined)
                obs.subscribe({
                    next: (value: HttpEvent<any>) => {
                        if (this.currentSyncWork !== undefined) {
                            // Case 1: HTTP request has been sent to server
                            if (value.type === HttpEventType.Sent) {
                                this.currentSyncWork.syncStatus = 'IN_PROGRESS';
                            }
                            // Case 2: HTTP server returned first response Header
                            if (value.type === HttpEventType.ResponseHeader) {
                                if (value.status !== 200) reject();
                            }
                            // Case 3: upload is in progress, server periodically reports progress
                            else if (value.type === HttpEventType.UploadProgress) {
                                if (value.total) this.currentSyncWork.progress = Math.round(100 * value.loaded / value.total);
                            }
                            // Case 4: upload has been finished
                            else if (value.type === HttpEventType.Response) {
                                if (value.status === 200) {
                                    this.currentSyncWork.syncStatus = 'FINISHED';
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

    /** The algorithm operation must be blocked until the promise obtained in the {@link httpEventObservableAsPromise} method is finished.
     * Upon promise's completion, it is necessary to add the completed job to the completed list and reset the currently active job pointer. */
    private async httpEventPromiseFinalizationHandler(promise: Promise<void>): Promise<void> {
        if (this.currentSyncWork !== undefined) await promise;
        if (this.currentSyncWork !== undefined) this.finishedSyncWorks.unshift(this.currentSyncWork);
        this.currentSyncWork = undefined;
    }
}
