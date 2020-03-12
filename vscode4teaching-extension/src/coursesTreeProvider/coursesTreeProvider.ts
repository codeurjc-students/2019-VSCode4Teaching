import * as vscode from 'vscode';
import { RestClient } from '../restClient';
import * as path from 'path';
import { User, Course, Exercise, ModelUtils, ManageCourseUsers, instanceOfCourse, UserSignup } from '../model/serverModel';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import { V4TItem, V4TItemType } from './v4titem';
import mkdirp = require('mkdirp');
import { V4TExerciseFile } from '../model/v4texerciseFile';
import { FileIgnoreUtil } from '../fileIgnoreUtil';
import { AxiosPromise } from 'axios';
import { Validators } from '../model/validators';

export class UserPick implements vscode.QuickPickItem {
    constructor(
        public readonly label: string,
        public readonly user: User
    ) { }
}

export class CoursesProvider implements vscode.TreeDataProvider<V4TItem> {
    private static _onDidChangeTreeData: vscode.EventEmitter<V4TItem | undefined> = new vscode.EventEmitter<V4TItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<V4TItem | null | undefined> = CoursesProvider._onDidChangeTreeData.event;
    private client = RestClient.getClient();
    private loading = false;
    readonly downloadDir = vscode.workspace.getConfiguration('vscode4teaching')['defaultExerciseDownloadDirectory'];
    readonly internalFilesDir = path.resolve(__dirname, 'v4t');
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
                if (!this.client.isLoggedIn()) {
                    try {
                        if (fs.existsSync(this.client.sessionPath)) {
                            this.client.initializeSessionCredentials();
                            treeElements = this.getCourseButtons();
                        }
                    } catch (error) {
                        return [this.LOGIN_ITEM, this.SIGNUP_ITEM];
                    }
                } else {
                    treeElements = this.getCourseButtons();
                }
            }
        }
        if (ModelUtils.isStudent(this.client.userinfo)) {
            treeElements.unshift(this.GET_WITH_CODE_ITEM);
        }
        return treeElements;
    }

    static triggerTreeReload (item?: V4TItem) {
        CoursesProvider._onDidChangeTreeData.fire(item);
    }

    private getExerciseButtons (element: V4TItem): V4TItem[] {
        let course = element.item;
        if (course && instanceOfCourse(course)) {
            this.getExercises(element, course);
            // If exercises were downloaded previously show them, else get them from server
            if (course.exercises.length > 0) {
                // Map exercises to TreeItems
                let type: V4TItemType;
                let commandName: string;
                if (this.client.userinfo && ModelUtils.isTeacher(this.client.userinfo)) {
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
        if (!this.client.userinfo) {
            this.loading = true;
            let thenable = this.client.getUserInfo();
            vscode.window.setStatusBarMessage('Getting data...', thenable);
            thenable.then(() => {
                // Calls getChildren again, which will go through the else statement in this method (logged in and user info initialized)
                CoursesProvider.triggerTreeReload();
            }).catch(error => {
                this.client.handleAxiosError(error);
                CoursesProvider.triggerTreeReload();
            }
            ).finally(() => {
                this.loading = false;
            });
            return [];
        } else {
            return this.getCourseButtonsWithUserinfo(this.client.userinfo);
        }
    }

    private getCourseButtonsWithUserinfo (userinfo: User) {
        if (userinfo.courses) {
            let isTeacher = ModelUtils.isTeacher(userinfo);
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
                    this.client.callLogin(username, password, url).then(() => {
                        // Maybe do something?
                    });
                }
            }
        }
    }

    signup () {
        let defaultServer = vscode.workspace.getConfiguration('vscode4teaching')['defaultServer'];
        let serverInputOptions: vscode.InputBoxOptions = { 'prompt': 'Server', 'value': defaultServer };
        serverInputOptions.validateInput = Validators.validateUrl;
        let url: string;
        let userCredentials: UserSignup = {
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
                return this.client.callSignup(userCredentials, url);
            }
        }).then(() => {
            // Maybe do something?
        });
    }

    logout () {
        this.client.invalidateSession();
        CoursesProvider._onDidChangeTreeData.fire();
    }

    private getExercises (item: V4TItem, course: Course) {
        let exercisesThenable = this.client.getExercises(course.id);
        vscode.window.setStatusBarMessage('Getting exercises...', exercisesThenable);
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
            this.client.handleAxiosError(error);
        });

    }

    private async getFiles (dir: string, zipDir: string, zipName: string, requestThenable: AxiosPromise<ArrayBuffer>, templateDir?: string) {
        if (!fs.existsSync(dir)) {
            mkdirp.sync(dir);
        }
        vscode.window.setStatusBarMessage('Downloading exercise files...', requestThenable);
        try {
            let response = await requestThenable;
            let zip = await JSZip.loadAsync(response.data);
            // Save ZIP for FSW operations
            if (!fs.existsSync(zipDir)) {
                mkdirp.sync(zipDir);
            }
            let zipUri = path.resolve(zipDir, zipName);
            zip.generateAsync({ type: "nodebuffer" }).then(ab => {
                fs.writeFileSync(zipUri, ab);
            });
            zip.forEach((relativePath, file) => {
                let v4tpath = path.resolve(dir, relativePath);
                if (this.client.userinfo && !fs.existsSync(path.dirname(v4tpath))) {
                    mkdirp.sync(path.dirname(v4tpath));
                }
                if (file.dir && !fs.existsSync(v4tpath)) {
                    mkdirp.sync(v4tpath);
                } else {
                    file.async('nodebuffer').then(fileData => {
                        fs.writeFileSync(v4tpath, fileData);
                    }).catch(error => {
                        console.error(error);
                    });
                }
            });
            // The purpose of this file is to indicate this is an exercise directory to V4T to enable file uploads, etc
            let isTeacher = this.client.userinfo ? ModelUtils.isTeacher(this.client.userinfo) : false;
            let fileContent: V4TExerciseFile = {
                zipLocation: zipUri,
                teacher: isTeacher,
                template: templateDir ? templateDir : undefined
            };
            fs.writeFileSync(path.resolve(dir, "v4texercise.v4t"), JSON.stringify(fileContent), { encoding: "utf8" });
            return dir;
        } catch (error) {
            this.client.handleAxiosError(error);
        }
    }

    async getExerciseFiles (courseName: string, exercise: Exercise) {
        if (this.client.userinfo) {
            let dir = path.resolve(this.downloadDir, this.client.userinfo.username, courseName, exercise.name);
            let zipDir = path.resolve(__dirname, "v4t", this.client.userinfo.username);
            let zipName = exercise.id + ".zip";
            return this.getFiles(dir, zipDir, zipName, this.client.getExerciseFiles(exercise.id));
        }
    }

    async getStudentFiles (courseName: string, exercise: Exercise) {
        if (this.client.userinfo) {
            let dir = path.resolve(this.downloadDir, "teacher", this.client.userinfo.username, courseName, exercise.name);
            let zipDir = path.resolve(__dirname, "v4t", "teacher", this.client.userinfo.username);
            let studentZipName = exercise.id + ".zip";
            let templateDir = path.resolve(this.downloadDir, "teacher", this.client.userinfo.username, courseName, exercise.name, "template");
            let templateZipName = exercise.id + "-template.zip";
            return Promise.all([
                this.getFiles(templateDir, zipDir, templateZipName, this.client.getTemplate(exercise.id)),
                this.getFiles(dir, zipDir, studentZipName, this.client.getAllStudentFiles(exercise.id), templateDir)
            ]);
        }
    }

    async addCourse () {
        try {
            let courseName = await this.getInput('Course name', Validators.validateCourseName);
            if (courseName) {
                let addCourseThenable = this.client.addCourse({ name: courseName });
                vscode.window.setStatusBarMessage('Sending course info...', addCourseThenable);
                await addCourseThenable;
                let userInfoThenable = this.client.getUserInfo();
                vscode.window.setStatusBarMessage('Getting course info...', userInfoThenable);
                await userInfoThenable;
                CoursesProvider.triggerTreeReload();
            }
        } catch (error) {
            // Only axios requests throw error
            this.client.handleAxiosError(error);
        }

    }

    async editCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let newCourseName = await this.getInput('Course name', Validators.validateCourseName);
                if (newCourseName && this.client.userinfo && this.client.userinfo.courses) {
                    let editCourseThenable = this.client.editCourse(item.item.id, { name: newCourseName });
                    vscode.window.setStatusBarMessage('Sending course info...', editCourseThenable);
                    await editCourseThenable;
                    let userInfoThenable = this.client.getUserInfo();
                    vscode.window.setStatusBarMessage('Getting course info...', userInfoThenable);
                    await userInfoThenable;
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                this.client.handleAxiosError(error);
            }
        }
    }

    async deleteCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let selectedOption = await vscode.window.showWarningMessage('Are you sure you want to delete ' + item.item.name + '?', { modal: true }, 'Accept');
                if ((selectedOption === 'Accept') && this.client.userinfo && this.client.userinfo.courses) {
                    let deleteCourseThenable = this.client.deleteCourse(item.item.id);
                    vscode.window.setStatusBarMessage('Sending course info...', deleteCourseThenable);
                    await deleteCourseThenable;
                    let userInfoThenable = this.client.getUserInfo();
                    vscode.window.setStatusBarMessage('Getting course info...', userInfoThenable);
                    await this.client.getUserInfo();
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                this.client.handleAxiosError(error);
            }
        }
    }

    refreshCourses () {
        if (this.client.isLoggedIn()) {
            // If not logged refresh shouldn't do anything
            this.client.getUserInfo().then(() => {
                CoursesProvider.triggerTreeReload();
            }).catch(error => {
                this.client.handleAxiosError(error);
            });
        }
    }

    refreshExercises (item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            this.getExercises(item, item.item);
        }
    }

    async addExercise (item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            let name = await this.getInput('Exercise name', Validators.validateExerciseName);
            if (name) {
                let fileUris = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: true,
                    canSelectMany: true
                });
                if (fileUris) {
                    let zip = new JSZip();
                    fileUris.forEach(uri => {
                        let uriPath = path.resolve(uri.fsPath);
                        let stat = fs.statSync(uriPath);
                        if (stat && stat.isDirectory()) {
                            this.buildZipFromDirectory(uriPath, zip, path.dirname(uriPath));
                        } else {
                            const filedata = fs.readFileSync(uriPath);
                            zip.file(path.relative(path.dirname(uriPath), uriPath), filedata);
                        }
                    });
                    const zipContent = await zip.generateAsync({
                        type: 'nodebuffer'
                    });
                    let course: Course = item.item;
                    try {
                        let addExerciseThenable = this.client.addExercise(course.id, { name: name });
                        vscode.window.setStatusBarMessage('Adding exercise...', addExerciseThenable);
                        let addExerciseData = await addExerciseThenable;
                        try {
                            let uploadThenable = this.client.uploadExerciseTemplate(addExerciseData.data.id, zipContent);
                            vscode.window.setStatusBarMessage('Uploading template...', uploadThenable);
                            await uploadThenable;
                            this.refreshExercises(item);
                        } catch (uploadError) {
                            try {
                                let deleteExerciseThenable = this.client.deleteExercise(addExerciseData.data.id);
                                vscode.window.setStatusBarMessage('Sending exercise info...', deleteExerciseThenable);
                                await deleteExerciseThenable;
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

    private buildZipFromDirectory (dir: string, zip: JSZip, root: string, ignoredFiles: string[] = []) {
        const list = fs.readdirSync(dir);
        let newIgnoredFiles = FileIgnoreUtil.readGitIgnores(dir);
        newIgnoredFiles.forEach((file: string) => {
            if (!ignoredFiles.includes(file)) {
                ignoredFiles.push(file);
            }
        });
        for (let file of list) {
            file = path.resolve(dir, file);
            if (!ignoredFiles.includes(file)) {
                let stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    this.buildZipFromDirectory(file, zip, root, ignoredFiles);
                } else {
                    const filedata = fs.readFileSync(file);
                    zip.file(path.relative(root, file), filedata);
                }
            }

        }
    }

    async editExercise (item: V4TItem) {
        if (item.item && "id" in item.item) {
            let name = await this.getInput('Exercise name', Validators.validateExerciseName);
            if (name) {
                let thenable = this.client.editExercise(item.item.id, { name: name });
                vscode.window.setStatusBarMessage("Sending exercise info...", thenable);
                await thenable;
                try {
                    CoursesProvider.triggerTreeReload(item.parent);
                } catch (error) {
                    this.client.handleAxiosError(error);
                }
            }
        }
    }

    async deleteExercise (item: V4TItem) {
        if (item.item && "id" in item.item) {
            try {
                let selectedOption = await vscode.window.showWarningMessage('Are you sure you want to delete ' + item.item.name + '?', { modal: true }, 'Accept');
                if (selectedOption === 'Accept') {
                    let deleteExerciseThenable = this.client.deleteExercise(item.item.id);
                    vscode.window.setStatusBarMessage('Sending exercise info...', deleteExerciseThenable);
                    await deleteExerciseThenable;
                    CoursesProvider.triggerTreeReload(item.parent);
                }
            } catch (error) {
                // Only axios requests throw error
                this.client.handleAxiosError(error);
            }
        }
    }

    async addUsersToCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let getUsersThenable = this.client.getAllUsers();
                vscode.window.setStatusBarMessage("Getting user info...", getUsersThenable);
                let usersResponse = await getUsersThenable;
                let users: User[] = usersResponse.data;
                let courseUsersThenable = this.client.getUsersInCourse(item.item.id);
                vscode.window.setStatusBarMessage("Getting user info...", courseUsersThenable);
                let courseUsersResponse = await courseUsersThenable;
                let courseUsers = courseUsersResponse.data;
                let showArray = users.filter(user => courseUsers.filter((courseUser: User) => courseUser.id === user.id).length === 0)
                    .map(user => {
                        return this.dontBelongToCourse(user);
                    });
                await this.manageUsersFromCourse(showArray, item, this.client.addUsersToCourse, "Adding users to course...");
            } catch (error) {
                this.client.handleAxiosError(error);
            }
        }
    }

    private dontBelongToCourse (user: User) {
        let displayName = user.name && user.lastName ? user.name + " " + user.lastName : user.username;
        if (ModelUtils.isTeacher(user)) {
            displayName += " (Teacher)";
        }
        return new UserPick(displayName, user);
    }

    private async manageUsersFromCourse (showArray: UserPick[], item: V4TItem, thenableFunction: ((id: number, data: ManageCourseUsers) => AxiosPromise), thenableMessage: string) {
        if (item.item && "exercises" in item.item) {
            //Show users that don't belong to the course already
            if (showArray.length > 0) {
                let picks: UserPick[] | undefined = await vscode.window.showQuickPick<UserPick>(showArray, { canPickMany: true });
                if (picks) {
                    let ids: number[] = [];
                    picks.forEach(pick => ids.push(pick.user.id));
                    let thenable = thenableFunction(item.item.id, { ids: ids });
                    vscode.window.setStatusBarMessage(thenableMessage, thenable);
                    await thenable;
                }
            } else {
                vscode.window.showInformationMessage("There are no users available.");
            }
        }
    }

    async removeUsersFromCourse (item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let courseUsersThenable = this.client.getUsersInCourse(item.item.id);
                vscode.window.setStatusBarMessage("Getting user info...", courseUsersThenable);
                let courseUsersResponse = await courseUsersThenable;
                let creatorResponse = await this.client.getCreator(item.item.id);
                let creator: User = creatorResponse.data;
                let courseUsers = courseUsersResponse.data;
                let showArray = courseUsers.filter((user: User) => user.id !== creator.id).map((user: User) => {
                    return this.dontBelongToCourse(user);
                });
                await this.manageUsersFromCourse(showArray, item, this.client.removeUsersFromCourse, "Removing users from course...");
            } catch (error) {
                this.client.handleAxiosError(error);
            }
        }
    }

    async getCourseWithCode () {
        if (!this.client.isBaseUrlInitialized()) {
            // Ask for server url
            let defaultServer = vscode.workspace.getConfiguration('vscode4teaching')['defaultServer'];
            let url: string | undefined = await this.getInput('Server', Validators.validateUrl, { value: defaultServer });
            if (url) {
                this.client.setBaseUrl(url);
                this.getCourseWithCodeAndUrl();
            }
        } else {
            this.getCourseWithCodeAndUrl();
        }

    }

    private getCourseWithCodeAndUrl () {
        this.getInput('Introduce sharing code', Validators.validateSharingCode).then(code => {
            if (code) {
                this.client.getCourseWithCode(code).then(response => {
                    let course: Course = response.data;
                    let userinfo = this.client.userinfo;
                    if (!userinfo) {
                        userinfo = this.client.newUserInfo();
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
                }).catch(error => this.client.handleAxiosError(error));
            }
        });
    }
}