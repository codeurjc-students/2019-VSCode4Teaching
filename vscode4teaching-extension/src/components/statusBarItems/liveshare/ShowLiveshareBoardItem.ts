import { V4TStatusBarItem } from "../V4TStatusBarItem";
import { Course } from "../../../model/serverModel/course/Course";
export class ShowLiveshareBoardItem extends V4TStatusBarItem {
    constructor(private _dashboardName: string, private _courses: Course[]) {
        super("Liveshare Board", "live-share", "vscode4teaching.showliveshareboard");
    }

    get dashboardName() {
        return this._dashboardName;
    }

    get getCourses() {
        return this._courses;
    }
}
