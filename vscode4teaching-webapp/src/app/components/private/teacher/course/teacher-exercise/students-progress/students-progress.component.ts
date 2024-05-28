import { HttpEvent } from "@angular/common/http";
import { Component, Input } from '@angular/core';
import { Observable } from "rxjs";
import { ExerciseUserInfo } from "../../../../../../model/exercise-user-info.model";
import { Exercise } from "../../../../../../model/exercise.model";
import { DownloadUnzipDTO, DownloadUnzipService } from "../../../../../../services/file-system/download-unzip/download-unzip.service";
import { FileExchangeService } from "../../../../../../services/rest-api/file-exchange/file-exchange.service";
import { ProgressBarDTO } from "../../../../../helpers/progress-bar/progress-bar.component";

@Component({
    selector: 'app-teacher-exercise-students-progress',
    templateUrl: './students-progress.component.html'
})
export class StudentsProgressComponent {
    @Input("exercise") public exercise!: Exercise;
    @Input("euis") public exerciseUsersInfo!: ExerciseUserInfo[];

    // Dashboard can be in preview mode or in full mode
    // Preview mode (true) means that the user has not selected a local directory to save the files and the dashboard only shows real-time information on the progress of students
    // Full mode (false) means that the user has selected a local directory to save the files and the dashboard allows them to download the files on demand
    public isPreview: boolean;
    // Files last update timestamp (only for full mode)
    public filesLastUpdateTimestamp: Date | undefined;
    // Only one download can be active at a time (either students files, template files or solution files)
    public downloadProgressBar: ProgressBarDTO;

    // Download progress bar variables
    public isActiveDownload: "STUDENTS" | "TEMPLATE" | "SOLUTION" | false;
    // Show/hide students identities
    public studentIdentitiesShown: boolean;
    // Directory where the files will be saved (only for full mode) chosen by the user through File System Access API
    #courseDirectory: FileSystemDirectoryHandle | undefined;

    constructor(private downloadUnzipService: DownloadUnzipService,
                private fileExchangeService: FileExchangeService
    ) {
        this.isPreview = true;
        this.isActiveDownload = false;
        this.downloadProgressBar = { visible: false, process: undefined, percentage: 0 };
        this.studentIdentitiesShown = true;
    }

    public get courseDirectory(): FileSystemDirectoryHandle | undefined {
        return this.#courseDirectory;
    }

    private set courseDirectory(directory: FileSystemDirectoryHandle | undefined) {
        this.#courseDirectory = directory;
        this.isPreview = directory === undefined;
    }

    public async pickExerciseLocalDirectory(): Promise<void> {
        try {
            this.courseDirectory = await showDirectoryPicker({ mode: 'readwrite' });
        } catch (e) {
        }
    }

    public async dismissExerciseLocalDirectory(): Promise<void> {
        this.courseDirectory = undefined;
    }

    public toggleStudentsIdentities(): void {
        this.studentIdentitiesShown = !this.studentIdentitiesShown;
    }

    public getAllStudentsFiles(): void {
        if (this.courseDirectory && !this.isActiveDownload) {
            this.isActiveDownload = "STUDENTS";
            return this.handleDownloadUnzip(
                this.fileExchangeService.getAllProposalsByExerciseId(this.exercise.id),
                this.courseDirectory
            );
        }
    }

    public async getTemplateFiles(): Promise<void> {
        if (this.courseDirectory && !this.isActiveDownload) {
            this.isActiveDownload = "TEMPLATE";
            this.handleDownloadUnzip(
                this.fileExchangeService.getTemplateByExerciseId(this.exercise.id),
                await this.courseDirectory.getDirectoryHandle("template", { create: true })
            );
        }
    }

    public async getSolutionFiles(): Promise<void> {
        if (this.courseDirectory && !this.isActiveDownload) {
            this.isActiveDownload = "SOLUTION";
            this.handleDownloadUnzip(
                this.fileExchangeService.getSolutionByExerciseId(this.exercise.id),
                await this.courseDirectory.getDirectoryHandle("solution", { create: true })
            );
        }
    }

    private handleDownloadUnzip(fileRequest: Observable<HttpEvent<Blob>>,
                                targetDirectory: FileSystemDirectoryHandle
    ) {
        this.downloadProgressBar.visible = true;
        this.downloadUnzipService.downloadAndUnzip(fileRequest, targetDirectory).subscribe({
            next: (downloadUnzipDTO: DownloadUnzipDTO) => {
                this.downloadProgressBar.process = downloadUnzipDTO.operation;
                this.downloadProgressBar.percentage = downloadUnzipDTO.percentage;
            },
            complete: () => {
                this.isActiveDownload = false;
                this.downloadProgressBar.visible = false;
                this.filesLastUpdateTimestamp = new Date();
            }
        });
    }
}
