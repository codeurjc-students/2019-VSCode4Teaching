import { Component, Input, OnInit } from '@angular/core';
import { ExerciseUserInfo } from "../../../../../../../model/exercise-user-info.model";
import { FileSystemWriteDirectoryService } from "../../../../../../../services/file-system/write-directory/file-system-write-directory.service";

@Component({
    selector: 'app-teacher-exercise-individual-student-progress',
    templateUrl: './individual-student-progress.component.html',
    styleUrls: ['./individual-student-progress.component.scss']
})
export class IndividualStudentProgressComponent implements OnInit {
    @Input("eui") public exerciseUserInfo!: ExerciseUserInfo;
    @Input("exerciseLocalDirectory") public exerciseLocalDirectory!: FileSystemDirectoryHandle | undefined;
    @Input("studentIdentityShown") public studentIdentityShown!: boolean;

    public directoryName!: string;

    constructor(private fileSystemWriteDirectoryService: FileSystemWriteDirectoryService) {
    }

    ngOnInit(): void {
        this.directoryName = this.fileSystemWriteDirectoryService.getStudentDirectoryNameByExerciseUserInfo(this.exerciseUserInfo);
    }
}
