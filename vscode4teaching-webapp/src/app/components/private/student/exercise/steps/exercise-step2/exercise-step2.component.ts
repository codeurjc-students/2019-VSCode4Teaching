import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Exercise } from "../../../../../../model/exercise.model";
import { directoryOpen } from "browser-fs-access";
import { DirectoryNode } from "../../../../../../model/file-system/file-system.model";
import { FileSystemService } from "../../../../../../services/file-system/file-system.service";

@Component({
  selector: 'app-exercise-step2',
  templateUrl: './exercise-step2.component.html'
})
export class ExerciseStep2Component {
    // Incoming information from parent component
    @Input("activeStep") activeStep: number = 0;
    @Input("exercise") exercise!: Exercise;

    // Outgoing information to parent component
    @Output("stepFinished") stepFinished: EventEmitter<void>;
    @Output("newFileSystemDirectoryHandle") saveFileSystemDirectoryHandle: EventEmitter<FileSystemDirectoryHandle>;
    @Output("newRootDirectoryNode") saveRootDirectoryNode: EventEmitter<DirectoryNode>;

    // Intra-component information
    errorStep2: boolean;

    constructor(private fileSystemReaderService: FileSystemService) {
        this.stepFinished = new EventEmitter();
        this.saveFileSystemDirectoryHandle = new EventEmitter();
        this.saveRootDirectoryNode = new EventEmitter();

        this.errorStep2 = false;
    }

    async chooseDirectory() {
        let directoryStructure: DirectoryNode | undefined;
        if (this.fileSystemReaderService.fileSystemAPISupported()) {
            const fileSystemDirectoryHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
            this.saveFileSystemDirectoryHandle.emit(fileSystemDirectoryHandle);
            directoryStructure = await this.fileSystemReaderService.supportedFileSystemAPI(fileSystemDirectoryHandle);
        } else {
            const recursiveFileList: File[] = (await directoryOpen({ recursive: true })) as File[];
            directoryStructure = this.fileSystemReaderService.notSupportedFileSystemAPI(recursiveFileList);
        }

        if (directoryStructure === undefined) {
            this.errorStep2 = true;
        } else {
            this.saveRootDirectoryNode.emit(directoryStructure);
            this.stepFinished.emit();
        }
    }
}
