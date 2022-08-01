import * as path from "path";
import * as vscode from "vscode";
import { Course } from "../../../model/serverModel/course/Course";
import { Exercise } from "../../../model/serverModel/exercise/Exercise";
import { V4TItemType } from "./V4TItemType";

/**
 * Extended vscode.TreeItem with context value and iconPath overrides
 */
export class V4TItem extends vscode.TreeItem {

    private resourcesPath = __dirname.includes(path.sep + "out") ?
        path.join(__dirname, "..", "resources") :
        path.join(__dirname, "..", "..", "..", "..", "resources");

    public tooltip = this.getTooltip();
    public iconPath = this.getIconPath();
    public contextValue = this.type.toString();

    constructor(
        readonly label: string,
        readonly type: V4TItemType,
        readonly collapsibleState: vscode.TreeItemCollapsibleState,
        readonly parent?: V4TItem,
        readonly item?: Course | Exercise,
        readonly command?: vscode.Command,
        readonly exerciseStatusOrHasSolution?: number
    ) {
        super(label, collapsibleState);
    }

    private getTooltip() {
        if (this.exerciseStatusOrHasSolution !== undefined && this.type === V4TItemType.ExerciseStudent) {
            switch (this.exerciseStatusOrHasSolution){
                case 0:
                    return this.label + " (not started)";
                case 1:
                    return this.label + " (finished)";
                case 2:
                    return this.label + " (in progress)";
            }
        }
        return this.label;
    }

    private getIconPath() {
        switch (this.type) {
            case V4TItemType.Login: {
                return this.getLightDarkPaths("login.png");
            }
            case V4TItemType.ExerciseStudent: {
                if (this.exerciseStatusOrHasSolution !== undefined){
                    switch (this.exerciseStatusOrHasSolution){
                        case 0:
                            return path.join(this.resourcesPath, "exercises_status_treeicons", "exercise_not_started.png");
                        case 1:
                            return path.join(this.resourcesPath, "exercises_status_treeicons", "exercise_finished.png");
                        case 2:
                            return path.join(this.resourcesPath, "exercises_status_treeicons", "exercise_in_progress.png");
                    }
                }
                return this.getLightDarkPaths("noicon.png");
            }
            case V4TItemType.AddCourse: {
                return this.getLightDarkPaths("add.png");
            }
            case V4TItemType.GetWithCode: {
                return this.getLightDarkPaths("link.png");
            }
            case V4TItemType.Signup: // fall through case below
            case V4TItemType.SignupTeacher: {
                return this.getLightDarkPaths("add_user.png");
            }
            case V4TItemType.Logout: {
                return this.getLightDarkPaths("logout.png");
            }
            case V4TItemType.NoCourses: // fall through case below
            case V4TItemType.NoExercises: {
                return this.getLightDarkPaths("noicon.png");
            }
        }
    }

    private getLightDarkPaths(iconPath: string) {
        return {
            light: path.join(this.resourcesPath, "light", iconPath),
            dark: path.join(this.resourcesPath, "dark", iconPath),
        };
    }
}
