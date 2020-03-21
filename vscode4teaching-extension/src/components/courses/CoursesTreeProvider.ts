import { AxiosPromise } from "axios";
import * as fs from "fs";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { CurrentUser } from "../../client/CurrentUser";
import { Course, instanceOfCourse } from "../../model/serverModel/course/Course";
import { ManageCourseUsers } from "../../model/serverModel/course/ManageCourseUsers";
import { Exercise } from "../../model/serverModel/exercise/Exercise";
import { ModelUtils } from "../../model/serverModel/ModelUtils";
import { User } from "../../model/serverModel/user/User";
import { UserSignup } from "../../model/serverModel/user/UserSignup";
import { Validators } from "../../model/Validators";
import { FileZipUtil } from "../../utils/FileZipUtil";
import { UserPick } from "./UserPick";
import { V4TItem, V4TItemType } from "./V4TItem";

export class CoursesProvider implements vscode.TreeDataProvider<V4TItem> {

    public static triggerTreeReload(item?: V4TItem) {
        CoursesProvider.onDidChangeTreeDataEventEmmiter.fire(item);
    }
    private static onDidChangeTreeDataEventEmmiter: vscode.EventEmitter<V4TItem | undefined> = new vscode.EventEmitter<V4TItem | undefined>();
    public readonly onDidChangeTreeData?: vscode.Event<V4TItem | null | undefined> = CoursesProvider.onDidChangeTreeDataEventEmmiter.event;
    private client = APIClient.getClient();
    private loading = false;
    private GET_WITH_CODE_ITEM = new V4TItem("Get with code", V4TItemType.GetWithCode, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.getwithcode",
        title: "Get course with sharing code",
    });
    // Login Button that will be show when user is not logged in
    private LOGIN_ITEM = new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.login",
        title: "Log in to VS Code 4 Teaching",
    });
    private SIGNUP_ITEM = new V4TItem("Sign up", V4TItemType.Signup, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.signup",
        title: "Sign up in VS Code 4 Teaching",
    });
    private SIGNUP_TEACHER_ITEM = new V4TItem("Sign up a teacher", V4TItemType.SignupTeacher, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.signupteacher",
        title: "Sign up in VS Code 4 Teaching",
    });
    private LOGOUT_ITEM = new V4TItem("Logout", V4TItemType.Logout, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        command: "vscode4teaching.logout",
        title: "Log out of VS Code 4 Teaching",
    });
    private NO_COURSES_ITEM = [new V4TItem("No courses available", V4TItemType.NoCourses, vscode.TreeItemCollapsibleState.None)];
    private NO_EXERCISES_ITEM = [new V4TItem("No exercises available", V4TItemType.NoExercises, vscode.TreeItemCollapsibleState.None)];

    public getParent(element: V4TItem) {
        return element.parent;
    }

    public getTreeItem(element: V4TItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public getChildren(element?: V4TItem | undefined): vscode.ProviderResult<V4TItem[]> {
        let treeElements: V4TItem[] = [];
        if (!this.loading) {
            if (element) {
                // Only collapsable items are courses
                return this.getExerciseButtons(element);
            } else {
                // If not logged add login button, else show courses
                if (!CurrentUser.isLoggedIn()) {
                    try {
                        if (fs.existsSync(this.client.sessionPath)) {
                            this.client.initializeSessionCredentials();
                            treeElements = this.getCourseButtons();
                        } else {
                            treeElements = [this.LOGIN_ITEM, this.SIGNUP_ITEM];
                        }
                    } catch (error) {
                        return [this.LOGIN_ITEM, this.SIGNUP_ITEM];
                    }
                } else {
                    treeElements = this.getCourseButtons();
                }
            }
        }
        if (CurrentUser.isLoggedIn() && ModelUtils.isStudent(CurrentUser.getUserInfo())) {
            treeElements.unshift(this.GET_WITH_CODE_ITEM);
        }
        return treeElements;
    }

    public async login() {
        // Ask for server url, then username, then password, and try to log in at the end
        const defaultServer = vscode.workspace.getConfiguration("vscode4teaching").defaultServer;
        const url: string | undefined = await this.getInput("Server", Validators.validateUrl, { value: defaultServer });
        if (url) {
            const username: string | undefined = await this.getInput("Username", Validators.validateUsername);
            if (username) {
                const password: string | undefined = await this.getInput("Password", Validators.validatePasswordLogin, { password: true });
                if (password) {
                    this.client.loginV4T(username, password, url).then(() => {
                        // Maybe do something?
                    });
                }
            }
        }
    }

    public signup(isTeacher?: boolean) {
        const defaultServer = vscode.workspace.getConfiguration("vscode4teaching").defaultServer;
        const serverInputOptions: vscode.InputBoxOptions = { prompt: "Server", value: defaultServer };
        serverInputOptions.validateInput = Validators.validateUrl;
        let url: string;
        let userCredentials: UserSignup = {
            username: "",
            password: "",
            email: "",
            name: "",
            lastName: "",
        };
        this.getInput("Server", Validators.validateUrl, { value: defaultServer }).then((userUrl) => {
            if (userUrl) {
                url = userUrl;
                return this.getInput("Username", Validators.validateUsername);
            }
        }).then((username) => {
            if (username) {
                userCredentials = Object.assign(userCredentials, { username });
                return this.getInput("Password", Validators.validatePasswordSignup, { password: true });
            }
        }).then((password) => {
            if (password) {
                userCredentials = Object.assign(userCredentials, { password });
                const validator = ((value: string) => {
                    if (value === password) {
                        return null;
                    } else {
                        return "Passwords don't match";
                    }
                });
                return this.getInput("Confirm password", validator, { password: true });
            }
        }).then((confirmPassword) => {
            if (confirmPassword) {
                return this.getInput("Email", Validators.validateEmail);
            }
        }).then((email) => {
            if (email) {
                userCredentials = Object.assign(userCredentials, { email });
                return this.getInput("Name", Validators.validateName);
            }
        }).then((name) => {
            if (name) {
                userCredentials = Object.assign(userCredentials, { name });
                return this.getInput("Last name", Validators.validateLastName);
            }
        }).then((lastName) => {
            if (lastName) {
                userCredentials = Object.assign(userCredentials, { lastName });
                return this.client.signUpV4T(userCredentials, url, isTeacher);
            }
        }).then(() => {
            // Maybe do something?
        });
    }

    public logout() {
        this.client.invalidateSession();
    }

    public async addCourse() {
        try {
            const courseName = await this.getInput("Course name", Validators.validateCourseName);
            if (courseName) {
                await this.client.addCourse({ name: courseName });
                await CurrentUser.updateUserInfo();
                CoursesProvider.triggerTreeReload();
            }
        } catch (error) {
            // Only axios requests throw error
            this.client.handleAxiosError(error);
        }

    }

    public async editCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                const newCourseName = await this.getInput("Course name", Validators.validateCourseName);
                if (newCourseName && CurrentUser.isLoggedIn() && CurrentUser.getUserInfo().courses) {
                    await this.client.editCourse(item.item.id, { name: newCourseName });
                    await CurrentUser.updateUserInfo();
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                this.client.handleAxiosError(error);
            }
        }
    }

    public async deleteCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                const selectedOption = await vscode.window.showWarningMessage("Are you sure you want to delete " + item.item.name + "?", { modal: true }, "Accept");
                if ((selectedOption === "Accept") && CurrentUser.isLoggedIn() && CurrentUser.getUserInfo().courses) {
                    await this.client.deleteCourse(item.item.id);
                    await CurrentUser.updateUserInfo();
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                this.client.handleAxiosError(error);
            }
        }
    }

    public refreshCourses() {
        if (CurrentUser.isLoggedIn()) {
            // If not logged refresh shouldn't do anything
            CurrentUser.updateUserInfo().then(() => {
                CoursesProvider.triggerTreeReload();
            }).catch((error) => {
                this.client.handleAxiosError(error);
            });
        }
    }

    public refreshExercises(item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            this.getExercises(item, item.item);
        }
    }

    public async addExercise(item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            const name = await this.getInput("Exercise name", Validators.validateExerciseName);
            if (name) {
                const fileUris = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: true,
                    canSelectMany: true,
                });
                if (fileUris) {
                    const zipContent = await FileZipUtil.getZipFromUris(fileUris);
                    const course: Course = item.item;
                    try {
                        const addExerciseData = await this.client.addExercise(course.id, { name });
                        try {
                            await this.client.uploadExerciseTemplate(addExerciseData.data.id, zipContent);
                            this.refreshExercises(item);
                        } catch (uploadError) {
                            try {
                                await this.client.deleteExercise(addExerciseData.data.id);
                                this.client.handleAxiosError(uploadError);
                            } catch (deleteError) {
                                this.client.handleAxiosError(deleteError);
                            }
                        }
                    } catch (error) {
                        this.client.handleAxiosError(error);
                    }
                }
            }
        }
    }

    public async editExercise(item: V4TItem) {
        if (item.item && "id" in item.item) {
            const name = await this.getInput("Exercise name", Validators.validateExerciseName);
            if (name) {
                try {
                    await this.client.editExercise(item.item.id, { name });
                    CoursesProvider.triggerTreeReload(item.parent);
                } catch (error) {
                    this.client.handleAxiosError(error);
                }
            }
        }
    }

    public async deleteExercise(item: V4TItem) {
        if (item.item && "id" in item.item) {
            try {
                const selectedOption = await vscode.window.showWarningMessage("Are you sure you want to delete " + item.item.name + "?", { modal: true }, "Accept");
                if (selectedOption === "Accept") {
                    await this.client.deleteExercise(item.item.id);
                    CoursesProvider.triggerTreeReload(item.parent);
                }
            } catch (error) {
                // Only axios requests throw error
                this.client.handleAxiosError(error);
            }
        }
    }

    public async addUsersToCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                const usersResponse = await this.client.getAllUsers();
                const users: User[] = usersResponse.data;
                const courseUsersResponse = await this.client.getUsersInCourse(item.item.id);
                const courseUsers = courseUsersResponse.data;
                const showArray = users.filter((user) => courseUsers.filter((courseUser: User) => courseUser.id === user.id).length === 0)
                    .map((user) => {
                        return this.dontBelongToCourse(user);
                    });
                await this.manageUsersFromCourse(showArray, item, this.client.addUsersToCourse, "Adding users to course...");
            } catch (error) {
                this.client.handleAxiosError(error);
            }
        }
    }

    public async removeUsersFromCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                const courseUsersResponse = await this.client.getUsersInCourse(item.item.id);
                const creatorResponse = await this.client.getCreator(item.item.id);
                const creator: User = creatorResponse.data;
                const courseUsers = courseUsersResponse.data;
                const showArray = courseUsers.filter((user: User) => user.id !== creator.id).map((user: User) => {
                    return this.dontBelongToCourse(user);
                });
                await this.manageUsersFromCourse(showArray, item, this.client.removeUsersFromCourse, "Removing users from course...");
            } catch (error) {
                this.client.handleAxiosError(error);
            }
        }
    }

    public getCourseWithCode() {
        this.getInput("Introduce sharing code", Validators.validateSharingCode).then((code) => {
            if (code) {
                this.client.getCourseWithCode(code).then((response) => {
                    const course: Course = response.data;
                    const userinfo = CurrentUser.getUserInfo();
                    if (userinfo && !userinfo.courses) {
                        userinfo.courses = [course];
                    } else if (userinfo && userinfo.courses) {
                        let found = false;
                        for (const courseInCourses of userinfo.courses) {
                            if (course.id === courseInCourses.id) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            userinfo.courses.push(course);
                        }
                    }
                    CoursesProvider.triggerTreeReload();
                }).catch((error) => this.client.handleAxiosError(error));
            }
        });
    }

    public async getExerciseFiles(courseName: string, exercise: Exercise) {
        const zipInfo = FileZipUtil.exerciseZipInfo(courseName, exercise);
        return FileZipUtil.filesFromZip(zipInfo, this.client.getExerciseFiles(exercise.id));
    }

    public async getStudentFiles(courseName: string, exercise: Exercise) {
        const studentZipInfo = FileZipUtil.studentZipInfo(courseName, exercise);
        const templateZipInfo = FileZipUtil.templateZipInfo(courseName, exercise);
        return Promise.all([
            FileZipUtil.filesFromZip(templateZipInfo, this.client.getTemplate(exercise.id)),
            FileZipUtil.filesFromZip(studentZipInfo, this.client.getAllStudentFiles(exercise.id), templateZipInfo.dir),
        ]);
    }

    private getExerciseButtons(element: V4TItem): V4TItem[] {
        const course = element.item;
        if (course && instanceOfCourse(course)) {
            this.getExercises(element, course);
            // If exercises were downloaded previously show them, else get them from server
            if (course.exercises.length > 0) {
                // Map exercises to TreeItems
                let type: V4TItemType;
                let commandName: string;
                if (CurrentUser.isLoggedIn() && ModelUtils.isTeacher(CurrentUser.getUserInfo())) {
                    type = V4TItemType.ExerciseTeacher;
                    commandName = "vscode4teaching.getstudentfiles";
                } else {
                    type = V4TItemType.ExerciseStudent;
                    commandName = "vscode4teaching.getexercisefiles";
                }
                const exerciseItems = course.exercises.map((exercise) => new V4TItem(exercise.name, type, vscode.TreeItemCollapsibleState.None, element, exercise, {
                    command: commandName,
                    title: "Get exercise files",
                    arguments: [course ? course.name : null, exercise], // course condition is needed to avoid compilation error, shouldn't be false
                }));
                return exerciseItems.length > 0 ? exerciseItems : this.NO_EXERCISES_ITEM;
            }
        }
        return this.NO_EXERCISES_ITEM;
    }

    private getCourseButtons(): V4TItem[] {
        if (!CurrentUser.isLoggedIn()) {
            this.loading = true;
            CurrentUser.updateUserInfo().then(() => {
                // Calls getChildren again, which will go through the else statement in this method (logged in and user info initialized)
                CoursesProvider.triggerTreeReload();
            }).catch((error) => {
                this.client.handleAxiosError(error);
                CoursesProvider.triggerTreeReload();
            },
            ).finally(() => {
                this.loading = false;
            });
            return [];
        } else {
            return this.getCourseButtonsWithUserinfo(CurrentUser.getUserInfo());
        }
    }

    private getCourseButtonsWithUserinfo(userinfo: User) {
        if (userinfo.courses) {
            const isTeacher = ModelUtils.isTeacher(userinfo);
            let type: V4TItemType;
            type = isTeacher ? V4TItemType.CourseTeacher : V4TItemType.CourseStudent;
            // From courses create buttons
            const items = userinfo.courses.map((course) => new V4TItem(course.name, type, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
            // Add 'add course' button if user is teacher
            if (isTeacher) {
                items.unshift(new V4TItem("Add Course", V4TItemType.AddCourse, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
                    command: "vscode4teaching.addcourse",
                    title: "Add Course",
                }));
            }
            if (ModelUtils.isTeacher(userinfo)) {
                items.push(this.SIGNUP_TEACHER_ITEM);
            }
            items.push(this.LOGOUT_ITEM);
            return items;
        }
        return this.NO_COURSES_ITEM;
    }

    private async getInput(prompt: string, validator: ((value: string) => string | undefined | null | Thenable<string | undefined | null>), options?: { value?: string, password?: boolean }) {
        let inputOptions: vscode.InputBoxOptions = { prompt };
        if (options) {
            if (options.value) {
                inputOptions = Object.assign(inputOptions, { value: options.value });
            }
            if (options.password) {
                inputOptions = Object.assign(inputOptions, { password: options.password });
            }
        }
        inputOptions.validateInput = validator;
        return vscode.window.showInputBox(inputOptions);
    }

    private getExercises(item: V4TItem, course: Course) {
        const exercisesThenable = this.client.getExercises(course.id);
        exercisesThenable.then((response) => {
            if (course) {
                course.exercises = response.data;
                CoursesProvider.triggerTreeReload(item);
            }
        }).catch((error) => {
            this.client.handleAxiosError(error);
        });

    }

    private dontBelongToCourse(user: User) {
        let displayName = user.name && user.lastName ? user.name + " " + user.lastName : user.username;
        if (ModelUtils.isTeacher(user)) {
            displayName += " (Teacher)";
        }
        return new UserPick(displayName, user);
    }

    private async manageUsersFromCourse(showArray: UserPick[], item: V4TItem, thenableFunction: ((id: number, data: ManageCourseUsers) => AxiosPromise), thenableMessage: string) {
        if (item.item && "exercises" in item.item) {
            // Show users that don't belong to the course already
            if (showArray.length > 0) {
                const picks: UserPick[] | undefined = await vscode.window.showQuickPick<UserPick>(showArray, { canPickMany: true });
                if (picks) {
                    const ids: number[] = [];
                    picks.forEach((pick) => ids.push(pick.user.id));
                    await thenableFunction(item.item.id, { ids });
                }
            } else {
                vscode.window.showInformationMessage("There are no users available.");
            }
        }
    }
}
