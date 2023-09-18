import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExerciseUserInfo } from "../../../../../model/exercise-user-info.model";
import { FileSystemWriteDirectoryService } from "../../../../../services/file-system/write-directory/file-system-write-directory.service";

@Component({ template: "" })
export class ExerciseStatusComponent {
    @Input("eui") public eui!: ExerciseUserInfo;
    @Input("courseDirectory") public courseDirectory!: FileSystemDirectoryHandle;

    @Output("exerciseStatusChanged") public exerciseStatusChanged: EventEmitter<ExerciseUserInfo>;

    public exerciseDirectory: FileSystemDirectoryHandle | undefined;


    constructor(protected fileSystemWriteDirectoryService: FileSystemWriteDirectoryService) {
        this.exerciseStatusChanged = new EventEmitter<ExerciseUserInfo>();
    }
}
