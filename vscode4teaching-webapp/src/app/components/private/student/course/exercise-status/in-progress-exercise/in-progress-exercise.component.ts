import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ExerciseStatusComponent } from "../exercise-status.component";
import { FileSystemWriteDirectoryService } from "../../../../../../services/file-system/write-directory/file-system-write-directory.service";
import { ExerciseUserInfoService } from "../../../../../../services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";

@Component({
   selector: 'app-student-exercise-status-in-progress',
   templateUrl: './in-progress-exercise.component.html',
   styleUrls: ['./in-progress-exercise.component.scss', '../exercise-status.component.scss']
})
export class InProgressExerciseComponent extends ExerciseStatusComponent implements OnInit, OnChanges {
    public existingFilesInLocalDirectory: boolean;
    public syncToServerActive: boolean;


    constructor(protected override fileSystemWriteDirectoryService: FileSystemWriteDirectoryService, private euiService: ExerciseUserInfoService) {
        super(fileSystemWriteDirectoryService);

        this.existingFilesInLocalDirectory = false;
        this.syncToServerActive = false;
    }


    async ngOnInit(): Promise<void> {
        await this.checkExistingFilesInLocalDirectory();
    }

    async ngOnChanges(changes: SimpleChanges) {
        if ("courseDirectory" in changes && changes["courseDirectory"].currentValue instanceof FileSystemDirectoryHandle && this.courseDirectory instanceof FileSystemDirectoryHandle) {
            await this.checkExistingFilesInLocalDirectory();
        }
    }


    private async checkExistingFilesInLocalDirectory() {
        // Each exercise is saved in a directory into course's one (picked by user)
        this.exerciseDirectory = await this.courseDirectory.getDirectoryHandle(this.fileSystemWriteDirectoryService.getExerciseDirectoryNameByExerciseUserInfo(this.eui), {create: true});

        for await (const [_, entry] of this.exerciseDirectory.entries()) {
            if (entry instanceof FileSystemDirectoryHandle || entry instanceof FileSystemFileHandle) {
                this.existingFilesInLocalDirectory = true;
                break;
            }
        }
    }

    public exerciseFilesReadyHandler(startSynchronization: boolean) {
        this.existingFilesInLocalDirectory = startSynchronization;
        this.syncToServerActive = startSynchronization;
    }

    public async finishExercise() {
        this.eui.status = "FINISHED";

        try {
            await this.euiService.editExerciseUserInfoByExercise(this.eui.exercise, this.eui);
            this.exerciseStatusChanged.emit(this.eui);
        } catch (e) {
            this.eui.status = "IN_PROGRESS";
            this.exerciseStatusChanged.emit(this.eui);
        }
    }
}
