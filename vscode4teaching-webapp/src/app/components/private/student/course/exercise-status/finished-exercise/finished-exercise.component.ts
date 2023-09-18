import { Component } from '@angular/core';
import { ExerciseStatusComponent } from "../exercise-status.component";
import { FileSystemWriteDirectoryService } from "../../../../../../services/file-system/write-directory/file-system-write-directory.service";

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
