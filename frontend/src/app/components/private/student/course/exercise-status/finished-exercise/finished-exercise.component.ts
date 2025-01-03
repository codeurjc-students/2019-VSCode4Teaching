import { Component } from '@angular/core';
import { FileSystemWriteDirectoryService } from "@app-services/file-system/write-directory/file-system-write-directory.service";
import { ExerciseStatusComponent } from "../exercise-status.component";

@Component({
    selector: 'app-student-exercise-status-finished',
    templateUrl: './finished-exercise.component.html',
    styleUrls: ['../exercise-status.component.scss']
})
export class FinishedExerciseComponent extends ExerciseStatusComponent {
    constructor(protected override fileSystemWriteDirectoryService: FileSystemWriteDirectoryService) {
        super(fileSystemWriteDirectoryService);
    }
}
