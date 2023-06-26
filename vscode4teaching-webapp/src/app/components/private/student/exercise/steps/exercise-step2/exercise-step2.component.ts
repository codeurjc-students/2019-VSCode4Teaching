import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { directoryOpen } from "browser-fs-access";
import { ExerciseUserInfo } from "../../../../../../model/exercise-user-info.model";
import { DirectoryNode } from "../../../../../../model/file-system/file-system.model";
import { FileSystemService } from "../../../../../../services/file-system/file-system.service";

/**
 * This is the second of three components generated to implement the functionality of downloading the progress of an exercise and synchronizing its progress with the server in real time.
 *
 * In this second step, students choose the directory formed after unzipping the ZIP file obtained in the previous step via a dialog box that allows them to browse their local file system.
 *
 * Once they choose it, the application registers FileSystemDirectoryHandle pointer to this directory to access it when necessary (in step 3).
 * It also obtains a first tree structure representing the contents of the directory (rootDirectoryNode) that will be used successively to compare the previous and current structures of the directory and to proceed with the synchronization.
 */
@Component({
    selector: 'app-exercise-step2',
    templateUrl: './exercise-step2.component.html'
})
export class ExerciseStep2Component implements OnChanges {
    // Incoming information from parent component
    /** Currently active step (1, 2 or 3) of synchronization progress. Its value comes from {@link ExerciseComponent} */
    @Input("activeStep") activeStep: number = 0;
    /** Exercise User Info (EUI) coming from backend server. It is not changed within this child component. */
    @Input("exerciseUserInfo") exerciseUserInfo!: ExerciseUserInfo;

    // Outgoing information to parent component
    /** These events are emitted when user has selected the root directory of the current exercise.
     *  Only one of these events is emitted per exercise, and it is emitted only if File System Access API is enabled:
     *  - If enabled, this pointer will allow to perform automatic synchronization with server and files will be read automatically.
     *  - If not enabled, user will have to navigate to directory on every save action, so saving this pointer would be useless. */
    @Output("newFileSystemDirectoryHandle") saveFileSystemDirectoryHandle: EventEmitter<FileSystemDirectoryHandle>;
    /** These events are emitted when the directory has been deep-scanned by the FileSystemService algorithm.
     *  Only one of these events is emitted per exercise, and it is emitted regardless of whether the browser used employs the File System Access API or not. */
    @Output("newRootDirectoryNode") saveRootDirectoryNode: EventEmitter<DirectoryNode>;
    /** These events are emitted when the current step has been completed in order to communicate it to the next step as well as to the parent.
     *  Only one of these events is emitted per exercise, as it is not possible to go backwards in the step flow. */
    @Output("stepFinished") stepFinished: EventEmitter<void>;

    // Intra-component information
    /** It is used to control the existence or absence of errors in the process of reading the contents of the selected directory. */
    errorStep2: boolean;


    constructor(private fileSystemService: FileSystemService) {
        // Outgoing information to parent component
        this.saveFileSystemDirectoryHandle = new EventEmitter();
        this.saveRootDirectoryNode = new EventEmitter();
        this.stepFinished = new EventEmitter();

        // Intra-component information
        this.errorStep2 = false;
    }


    // ANGULAR LIFECYCLE HOOKS
    /** Exercise user info's instance can only be changed because exercise has been changed, so a new backend instance has been retrieved in parent component.
     *  Current instance of this component has to be "reloaded", re-initializing its own properties. */
    ngOnChanges(changes: SimpleChanges): void {
        if ("exerciseUserInfo" in changes && changes["exerciseUserInfo"].currentValue) {
            if (changes["exerciseUserInfo"].previousValue?.id !== changes["exerciseUserInfo"].currentValue.id) {
                // Intra-component information is re-instantiated for new incoming exercise
                this.errorStep2 = false;
            }
        }
    }


    // USER INTERFACE INTERACTION HANDLERS
    /** When the "Choose directory" button is clicked, a dialog box that allows they to choose the root directory of the exercise is prompted.
     *  User should have selected the directory obtained after unzipping the file downloaded in previous step. */
    async chooseDirectory() {
        let directoryStructure: DirectoryNode | undefined;

        // Directory is selected and deep-scanned differently depending on the availability of the File System Access API.
        if (this.fileSystemService.fileSystemAccessAPISupported()) {
            // Only if File System Access API is available, directory handle can be obtained
            const fileSystemDirectoryHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();

            // It is emitted to parent component (since step 3 takes advantage of it when existing)
            this.saveFileSystemDirectoryHandle.emit(fileSystemDirectoryHandle);

            // Directory is deep-scanned using its corresponding algorithm
            directoryStructure = await this.fileSystemService.supportedFileSystemAPI(fileSystemDirectoryHandle);
        } else {
            // List of all files included in directory can be obtained if File System Access API does not exist
            const recursiveFileList: File[] = (await directoryOpen({ recursive: true })) as File[];

            // Directory is deep-scanned using its corresponding algorithm
            directoryStructure = this.fileSystemService.notSupportedFileSystemAPI(recursiveFileList);
        }

        // If directory could not be scanned, an error message is shown to user prompting to reload the page and start process again.
        if (directoryStructure === undefined) {
            this.errorStep2 = true;
        }
        // If scanned successfully, directory's structure is sent to parent component and step is finished.
        else {
            this.saveRootDirectoryNode.emit(directoryStructure);
            this.stepFinished.emit();
        }
    }
}
