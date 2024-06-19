import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from "@angular/forms";
import { Course } from "../../../../../../model/course.model";
import { ExerciseUserInfoStatus } from "../../../../../../model/exercise-user-info.model";
import { ExerciseDTO } from "../../../../../../model/rest-api/exercise.dto";
import { ZipUploadDTO, ZipUploadService } from "../../../../../../services/file-system/zip-upload/zip-upload.service";
import { FileExchangeService } from "../../../../../../services/rest-api/file-exchange/file-exchange.service";
import { ExerciseService } from "../../../../../../services/rest-api/model-entities/exercise/exercise.service";
import { ProgressBarDTO } from "../../../../../helpers/progress-bar/progress-bar.component";

@Component({
    selector: 'app-teacher-course-add-exercise-exercise-directory',
    templateUrl: './exercise-directory.component.html',
    styleUrls: ['./exercise-directory.component.scss']
})
export class ExerciseDirectoryComponent implements OnInit {
    @Input("entry") directory!: FileSystemDirectoryHandle;
    @Input("course") course!: Course;

    // Output event to notify the parent component that the upload of the exercise has finished
    @Output("uploadFinished") uploadFinished: EventEmitter<void>;

    // Exercise data: name, template (and solution if included) directories
    public exerciseName!: FormControl;
    public templateDirectory?: FileSystemDirectoryHandle;
    public solutionDirectory?: FileSystemDirectoryHandle;
    public exerciseIncludesSolution: boolean;

    // Upload status (detailed progress)
    public uploadStatus: {
        status: ExerciseUserInfoStatus,
        progress: ProgressBarDTO,
        steps: { createdExercise: ExerciseUserInfoStatus, uploadedTemplate: ExerciseUserInfoStatus, uploadedSolution?: ExerciseUserInfoStatus }
    };

    public error?: string;


    constructor(private exerciseService: ExerciseService,
                private zipUploadService: ZipUploadService,
                private fileExchangeService: FileExchangeService
    ) {
        this.exerciseIncludesSolution = false;
        this.uploadStatus = {
            status: "NOT_STARTED",
            progress: { percentage: 0, process: undefined, visible: false },
            steps: { createdExercise: "NOT_STARTED", uploadedTemplate: "NOT_STARTED" }
        };
        this.uploadFinished = new EventEmitter<void>();
    }

    public async ngOnInit(): Promise<void> {
        if (this.directory instanceof FileSystemDirectoryHandle) {
            this.exerciseName = new FormControl(this.directory.name, [Validators.required, Validators.minLength(4)]);

            for await (const entry of this.directory.values()) {
                if (entry instanceof FileSystemDirectoryHandle && entry.name === "solution") {
                    this.solutionDirectory = entry;
                }
                if (entry instanceof FileSystemDirectoryHandle && entry.name === "template") {
                    this.templateDirectory = entry;
                }
            }

            if (this.solutionDirectory === undefined) {
                this.templateDirectory = this.directory;
            } else {
                this.uploadStatus.steps.uploadedSolution = "NOT_STARTED";
                this.exerciseIncludesSolution = true;
            }
        } else {
            this.error = "The directory is not supported";
        }
    }

    public async zipAndUpload() {
        if (
            this.templateDirectory instanceof FileSystemDirectoryHandle
            && (!this.solutionDirectory || this.solutionDirectory instanceof FileSystemDirectoryHandle)
            && this.uploadStatus.status === "NOT_STARTED"
            && this.exerciseName.valid
        ) {
            this.uploadStatus.status = "IN_PROGRESS";
            this.exerciseName.disable();

            // Create exercise in course
            const exerciseDTO: ExerciseDTO = {
                course: this.course.toDTO(),
                name: this.exerciseName.value,
                includesTeacherSolution: this.exerciseIncludesSolution,
                solutionIsPublic: false,
                allowEditionAfterSolutionDownloaded: false,
            }
            this.uploadStatus.steps.createdExercise = "IN_PROGRESS";
            const exercise = (await this.exerciseService.addExercisesToCourse([exerciseDTO], this.course))[0];
            this.uploadStatus.steps.createdExercise = "FINISHED";

            // Upload template
            this.uploadStatus.progress.visible = true;
            this.uploadStatus.steps.uploadedTemplate = "IN_PROGRESS";
            await new Promise<void>((res) => {
                this.zipUploadService.zipAndUpload(
                    this.templateDirectory!,
                    (blob: Blob) => this.fileExchangeService.addTemplateToExercise(blob, exercise)
                ).subscribe({
                    next: (zipUploadDTO: ZipUploadDTO) => {
                        this.uploadStatus.progress.process = zipUploadDTO.operation;
                        this.uploadStatus.progress.percentage = zipUploadDTO.percentage;
                    },
                    complete: () => {
                        res();
                    }
                });
            });
            this.uploadStatus.steps.uploadedTemplate = "FINISHED";

            // Upload solution
            if (this.exerciseIncludesSolution && this.solutionDirectory) {
                this.uploadStatus.steps.uploadedSolution = "IN_PROGRESS";
                await new Promise<void>((res) => {
                    this.zipUploadService.zipAndUpload(
                        this.solutionDirectory!,
                        (zipFile: Blob) => this.fileExchangeService.addSolutionToExercise(zipFile, exercise)
                    ).subscribe({
                        next: (zipUploadDTO: ZipUploadDTO) => {
                            this.uploadStatus.progress.process = zipUploadDTO.operation;
                            this.uploadStatus.progress.percentage = zipUploadDTO.percentage;
                        },
                        complete: () => {
                            res();
                        }
                    });
                });
                this.uploadStatus.steps.uploadedSolution = "FINISHED";
            }
            this.uploadStatus.progress.visible = false;
            this.uploadStatus.status = "FINISHED";
            this.uploadFinished.emit();
        }
    }
}
