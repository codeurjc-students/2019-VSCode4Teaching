import * as vscode from "vscode";
import { V4TStatusBarItem } from "../V4TStatusBarItem";
export class FinishItem extends V4TStatusBarItem {
    constructor(private exerciseId: number) {
        super("Finish exercise", "checklist", "vscode4teaching.finishexercise");
    }

    public getExerciseId(): number {
        return this.exerciseId;
    }
}
