import { Injectable } from '@angular/core';
import { ExerciseUserInfo } from "../../../model/exercise-user-info.model";

@Injectable({
    providedIn: 'root'
})
export class FileSystemWriteDirectoryService {

    constructor() {
    }

    getDirectoryNameByExerciseUserInfo(eui: ExerciseUserInfo) {
        return `${eui.exercise.name.toLowerCase().replace(" ", "_")}_${eui.exercise.id}#${eui.id}`;
    }

}
