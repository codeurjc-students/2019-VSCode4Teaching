import { DatePipe, NgOptimizedImage } from "@angular/common";
import { Component, Input, OnInit } from '@angular/core';
import { DelaySinceComponent } from "@app-components/helpers/delay-since/delay-since.component";
import { ExerciseUserInfo } from "@app-model/exercise-user-info.model";
import { FileSystemWriteDirectoryService } from "@app-services/file-system/write-directory/file-system-write-directory.service";

@Component({
    selector: 'app-teacher-exercise-individual-student-progress',
    imports: [
        DelaySinceComponent,

        DatePipe,
        NgOptimizedImage
    ],
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
