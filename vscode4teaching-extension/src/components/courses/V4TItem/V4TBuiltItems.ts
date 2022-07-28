import { TreeItemCollapsibleState } from "vscode";
import { V4TItem } from "./V4TItem";
import { V4TItemType } from "./V4TItemType";

export class V4TBuildItems {
    // Below are the buttons (items) that do not change
    public static readonly GET_WITH_CODE_ITEM = new V4TItem("Get with code", V4TItemType.GetWithCode, TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.getwithcode",
        title: "Get course with sharing code",
    });
    public static readonly LOGIN_ITEM = new V4TItem("Login", V4TItemType.Login, TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.login",
        title: "Log in to VS Code 4 Teaching",
    });
    public static readonly SIGNUP_ITEM = new V4TItem("Sign up", V4TItemType.Signup, TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.signup",
        title: "Sign up in VS Code 4 Teaching",
    });
    public static readonly SIGNUP_TEACHER_ITEM = new V4TItem("Invite a teacher", V4TItemType.SignupTeacher, TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.signupteacher",
        title: "Invite a teacher to join VS Code 4 Teaching",
    });
    public static readonly LOGOUT_ITEM = new V4TItem("Logout", V4TItemType.Logout, TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.logout",
        title: "Log out of VS Code 4 Teaching",
    });
    public static readonly ADD_COURSES_ITEM = new V4TItem("Add Course", V4TItemType.AddCourse, TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.addcourse",
        title: "Add Course",
    });
    public static readonly NO_COURSES_ITEM = new V4TItem("No courses available", V4TItemType.NoCourses, TreeItemCollapsibleState.None);
    public static readonly NO_EXERCISES_ITEM = new V4TItem("No exercises available", V4TItemType.NoExercises, TreeItemCollapsibleState.None);

}
