import * as path from "path";
import * as vscode from "vscode";
import { Course } from "../../../model/serverModel/course/Course";
import { Exercise } from "../../../model/serverModel/exercise/Exercise";
import { ExerciseStatus } from "../../../model/serverModel/exercise/ExerciseStatus";
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
        readonly exerciseStatusOrSolution?: ExerciseStatus.StatusEnum | number
    ) {
        super(label, collapsibleState);
    }

    private getTooltip() {
        if (this.exerciseStatusOrSolution !== undefined) {
            // A specific tooltip is generated for exercises when shown to students.
            // This tooltip includes the name of the exercise and its status (not started, in progress or finished).
            if (this.type === V4TItemType.ExerciseStudent) {
                switch (this.exerciseStatusOrSolution) {
                    case 0:
                        return this.label + " (not started)";
                    case 1:
                        return this.label + " (finished)";
                    case 2:
                        return this.label + " (in progress)";
                }
            }
            // A specific tooltip is generated for exercises when shown to teachers also.
            // This tooltip includes the name of the exercise and its solution's status.
            else if (this.type === V4TItemType.ExerciseTeacher) {
                switch (this.exerciseStatusOrSolution) {
                    case 0:
                        return this.label + " (no solution included)";
                    case 1:
                        return this.label + " (solution included but not published)";
                    case 2:
                        return this.label + " (solution included and published)";
                }
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
                // If all the necessary information is provided, the exercises displayed to the students in the sidebar will include a specific icon for each one.
                // This icon will indicate the status of the exercise (not started, in progress or finished) using specific colors and images.
                if (this.exerciseStatusOrSolution !== undefined) {
                    switch (this.exerciseStatusOrSolution) {
                        case ExerciseStatus.StatusEnum.NOT_STARTED:
                            return path.join(this.resourcesPath, "exercises_status_treeicons", "exercise_not_started.png");
                        case ExerciseStatus.StatusEnum.FINISHED:
                            return path.join(this.resourcesPath, "exercises_status_treeicons", "exercise_finished.png");
                        case ExerciseStatus.StatusEnum.IN_PROGRESS:
                            return path.join(this.resourcesPath, "exercises_status_treeicons", "exercise_in_progress.png");
                    }
                }
                return this.getLightDarkPaths("noicon.png");
            }
            case V4TItemType.ExerciseTeacher: {
                // If all the necessary information is provided, the exercises displayed to the teachers in the sidebar will also include a specific icon for each one.
                // This icon will indicate the status of the solution of the exercise (not included, not public or published) using specific colors and images.
                if (this.exerciseStatusOrSolution !== undefined) {
                    switch (this.exerciseStatusOrSolution) {
                        case 0:
                            return path.join(this.resourcesPath, "exercises_solutions_treeicons", "no_solution.png");
                        case 1:
                            return path.join(this.resourcesPath, "exercises_solutions_treeicons", "solution_not_public.png");
                        case 2:
                            return path.join(this.resourcesPath, "exercises_solutions_treeicons", "solution_public.png");
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
            case V4TItemType.Signup:
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
