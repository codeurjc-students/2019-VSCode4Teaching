import * as vscode from 'vscode';
import { RestClient } from './restclient';
import * as path from 'path';
import { User, Course, Exercise } from './model';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import { V4TItem, V4TItemType } from './v4titem';
import mkdirp = require('mkdirp');

export class CoursesProvider implements vscode.TreeDataProvider<V4TItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<V4TItem | undefined> = new vscode.EventEmitter<V4TItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<V4TItem | null | undefined> = this._onDidChangeTreeData.event;
    private _client = new RestClient();
    private _userinfo: User | undefined;
    private error401thrown = false;
    private error403thrown = false;
    private loading = false;
    private downloadDir = vscode.workspace.getConfiguration('vscode4teaching')['defaultExerciseDownloadDirectory'];

    getParent(element: V4TItem) {
        return element.parent;
    }

    getTreeItem(element: V4TItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: V4TItem | undefined): vscode.ProviderResult<V4TItem[]> {
        if (!this.loading) {
            if (element) {
                // Only collapsable items are courses
                let course = element.item;
                if (course && 'exercises' in course) {
                    this.getExercises(element, course);
                    // If exercises were downloaded previously show them, else get them from server
                    if (course.exercises.length > 0) {
                        // Map exercises to TreeItems
                        let type: V4TItemType;
                        if (this.userinfo && this.userinfo.roles.filter(role => role.roleName === 'ROLE_TEACHER').length > 0) {
                            type = V4TItemType.ExerciseTeacher;
                        } else {
                            type = V4TItemType.ExerciseStudent;
                        }
                        return course.exercises.map(exercise => new V4TItem(exercise.name, type, vscode.TreeItemCollapsibleState.None, element, exercise, {
                            'command': 'vscode4teaching.getexercisefiles',
                            'title': 'Get exercise files',
                            'arguments': [course ? course.name : null, exercise] // course condition is needed to avoid compilation error, shouldn't be false
                        }));
                    }
                }
            } else {
                // If not logged add login button, else show courses
                if (!this.client.jwtToken) {
                    try {
                        let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
                        if (fs.existsSync(sessionPath)) {
                            let readSession = fs.readFileSync(sessionPath).toString();
                            let sessionParts = readSession.split('\n');
                            this.client.jwtToken = sessionParts[0];
                            this.client.xsrfToken = sessionParts[1];
                            this.client.baseUrl = sessionParts[2];
                            this.getChildren();
                        }
                    } catch (error) {
                        return [new V4TItem('Login', V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
                            'command': 'vscode4teaching.login',
                            'title': 'Log in to VS Code 4 Teaching'
                        })];
                    }
                    return [new V4TItem('Login', V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
                        'command': 'vscode4teaching.login',
                        'title': 'Log in to VS Code 4 Teaching'
                    })];
                } else {
                    if ((!this.userinfo || !this.userinfo.courses) && !this.error401thrown && !this.error403thrown) {
                        this.loading = true;
                        let thenable = this.getUserInfo();
                        vscode.window.setStatusBarMessage('Getting data...', thenable);
                        thenable.then(() => {
                            this._onDidChangeTreeData.fire();
                        }).finally(() => {
                            this.loading = false;
                        });
                    }
                    if (this.userinfo && this.userinfo.courses) {
                        let isTeacher = this.userinfo.roles.filter(role => role.roleName === 'ROLE_TEACHER').length > 0;
                        let type: V4TItemType;
                        if (isTeacher) {
                            type = V4TItemType.CourseTeacher;
                        } else {
                            type = V4TItemType.CourseStudent;
                        }
                        let items = this.userinfo.courses.map(course => new V4TItem(course.name, type, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
                        if (isTeacher) {
                            items.unshift(new V4TItem('Add Course', V4TItemType.AddCourse, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
                                command: 'vscode4teaching.addcourse',
                                title: 'Add Course'
                            }));
                        }
                        return items;
                    }
                    return [new V4TItem('Login', V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
                        'command': 'vscode4teaching.login',
                        'title': 'Log in to VS Code 4 Teaching'
                    })];
                }
            }
        }
    }

    async login() {
        // Ask for server url, then username, then password, and try to log in at the end
        let defaultServer = vscode.workspace.getConfiguration('vscode4teaching')['defaultServer'];
        let serverInputOptions: vscode.InputBoxOptions = { 'prompt': 'Server', 'value': defaultServer };
        serverInputOptions.validateInput = this.validateInputCustomUrl;
        let url: string | undefined = await vscode.window.showInputBox(serverInputOptions);
        if (url) {
            this.client.baseUrl = url;
            let username: string | undefined = await vscode.window.showInputBox({ 'prompt': 'Username' });
            if (username) {
                let password: string | undefined = await vscode.window.showInputBox({ 'prompt': 'Password', 'password': true });
                if (password) {
                    this.callLogin(username, password).catch(error => {
                        this.handleAxiosError(error);
                    });
                }
            }
        }
    }

    private async callLogin(username: string, password: string) {
        try {
            let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
            if (fs.existsSync(sessionPath)) {
                fs.unlinkSync(sessionPath);
            }
            this.client.jwtToken = undefined;
            this.client.xsrfToken = '';
            await this.client.getCsrfToken();
            let loginThenable = this.client.login(username, password);
            vscode.window.setStatusBarMessage('Logging in to VS Code 4 Teaching...', loginThenable);
            let response = await loginThenable;
            vscode.window.showInformationMessage('Logged in');
            this.client.jwtToken = response.data['jwtToken'];
            let v4tPath = path.resolve(__dirname, 'v4t');
            if (!fs.existsSync(v4tPath)) {
                mkdirp.sync(v4tPath);
            }
            fs.writeFileSync(sessionPath, this.client.jwtToken + '\n' + this.client.xsrfToken + '\n' + this.client.baseUrl);
            await this.getUserInfo();
            this._onDidChangeTreeData.fire();
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    private async getUserInfo() {
        let coursesThenable = this.client.getUserInfo();
        vscode.window.setStatusBarMessage('Getting user courses...', coursesThenable);
        // Errors have to be controlled in the caller function
        let userResponse = await coursesThenable;
        if (userResponse.data.courses && userResponse.data.courses.length > 0) {
            userResponse.data.courses.forEach(course => {
                if (!course.exercises) {
                    course.exercises = [];
                }
            });
        }
        this.userinfo = userResponse.data;
    }

    validateInputCustomUrl(value: string): string | undefined | null | Thenable<string | undefined | null> {
        // Regular expresion for urls
        let regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
        let pattern = new RegExp(regexp);
        if (pattern.test(value)) {
            return null;
        } else {
            return 'Invalid URL';
        }

    }

    get client(): RestClient {
        return this._client;
    }

    set client(client: RestClient) {
        this._client = client;
    }

    get userinfo(): User | undefined {
        if (this._userinfo) {
            return this._userinfo;
        }
    }

    set userinfo(userinfo: User | undefined) {
        this._userinfo = userinfo;
    }

    private getExercises(item: V4TItem, course: Course) {
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
                    this._onDidChangeTreeData.fire(item);
                }
            }
        }).catch(error => {
            this.handleAxiosError(error);
        });

    }

    async getExerciseFiles(courseName: string, exercise: Exercise) {
        if (this.userinfo && !fs.existsSync(path.resolve(this.downloadDir, this.userinfo.username, courseName, exercise.name))) {
            // fs.mkdirSync(this.downloadDir + path.sep + this.userinfo.username + path.sep + courseName + path.sep + exercise.name, { recursive: true });
            mkdirp.sync(path.resolve(this.downloadDir, this.userinfo.username, courseName, exercise.name));
        }
        let requestThenable = this.client.getExerciseFiles(exercise.id);
        vscode.window.setStatusBarMessage('Downloading exercise files...', requestThenable);
        try {
            if (this.userinfo) {
                let response = await requestThenable;
                let zip = await JSZip.loadAsync(response.data);
                // Save ZIP for FSW operations
                let zipUri = path.resolve(__dirname, "v4t", this.userinfo.username, exercise.id + ".zip");
                zip.generateAsync({ type: "nodebuffer" }).then(ab => {
                    fs.writeFileSync(zipUri, ab);
                });
                zip.forEach((relativePath, file) => {
                    if (this.userinfo) {
                        let v4tpath = path.resolve(this.downloadDir, this.userinfo.username, courseName, exercise.name, relativePath);
                        if (this.userinfo && !fs.existsSync(path.dirname(v4tpath))) {
                            // fs.mkdirSync(path.dirname(v4tpath), { recursive: true });
                            mkdirp.sync(path.dirname(v4tpath));
                        }
                        if (file.dir && !fs.existsSync(v4tpath)) {
                            // fs.mkdirSync(v4tpath, { recursive: true });
                            mkdirp.sync(v4tpath);
                        } else {
                            file.async('nodebuffer').then(fileData => {
                                if (!fs.existsSync(v4tpath)) {
                                    fs.writeFileSync(v4tpath, fileData);
                                }
                            }).catch(error => {
                                console.error(error);
                            });
                        }
                    }
                });
                let exPath = path.resolve(this.downloadDir, this.userinfo.username, courseName, exercise.name);
                // The purpose of this file is to indicate this is an exercise directory to V4T to enable file uploads
                fs.writeFileSync(path.resolve(exPath, "v4texercise.v4t"), zipUri, { encoding: "utf8" });
                return exPath;
            } else {
                return Promise.resolve(null); // should never happen
            }
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    handleAxiosError(error: any) {
        if (error.response) {
            if (error.response.status === 401 && !this.error401thrown) {
                vscode.window.showWarningMessage("It seems that we couldn't log in, please log in.");
                this.error401thrown = true;
                this.client.jwtToken = undefined;
                this.client.xsrfToken = '';
                let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
                if (fs.existsSync(sessionPath)) {
                    fs.unlinkSync(sessionPath);
                }
                this._onDidChangeTreeData.fire();
            } else if (error.response.status === 403 && !this.error403thrown) {
                vscode.window.showWarningMessage('Something went wrong, please try again.');
                this.error403thrown = true;
                this.client.getCsrfToken();
            } else {
                let msg = error.response.data;
                if (error.response.data instanceof Object) {
                    msg = JSON.stringify(error.response.data);
                }
                vscode.window.showErrorMessage('Error ' + error.response.status + '. ' + msg);
                this.error401thrown = false;
                this.error403thrown = false;
            }
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server. " + error.message);
        } else {
            vscode.window.showErrorMessage(error.message);
        }
    }

    async addCourse() {
        try {
            let courseName = await vscode.window.showInputBox({ prompt: 'Course name' });
            if (courseName) {
                let addCourseThenable = this.client.addCourse(courseName);
                vscode.window.setStatusBarMessage('Sending course info...', addCourseThenable);
                await addCourseThenable;
                let userInfoThenable = this.getUserInfo();
                vscode.window.setStatusBarMessage('Getting course info...', userInfoThenable);
                await this.getUserInfo();
                this._onDidChangeTreeData.fire();
            }
        } catch (error) {
            // Only axios requests throw error
            this.handleAxiosError(error);
        }

    }

    async editCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let newCourseName = await vscode.window.showInputBox({ prompt: 'Course name' });
                if (newCourseName && this.userinfo && this.userinfo.courses) {
                    let editCourseThenable = this.client.editCourse(item.item.id, newCourseName);
                    vscode.window.setStatusBarMessage('Sending course info...', editCourseThenable);
                    await editCourseThenable;
                    let userInfoThenable = this.getUserInfo();
                    vscode.window.setStatusBarMessage('Getting course info...', userInfoThenable);
                    await this.getUserInfo();
                    this._onDidChangeTreeData.fire();
                }
            } catch (error) {
                // Only axios requests throw error
                this.handleAxiosError(error);
            }
        }
    }

    async deleteCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let selectedOption = await vscode.window.showWarningMessage('Are you sure you want to delete ' + item.item.name + '?', { modal: true }, 'Accept');
                if ((selectedOption === 'Accept') && this.userinfo && this.userinfo.courses) {
                    let deleteCourseThenable = this.client.deleteCourse(item.item.id);
                    vscode.window.setStatusBarMessage('Sending course info...', deleteCourseThenable);
                    await deleteCourseThenable;
                    let userInfoThenable = this.getUserInfo();
                    vscode.window.setStatusBarMessage('Getting course info...', userInfoThenable);
                    await this.getUserInfo();
                    this._onDidChangeTreeData.fire();
                }
            } catch (error) {
                // Only axios requests throw error
                this.handleAxiosError(error);
            }
        }
    }

    refreshCourses() {
        if (this.client.jwtToken) {
            // If not logged refresh shouldn't do anything
            this.getUserInfo().then(() => {
                this._onDidChangeTreeData.fire();
            }).catch(error => {
                this.handleAxiosError(error);
            });
        }
    }

    refreshExercises(item: V4TItem) {
        if (item.item && 'exercises' in item.item) {
            this.getExercises(item, item.item);
        }
    }

    async addExercise(item: V4TItem) {
        if (item.item && 'exercises' in item.item) {
            let name = await vscode.window.showInputBox({ prompt: 'Exercise name' });
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
                        let addExerciseThenable = this.client.addExercise(course.id, name);
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
                                this.handleAxiosError(uploadError);
                            } catch (deleteError) {
                                this.handleAxiosError(deleteError);
                            }
                        }
                    } catch (error) {
                        this.handleAxiosError(error);
                    }
                }
            }
        }
    }

    private buildZipFromDirectory(dir: string, zip: JSZip, root: string) {
        const list = fs.readdirSync(dir);

        for (let file of list) {
            file = path.resolve(dir, file);
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                this.buildZipFromDirectory(file, zip, root);
            } else {
                const filedata = fs.readFileSync(file);
                zip.file(path.relative(root, file), filedata);
            }
        }
    }

    async editExercise(item: V4TItem) {
        if (item.item && "id" in item.item) {
            let name = await vscode.window.showInputBox({ prompt: 'Exercise name' });
            if (name) {
                let thenable = this.client.editExercise(item.item.id, name);
                vscode.window.setStatusBarMessage("Sending exercise info...", thenable);
                await thenable;
                try {
                    this._onDidChangeTreeData.fire(item.parent);
                } catch (error) {
                    this.handleAxiosError(error);
                }
            }
        }
    }

    async deleteExercise(item: V4TItem) {
        if (item.item && "id" in item.item) {
            try {
                let selectedOption = await vscode.window.showWarningMessage('Are you sure you want to delete ' + item.item.name + '?', { modal: true }, 'Accept');
                if (selectedOption === 'Accept') {
                    let deleteExerciseThenable = this.client.deleteExercise(item.item.id);
                    vscode.window.setStatusBarMessage('Sending exercise info...', deleteExerciseThenable);
                    await deleteExerciseThenable;
                    this._onDidChangeTreeData.fire(item.parent);
                }
            } catch (error) {
                // Only axios requests throw error
                this.handleAxiosError(error);
            }
        }
    }

    async addUsersToCourse(item: V4TItem) {
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
                //Show users that don't belong to the course already
                let showArray = users.filter(user => courseUsers.filter((courseUser: User) => courseUser.id === user.id).length === 0)
                    .map(user => {
                        let displayName = user.name && user.lastName ? user.name + " " + user.lastName : user.username;
                        if (user.roles.includes({ roleName: "ROLE_TEACHER" })) {
                            displayName += " (Teacher)";
                        }
                        return new UserPick(displayName, user);
                    });
                if (showArray.length > 0) {
                    let picks: UserPick[] | undefined = await vscode.window.showQuickPick<UserPick>(showArray, { canPickMany: true });
                    if (picks) {
                        let ids: number[] = [];
                        picks.forEach(pick => ids.push(pick.user.id));
                        let addUsersThenable = this.client.addUsersToCourse(item.item.id, ids);
                        vscode.window.setStatusBarMessage("Adding users to course...", addUsersThenable);
                        await addUsersThenable;
                    }
                } else {
                    vscode.window.showInformationMessage("There are no users available.");
                }
            } catch (error) {
                this.handleAxiosError(error);
            }
        }
    }

    async removeUsersFromCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                let courseUsersThenable = this.client.getUsersInCourse(item.item.id);
                vscode.window.setStatusBarMessage("Getting user info...", courseUsersThenable);
                let courseUsersResponse = await courseUsersThenable;
                let creatorResponse = await this.client.getCreator(item.item.id);
                let creator: User = creatorResponse.data;
                let courseUsers = courseUsersResponse.data;
                let showArray = courseUsers.filter((user: User) => user.id !== creator.id).map((user: User) => {
                    let displayName = user.name && user.lastName ? user.name + " " + user.lastName : user.username;
                    if (user.roles.includes({ roleName: "ROLE_TEACHER" })) {
                        displayName += " (Teacher)";
                    }
                    return new UserPick(displayName, user);
                });
                if (showArray.length > 0) {
                    let picks: UserPick[] | undefined = await vscode.window.showQuickPick<UserPick>(showArray, { canPickMany: true });
                    if (picks) {
                        let ids: number[] = [];
                        picks.forEach(pick => ids.push(pick.user.id));
                        let addUsersThenable = this.client.removeUsersFromCourse(item.item.id, ids);
                        vscode.window.setStatusBarMessage("Removing users from course...", addUsersThenable);
                        await addUsersThenable;
                    }
                } else {
                    vscode.window.showInformationMessage("There are no users available.");
                }
            } catch (error) {
                this.handleAxiosError(error);
            }
        }
    }
}

export class UserPick implements vscode.QuickPickItem {
    constructor(
        public readonly label: string,
        public readonly user: User
    ) { }
}