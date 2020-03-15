import * as vscode from 'vscode';
import { Course, Exercise } from '../model/serverModel';
import * as path from 'path';

export class V4TItem extends vscode.TreeItem {

    constructor(
        readonly label: string,
        readonly type: V4TItemType,
        readonly collapsibleState: vscode.TreeItemCollapsibleState,
        readonly parent?: V4TItem,
        readonly item?: Course | Exercise,
        readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    get iconPath () {
        let resourcesPath = path.join(__filename, '..', '..', '..', 'resources');
        switch (this.type) {
            case V4TItemType.Login: {
                return {
                    light: path.join(resourcesPath, 'light', 'login.svg'),
                    dark: path.join(resourcesPath, 'dark', 'login.svg')
                };
            }
            case V4TItemType.AddCourse: {
                return {
                    light: path.join(resourcesPath, 'light', 'add.svg'),
                    dark: path.join(resourcesPath, 'dark', 'add.svg')
                };
            }
            case V4TItemType.GetWithCode: {
                return {
                    light: path.join(resourcesPath, 'light', 'link.png'),
                    dark: path.join(resourcesPath, 'dark', 'link.png')
                };
            }
            case V4TItemType.Signup: // fall through case below
            case V4TItemType.SignupTeacher: {
                return {
                    light: path.join(resourcesPath, 'light', 'add_user.svg'),
                    dark: path.join(resourcesPath, 'dark', 'add_user.svg')
                };
            }
            case V4TItemType.Logout: {
                return {
                    light: path.join(resourcesPath, 'light', 'logout.svg'),
                    dark: path.join(resourcesPath, 'dark', 'logout.svg')
                };
            }
        }
    }

    get contextValue () {
        return this.type.toString();
    }
}

export enum V4TItemType {
    Login = "login",
    Logout = "logout",
    GetWithCode = "getwithcode",
    CourseTeacher = "courseteacher",
    CourseStudent = "coursestudent",
    ExerciseTeacher = "exerciseteacher",
    ExerciseStudent = "exercisestudent",
    AddCourse = "addcourse",
    NoCourses = "nocourses",
    NoExercises = "noexercises",
    Signup = "signup",
    SignupTeacher = "signupteacher"
}