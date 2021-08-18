import { Course } from "../../../model/serverModel/course/Course";
import { Exercise } from "../../../model/serverModel/exercise/Exercise";
import { V4TStatusBarItem } from "../V4TStatusBarItem";

export class ShowDashboardItem extends V4TStatusBarItem {
    constructor(private _dashboardName: string, private _course: Course | undefined, private _exercise: Exercise | undefined) {
        super("Dashboard", "dashboard", "vscode4teaching.showdashboard");
    }

    get dashboardName() {
        return this._dashboardName;
    }

    set dashboardName(dashboardName: string) {
        this._dashboardName = dashboardName;
    }

    get exercise() {
        return this._exercise;
    }

    set exercise(exercise: Exercise | undefined) {
        this._exercise = exercise;
    }

    get course() {
        return this._course;
    }

    set course(course: Course | undefined) {
        this._course = course;
    }

}
