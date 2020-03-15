import * as vscode from 'vscode';
import { RestController } from '../restController';
import * as serverModel from '../model/serverModel';
import * as fs from 'fs';
import { V4TItem, V4TItemType } from './v4titem';
import { AxiosPromise } from 'axios';
import { Validators } from '../model/validators';
import { FileZipService } from '../services/fileZipService';
import { CurrentUser } from '../currentUser';

export class UserPick implements vscode.QuickPickItem {
    constructor(
        readonly label: string,
        readonly user: serverModel.User
    ) { }
}

export class CoursesProvider implements vscode.TreeDataProvider<V4TItem> {
    private static _onDidChangeTreeData: vscode.EventEmitter<V4TItem | undefined> = new vscode.EventEmitter<V4TItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<V4TItem | null | undefined> = CoursesProvider._onDidChangeTreeData.event;
    private restController = RestController.getController();
    private loading = false;
    private GET_WITH_CODE_ITEM = new V4TItem('Get with code', V4TItemType.GetWithCode, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        'command': 'vscode4teaching.getwithcode',
        'title': 'Get course with sharing code'
    });
    // Login Button that will be show when user is not logged in
    private LOGIN_ITEM = new V4TItem('Login', V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        'command': 'vscode4teaching.login',
        'title': 'Log in to VS Code 4 Teaching'
    });
    private SIGNUP_ITEM = new V4TItem('Sign up', V4TItemType.Signup, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        'command': 'vscode4teaching.signup',
        'title': 'Sign up in VS Code 4 Teaching'
    });
    private SIGNUP_TEACHER_ITEM = new V4TItem('Sign up a teacher', V4TItemType.SignupTeacher, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        'command': 'vscode4teaching.signupteacher',
        'title': 'Sign up in VS Code 4 Teaching'
    });
    private LOGOUT_ITEM = new V4TItem('Logout', V4TItemType.Logout, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        'command': 'vscode4teaching.logout',
        'title': 'Log out of VS Code 4 Teaching'
    });
    private NO_COURSES_ITEM = [new V4TItem('No courses available', V4TItemType.NoCourses, vscode.TreeItemCollapsibleState.None)];
    private NO_EXERCISES_ITEM = [new V4TItem('No exercises available', V4TItemType.NoExercises, vscode.TreeItemCollapsibleState.None)];

    getParent (element: V4TItem) {
        return element.parent;
    }

    getTreeItem (element: V4TItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren (element?: V4TItem | undefined): vscode.ProviderResult<V4TItem[]> {
        let treeElements: V4TItem[] = [];
        if (!this.loading) {
            if (element) {
                // Only collapsable items are courses
                return this.getExerciseButtons(element);
            } else {
                // If not logged add login button, else show courses
                if (!this.restController.isLoggedIn()) {
                    try {
                        if (fs.existsSync(this.restController.sessionPath)) {
                            this.restController.initializeSessionCredentials();
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
        if (serverModel.ModelUtils.isStudent(CurrentUser.userinfo)) {
            treeElements.unshift(this.GET_WITH_CODE_ITEM);
        }
        return treeElements;
    }

    static triggerTreeReload (item?: V4TItem) {
        CoursesProvider._onDidChangeTreeData.fire(item);
    }

    private getExerciseButtons (element: V4TItem): V4TItem[] {
        let course = element.item;
        if (course && serverModel.instanceOfCourse(course)) {
            this.getExercises(element, course);
            // If exercises were downloaded previously show them, else get them from server
            if (course.exercises.length > 0) {
                // Map exercises to TreeItems
                let type: V4TItemType;
                let commandName: string;
                if (CurrentUser.userinfo && serverModel.ModelUtils.isTeacher(CurrentUser.userinfo)) {
                    type = V4TItemType.ExerciseTeacher;
                    commandName = 'vscode4teaching.getstudentfiles';
                } else {
                    type = V4TItemType.ExerciseStudent;
                    commandName = 'vscode4teaching.getexercisefiles';
                }
                let exerciseItems = course.exercises.map(exercise => new V4TItem(exercise.name, type, vscode.TreeItemCollapsibleState.None, element, exercise, {
                    'command': commandName,
                    'title': 'Get exercise files',
                    'arguments': [course ? course.name : null, exercise] // course condition is needed to avoid compilation error, shouldn't be false
                }));
                return exerciseItems.length > 0 ? exerciseItems : this.NO_EXERCISES_ITEM;
            }
        }
        return this.NO_EXERCISES_ITEM;
    }

    private getCourseButtons (): V4TItem[] {
        if (!CurrentUser.userinfo) {
            this.loading = true;
            let thenable = CurrentUser.updateUserInfo();
            thenable.then(() => {
                // Calls getChildren again, which will go through the else statement in this method (logged in and user info initialized)
                CoursesProvider.triggerTreeReload();
            }).catch(error => {
                this.restController.handleAxiosError(error);
                CoursesProvider.triggerTreeReload();
            }
            ).finally(() => {
                this.loading = false;
            });
            return [];
        } else {
            return this.getCourseButtonsWithUserinfo(CurrentUser.userinfo);
        }
    }

    private getCourseButtonsWithUserinfo (userinfo: serverModel.User) {
        if (userinfo.courses) {
            let isTeacher = serverModel.ModelUtils.isTeacher(userinfo);
            let type: V4TItemType;
            type = isTeacher ? V4TItemType.CourseTeacher : V4TItemType.CourseStudent;
            // From courses create buttons
            let items = userinfo.courses.map(course => new V4TItem(course.name, type, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
            // Add 'add course' button if user is teacher
            if (isTeacher) {
                items.unshift(new V4TItem('Add Course', V4TItemType.AddCourse, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
                    command: 'vscode4teaching.addcourse',
                    title: 'Add Course'
                }));
            }
            if (serverModel.ModelUtils.isTeacher(userinfo)) {
                items.push(this.SIGNUP_TEACHER_ITEM);
            }
            items.push(this.LOGOUT_ITEM);
            return items;
        }
        return this.NO_COURSES_ITEM;
    }

    private async getInput (prompt: string, validator: ((value: string) => string | undefined | null | Thenable<string | undefined | null>), options?: { value?: string, password?: boolean }) {
        let inputOptions: vscode.InputBoxOptions = { 'prompt': prompt };
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

    async login () {
        // Ask for server url, then username, then password, and try to log in at the end
        let defaultServer = vscode.workspace.getConfiguration('vscode4teaching')['defaultServer'];
        let url: string | undefined = await this.getInput('Server', Validators.validateUrl, { value: defaultServer });
        if (url) {
            let username: string | undefined = await this.getInput('Username', Validators.validateUsername);
            if (username) {
                let password: string | undefined = await this.getInput('Password', Validators.validatePasswordLogin, { password: true });
                if (password) {
                    this.restController.callLogin(username, password, url).then(() => {
                        // Maybe do something?
                    });
                }
            }
        }
    }

    signup (isTeacher?: boolean) {
        let defaultServer = vscode.workspace.getConfiguration('vscode4teaching')['defaultServer'];
        let serverInputOptions: vscode.InputBoxOptions = { 'prompt': 'Server', 'value': defaultServer };
        serverInputOptions.validateInput = Validators.validateUrl;
        let url: string;
        let userCredentials: serverModel.UserSignup = {
            username: "",
            password: "",
            email: "",
            name: "",
            lastName: ""
        };
        this.getInput('Server', Validators.validateUrl, { value: defaultServer }).then(userUrl => {
            if (userUrl) {
                url = userUrl;
                return this.getInput('Username', Validators.validateUsername);
            }
        }).then(username => {
            if (username) {
                userCredentials = Object.assign(userCredentials, { username: username });
                return this.getInput('Password', Validators.validatePasswordSignup, { password: true });
            }
        }).then(password => {
            if (password) {
                userCredentials = Object.assign(userCredentials, { password: password });
                let validator = ((value: string) => {
                    if (value === password) {
                        return null;
                    } else {
                        return "Passwords don't match";
                    }
                });
                return this.getInput('Confirm password', validator, { password: true });
            }
        }).then(confirmPassword => {
            if (confirmPassword) {
                return this.getInput('Email', Validators.validateEmail);
            }
        }).then(email => {
            if (email) {
                userCredentials = Object.assign(userCredentials, { email: email });
                return this.getInput('Name', Validators.validateName);
            }
        }).then(name => {
            if (name) {
                userCredentials = Object.assign(userCredentials, { name: name });
                return this.getInput('Last name', Validators.validateLastName);
            }
        }).then(lastName => {
            if (lastName) {
                userCredentials = Object.assign(userCredentials, { lastName: lastName });
                return this.restController.callSignup(userCredentials, url, isTeacher);
            }
        }).then(() => {
            // Maybe do something?
        });
    }

    logout () {
        this.restController.invalidateSession();
        CoursesProvider._onDidChangeTreeData.fire();
    }

    private getExercises (item: V4TItem, course: serverModel.Course) {
        let exercisesThenable = this.restController.getExercises(course.id);
        exercisesThenable.then(response => {
            if (course) {
                // Check if there are differences
                let equalMembers = 0;
                if (response.data.length === course.exercises.length) {
                    for (let exercise of response.data) {
                        for (let savedExercise of course.exercises) {
                            if (savedExercise.id === exercise.id && savedExercise.name === exercise.name) {
                                equalMembers++;
                                break;
                            }
                        }
                    }
                }
                if (equalMembers < response.data.length) {
                    course.exercises = response.data;
                    CoursesProvider.triggerTreeReload(item);
                }
            }
        }).catch(error => {
            this.restController.handleAxiosError(error);
        });

    }

    async addCourse () {
        try {
            let courseName = await this.getInput('Course name', Validators.validateCourseName);
            if (courseName) {
                await this.restController.addCourse({ name: courseName });
                await CurrentUser.updateUserInfo();
                CoursesProvider.triggerTreeReload();
            }
        } catch (error) {
            // Only axios requests throw error
            this.restController.handleAxiosError(error);
        }

    }

    async editCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let newCourseName = await this.getInput('Course name', Validators.validateCourseName);
                if (newCourseName && CurrentUser.userinfo && CurrentUser.userinfo.courses) {
                    await this.restController.editCourse(item.item.id, { name: newCourseName });
                    await CurrentUser.updateUserInfo();
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                this.restController.handleAxiosError(error);
            }
        }
    }

    async deleteCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let selectedOption = await vscode.window.showWarningMessage('Are you sure you want to delete ' + item.item.name + '?', { modal: true }, 'Accept');
                if ((selectedOption === 'Accept') && CurrentUser.userinfo && CurrentUser.userinfo.courses) {
                    await this.restController.deleteCourse(item.item.id);
                    await CurrentUser.updateUserInfo();
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                this.restController.handleAxiosError(error);
            }
        }
    }

    refreshCourses () {
        if (this.restController.isLoggedIn()) {
            // If not logged refresh shouldn't do anything
            CurrentUser.updateUserInfo().then(() => {
                CoursesProvider.triggerTreeReload();
            }).catch(error => {
                this.restController.handleAxiosError(error);
            });
        }
    }

    refreshExercises (item: V4TItem) {
        if (item.item && serverModel.instanceOfCourse(item.item)) {
            this.getExercises(item, item.item);
        }
    }

    async addExercise (item: V4TItem) {
        if (item.item && serverModel.instanceOfCourse(item.item)) {
            let name = await this.getInput('Exercise name', Validators.validateExerciseName);
            if (name) {
                let fileUris = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: true,
                    canSelectMany: true
                });
                if (fileUris) {
                    let zipContent = await FileZipService.getZipFromUris(fileUris);
                    let course: serverModel.Course = item.item;
                    try {
                        let addExerciseData = await this.restController.addExercise(course.id, { name: name });
                        try {
                            await this.restController.uploadExerciseTemplate(addExerciseData.data.id, zipContent);
                            this.refreshExercises(item);
                        } catch (uploadError) {
                            try {
                                await this.restController.deleteExercise(addExerciseData.data.id);
                                this.restController.handleAxiosError(uploadError);
                            } catch (deleteError) {
                                this.restController.handleAxiosError(deleteError);
                            }
                        }
                    } catch (error) {
                        this.restController.handleAxiosError(error);
                    }
                }
            }
        }
    }

    async editExercise (item: V4TItem) {
        if (item.item && "id" in item.item) {
            let name = await this.getInput('Exercise name', Validators.validateExerciseName);
            if (name) {
                try {
                    await this.restController.editExercise(item.item.id, { name: name });
                    CoursesProvider.triggerTreeReload(item.parent);
                } catch (error) {
                    this.restController.handleAxiosError(error);
                }
            }
        }
    }

    async deleteExercise (item: V4TItem) {
        if (item.item && "id" in item.item) {
            try {
                let selectedOption = await vscode.window.showWarningMessage('Are you sure you want to delete ' + item.item.name + '?', { modal: true }, 'Accept');
                if (selectedOption === 'Accept') {
                    await this.restController.deleteExercise(item.item.id);
                    CoursesProvider.triggerTreeReload(item.parent);
                }
            } catch (error) {
                // Only axios requests throw error
                this.restController.handleAxiosError(error);
            }
        }
    }

    async addUsersToCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let getUsersThenable = this.restController.getAllUsers();
                let usersResponse = await getUsersThenable;
                let users: serverModel.User[] = usersResponse.data;
                let courseUsersThenable = this.restController.getUsersInCourse(item.item.id);
                let courseUsersResponse = await courseUsersThenable;
                let courseUsers = courseUsersResponse.data;
                let showArray = users.filter(user => courseUsers.filter((courseUser: serverModel.User) => courseUser.id === user.id).length === 0)
                    .map(user => {
                        return this.dontBelongToCourse(user);
                    });
                await this.manageUsersFromCourse(showArray, item, this.restController.addUsersToCourse, "Adding users to course...");
            } catch (error) {
                this.restController.handleAxiosError(error);
            }
        }
    }

    private dontBelongToCourse (user: serverModel.User) {
        let displayName = user.name && user.lastName ? user.name + " " + user.lastName : user.username;
        if (serverModel.ModelUtils.isTeacher(user)) {
            displayName += " (Teacher)";
        }
        return new UserPick(displayName, user);
    }

    private async manageUsersFromCourse (showArray: UserPick[], item: V4TItem, thenableFunction: ((id: number, data: serverModel.ManageCourseUsers) => AxiosPromise), thenableMessage: string) {
        if (item.item && "exercises" in item.item) {
            //Show users that don't belong to the course already
            if (showArray.length > 0) {
                let picks: UserPick[] | undefined = await vscode.window.showQuickPick<UserPick>(showArray, { canPickMany: true });
                if (picks) {
                    let ids: number[] = [];
                    picks.forEach(pick => ids.push(pick.user.id));
                    await thenableFunction(item.item.id, { ids: ids });
                }
            } else {
                vscode.window.showInformationMessage("There are no users available.");
            }
        }
    }

    async removeUsersFromCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let courseUsersThenable = this.restController.getUsersInCourse(item.item.id);
                let courseUsersResponse = await courseUsersThenable;
                let creatorResponse = await this.restController.getCreator(item.item.id);
                let creator: serverModel.User = creatorResponse.data;
                let courseUsers = courseUsersResponse.data;
                let showArray = courseUsers.filter((user: serverModel.User) => user.id !== creator.id).map((user: serverModel.User) => {
                    return this.dontBelongToCourse(user);
                });
                await this.manageUsersFromCourse(showArray, item, this.restController.removeUsersFromCourse, "Removing users from course...");
            } catch (error) {
                this.restController.handleAxiosError(error);
            }
        }
    }

    async getCourseWithCode () {
        if (!this.restController.isBaseUrlInitialized()) {
            // Ask for server url
            let defaultServer = vscode.workspace.getConfiguration('vscode4teaching')['defaultServer'];
            let url: string | undefined = await this.getInput('Server', Validators.validateUrl, { value: defaultServer });
            if (url) {
                this.restController.setBaseUrl(url);
                this.getCourseWithCodeAndUrl();
            }
        } else {
            this.getCourseWithCodeAndUrl();
        }

    }

    private getCourseWithCodeAndUrl () {
        this.getInput('Introduce sharing code', Validators.validateSharingCode).then(code => {
            if (code) {
                this.restController.getCourseWithCode(code).then(response => {
                    let course: serverModel.Course = response.data;
                    let userinfo = CurrentUser.userinfo;
                    if (!userinfo) {
                        userinfo = CurrentUser.newUserInfo();
                    }
                    if (userinfo && !userinfo.courses) {
                        userinfo.courses = [course];
                    } else if (userinfo && userinfo.courses) {
                        let found = false;
                        for (let courseInCourses of userinfo.courses) {
                            if (course.id === courseInCourses.id) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            userinfo.courses.push(course);
                        }
                    }
                    CoursesProvider._onDidChangeTreeData.fire();
                }).catch(error => this.restController.handleAxiosError(error));
            }
        });
    }
}