import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ExerciseService } from "../../../../services/rest-api/model-entities/exercise/exercise.service";
import { Exercise } from "../../../../model/exercise.model";
import { DirectoryNode } from "../../../../model/file-system/file-system.model";
import { ExerciseUserInfo, ExerciseUserInfoStatus } from "../../../../model/exercise-user-info.model";
import { ExerciseUserInfoService } from "../../../../services/rest-api/model-entities/exercise-user-info/exercise-user-info.service";

/**
 * This component allows students to perform exercises and save them on the server. It is organized in three distinct steps (both in user interface and code organization):
 * - Step 1: downloading the current progress of the exercise. It is marked as started if it has not been started before.
 * - Step 2: selection of the local directory where the exercise downloaded in the previous step has been located in order to synchronize it with the server.
 * - Step 3: synchronization of the status of each file contained in the specified directory with the server, which can be in real time and automatic if a browser with active File System Access API is used or must be launched manually otherwise.
 *
 * This is the parent component of three components: {@link ExerciseStep1Component}, {@link ExerciseStep2Component} and {@link ExerciseStep3Component}.
 * These three components are instantiated in the template of this component, and they use it as a central point for the exchange of information between the different steps.
 */
@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExerciseComponent implements OnInit {
    // Full lifecycle variables
    /** Exercise ID. It is fulfilled from parameter in URL. */
    exerciseId: number;

    /** Currently active step (1, 2 or 3) of synchronization progress. */
    activeStep: number;

    // Backend-coming variables
    /** Exercise information coming from backend server on every exerciseID value change. */
    exercise: Exercise | undefined;
    /** Exercise User Info (EUI) coming from backend server on every exerciseID value change. */
    exerciseUserInfo: ExerciseUserInfo | undefined;

    // Children-coming variables
    /** {@link DirectoryNode} containing information . It is initialized on step 2 and requested and modified by step 3 on every synchronization. */
    rootDirectoryNode: DirectoryNode | undefined;
    /** {@link FileSystemDirectoryHandle} pointing to synchronized directory on current process. It is set up on step 2 and required by step 3. */
    fileSystemDirectoryHandle: FileSystemDirectoryHandle | undefined;


    constructor(private route: ActivatedRoute,
                private router: Router,
                private exerciseService: ExerciseService,
                private exerciseUserInfoService: ExerciseUserInfoService) {
        this.exerciseId = 0;
        this.activeStep = 0;
    }


    // ANGULAR LIFECYCLE HOOKS
    ngOnInit() {
        // When URL changes its parameter (exercise ID), the component and its children must be warned:
        // activeStep returns to 1 and every child component returns to its initial state
        this.route.paramMap.subscribe(async (paramMap) => {
            this.exerciseId = parseInt(paramMap.get("exerciseId") ?? "0");
            this.activeStep = 1;

            // Backend provides information about new exercise and EUI
            this.exercise = await this.exerciseService.getExerciseById(this.exerciseId);
            this.exerciseUserInfo = await this.exerciseUserInfoService.getExerciseUserInfoByExercise(this.exercise);
        });
    }


    // EVENT HANDLERS
    /** Handler for stepFinished event for components of steps 1 and 2. */
    nextStep() {
        this.activeStep = this.activeStep + 1;
    }

    /** Handler for newFileSystemDirectoryHandle event for step 2 component (value used in step 3). */
    saveFileSystemDirectoryHandle(fileSystemDirectoryHandle: FileSystemDirectoryHandle) {
        this.fileSystemDirectoryHandle = fileSystemDirectoryHandle;
    }

    /** Handler for newRootDirectoryNode event for step 2 component (value used in step 3). */
    saveRootDirectoryNode(newRootDirectoryNode: DirectoryNode) {
        this.rootDirectoryNode = newRootDirectoryNode;
    }

    /** Handler for exerciseStatusChanged event for components of steps 1 and 3 (changes to "IN_PROGRESS" and "FINISHED", respectively).
     *  This callback changes exerciseUserInfo value, so onChanges() of each child component is triggered. */
    async exerciseStatusChanged(status: ExerciseUserInfoStatus) {
        if (this.exercise && this.exerciseUserInfo) {
            // Information is changed on local instance
            this.exerciseUserInfo.status = status;

            // Changed information is sent to backend, so it can be saved
            this.exerciseUserInfo = await this.exerciseUserInfoService.editExerciseUserInfoByExercise(this.exercise, this.exerciseUserInfo);

            // If changed to "FINISHED", this component should not be accessible to students
            if (this.exerciseUserInfo.status === "FINISHED")
                this.router.navigate(["dashboard"]);
        }
    }
}
