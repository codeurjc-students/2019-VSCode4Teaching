import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewChildren } from '@angular/core';
import { Modal } from "bootstrap";
import { Course } from "../../../../../model/course.model";
import { ExerciseUserInfoStatus } from "../../../../../model/exercise-user-info.model";
import { ExerciseDirectoryComponent } from "./exercise-directory/exercise-directory.component";

@Component({
    selector: 'app-teacher-course-add-exercises',
    templateUrl: './add-exercises.component.html',
    styleUrls: ['./add-exercises.component.scss']
})
export class AddExercisesComponent implements AfterViewInit {
    @Input("course") course!: Course;

    // Output event to notify the parent component that the upload of all exercises has finished
    @Output("uploadFinished") uploadFinished: EventEmitter<void>;
    public finishedUploads: number;

    // View children to access the exercise directories
    @ViewChildren("exerciseDirectory") exerciseDirectories!: ExerciseDirectoryComponent[];

    // Directory picker management
    public directoryPicked?: FileSystemDirectoryHandle;
    public checkSubdirectories = false;
    public potentialEntries: FileSystemDirectoryHandle[] = [];

    // Upload status
    public status: ExerciseUserInfoStatus;

    // Modal management
    private addExercisesModal!: Modal;
    @ViewChild("addExercisesModal") private addExercisesModalElementRef!: ElementRef;

    constructor() {
        this.uploadFinished = new EventEmitter<void>();
        this.finishedUploads = 0;
        this.status = "NOT_STARTED";
    }


    public ngAfterViewInit(): void {
        this.addExercisesModal = new Modal(this.addExercisesModalElementRef.nativeElement, { backdrop: "static" });
    }


    public openAddExercisesModal(): void {
        this.status = "NOT_STARTED";
        this.addExercisesModal.show();
    }

    public closeAddExercisesModal(): void {
        if (this.status !== "IN_PROGRESS") {
            this.addExercisesModal.hide();
            this.directoryPicked = undefined;
            this.potentialEntries = [];
        }
    }


    public refreshParentCourses(): void {
        this.finishedUploads++;
        if (this.finishedUploads === this.exerciseDirectories.length) {
            this.uploadFinished.emit();
            this.status = "FINISHED";
        }
    }


    public async pickDirectory(): Promise<void> {
        try {
            this.directoryPicked = await showDirectoryPicker({ mode: "read" });
            await this.refreshSelection();
        } catch (e) {
        }
    }

    public uploadExercises(): void {
        const validExerciseNames = this.exerciseDirectories.map((directory: ExerciseDirectoryComponent) => directory.exerciseName.valid).reduce((a, b) => a && b, true);
        if (validExerciseNames) {
            this.status = "IN_PROGRESS";
            this.exerciseDirectories.forEach((directory: ExerciseDirectoryComponent) => directory.zipAndUpload());
        }
    }


    public async refreshSelection(): Promise<void> {
        if (this.directoryPicked) {
            this.potentialEntries = [];
            if (this.checkSubdirectories) {
                for await (const entry of this.directoryPicked.values()) {
                    if (entry.kind === "directory" && entry.name.match(/^[^.]/)) {
                        this.potentialEntries.push(entry as FileSystemDirectoryHandle);
                    }
                }
                this.potentialEntries.sort((a, b) => a.name.localeCompare(b.name));
            } else {
                this.potentialEntries = [this.directoryPicked];
            }
            this.status = "NOT_STARTED";
        }
    }
}
