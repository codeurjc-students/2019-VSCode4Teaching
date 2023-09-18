import { Component } from '@angular/core';
import { ExerciseStatusComponent } from "../exercise-status.component";
import { ExerciseUserInfoService } from "../../../../../../services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";
import { FileSystemWriteDirectoryService } from "../../../../../../services/file-system/write-directory/file-system-write-directory.service";

@Component({
   selector: 'app-student-exercise-status-not-started',
   templateUrl: './not-started-exercise.component.html',
   styleUrls: ['../exercise-status.component.scss']
})
export class NotStartedExerciseComponent extends ExerciseStatusComponent {
    constructor(protected override fileSystemWriteDirectoryService: FileSystemWriteDirectoryService,
                private euiService: ExerciseUserInfoService) {
        super(fileSystemWriteDirectoryService);
    }

    public async startExercise() {
        this.eui.status = "IN_PROGRESS";

        try {
            await this.euiService.editExerciseUserInfoByExercise(this.eui.exercise, this.eui);
            this.exerciseStatusChanged.emit(this.eui);
        } catch (e) {
            this.eui.status = "NOT_STARTED";
            this.exerciseStatusChanged.emit(this.eui);
        }
    }
}
