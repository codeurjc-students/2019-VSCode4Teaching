import { Exercise } from "../../../model/serverModel/exercise/Exercise";
import { V4TStatusBarItem } from "../V4TStatusBarItem";

export class DownloadTeacherSolutionItem extends V4TStatusBarItem {
    constructor(private exercise: Exercise) {
        super("Download teacher's solution", "cloud-download", "vscode4teaching.downloadteachersolution");
    }

    public getExerciseInfo(): Exercise {
        return this.exercise;
    }
}
