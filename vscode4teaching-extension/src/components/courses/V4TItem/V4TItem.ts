import * as path from "path";
import * as vscode from "vscode";
import { Course } from "../../../model/serverModel/course/Course";
import { Exercise } from "../../../model/serverModel/exercise/Exercise";
import { V4TItemType } from "./V4TItemType";

/**
 * Extended vscode.TreeItem with context value and iconPath overrides
 */
export class V4TItem extends vscode.TreeItem {

    private resourcesPath = __dirname.includes(path.sep + "out" + path.sep) ?
        path.join(__dirname, "..", "..", "..", "..", "..", "resources") :
        path.join(__dirname, "..", "..", "..", "..", "resources");
    constructor(
        readonly label: string,
        readonly type: V4TItemType,
        readonly collapsibleState: vscode.TreeItemCollapsibleState,
        readonly parent?: V4TItem,
        readonly item?: Course | Exercise,
        readonly command?: vscode.Command,
    ) {
        super(label, collapsibleState);
    }

    get iconPath() {
        switch (this.type) {
            case V4TItemType.Login: {
                return this.iconPaths("login.svg");
            }
            case V4TItemType.AddCourse: {
                return this.iconPaths("add.svg");
            }
            case V4TItemType.GetWithCode: {
                return this.iconPaths("link.png");
            }
            case V4TItemType.Signup: // fall through case below
            case V4TItemType.SignupTeacher: {
                return this.iconPaths("add_user.svg");
            }
            case V4TItemType.Logout: {
                return this.iconPaths("logout.svg");
            }
            case V4TItemType.NoCourses: // fall through case below
            case V4TItemType.NoExercises: {
                return this.iconPaths("noicon.png");
            }
        }
    }
    private iconPaths(iconPath: string) {
        return {
            light: path.join(this.resourcesPath, "light", iconPath),
            dark: path.join(this.resourcesPath, "dark", iconPath),
        };
    }
    get contextValue() {
        return this.type.toString();
    }
}
