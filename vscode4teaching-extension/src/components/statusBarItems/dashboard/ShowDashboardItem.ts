import { V4TStatusBarItem } from "../V4TStatusBarItem";

export class ShowDashboardItem extends V4TStatusBarItem {
    constructor(private _dashboardName: string, private _exerciseId: number) {
        super("Dashboard", "dashboard", "vscode4teaching.showdashboard");
    }

    get dashboardName() {
        return this._dashboardName;
    }

    get exerciseId() {
        return this._exerciseId;
    }

}
