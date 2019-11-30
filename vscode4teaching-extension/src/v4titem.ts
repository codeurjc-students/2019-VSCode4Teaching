import * as vscode from 'vscode';
import { Course, Exercise } from './model/serverModel';
import * as path from 'path';

export class V4TItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly type: V4TItemType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly parent: V4TItem | undefined,
        public readonly item?: Course | Exercise,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    get iconPath() {
        switch (this.type) {
            case V4TItemType.Login: {
                return {
                    light: path.join(__filename, '..', '..', 'resources', 'light', 'login.svg'),
                    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'login.svg')
                };
            }
            case V4TItemType.AddCourse: {
                return {
                    light: path.join(__filename, '..', '..', 'resources', 'light', 'add.svg'),
                    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'add.svg')
                };
            }
        }
    }

    get contextValue() {
        return this.type.toString();
    }
}

export enum V4TItemType {
    Login = "login",
    CourseTeacher = "courseteacher",
    CourseStudent = "coursestudent",
    ExerciseTeacher = "exerciseteacher",
    ExerciseStudent = "exercisestudent",
    AddCourse = "addcourse"
}