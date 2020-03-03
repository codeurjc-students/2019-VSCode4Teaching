import * as vscode from 'vscode';
import { RestClient } from './restclient';
import * as path from 'path';
import { User, Course, Exercise, ModelUtils, ManageCourseUsers } from './model/serverModel';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import { V4TItem, V4TItemType } from './v4titem';
import mkdirp = require('mkdirp');
import { V4TExerciseFile } from './model/v4texerciseFile';
import { FileIgnoreUtil } from './fileIgnoreUtil';
import { AxiosPromise } from 'axios';

export class CoursesProvider implements vscode.TreeDataProvider<V4TItem> {
    private static _onDidChangeTreeData: vscode.EventEmitter<V4TItem | undefined> = new vscode.EventEmitter<V4TItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<V4TItem | null | undefined> = CoursesProvider._onDidChangeTreeData.event;
    private client = RestClient.getClient();
    private loading = false;
    readonly downloadDir = vscode.workspace.getConfiguration('vscode4teaching')['defaultExerciseDownloadDirectory'];
    readonly internalFilesDir = path.resolve(__dirname, 'v4t');
    // Login Button that will be show when user is not logged in
    private LOGIN_ITEM = [new V4TItem('Login', V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
        'command': 'vscode4teaching.login',
        'title': 'Log in to VS Code 4 Teaching'
    })];
    private NO_COURSES_ITEM = [new V4TItem('No courses available', V4TItemType.NoCourses, vscode.TreeItemCollapsibleState.None)];

    getParent (element: V4TItem) {
        return element.parent;
    }

    getTreeItem (element: V4TItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren (element?: V4TItem | undefined): vscode.ProviderResult<V4TItem[]> {
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
                            return this.getCourseButtons();
                        }
                    } catch (error) {
                        return this.LOGIN_ITEM;
                    }
                    return this.LOGIN_ITEM;
                } else {
                    return this.getCourseButtons();
                }
            }
        }
    }

    static triggerTreeReload (item?: V4TItem) {
        CoursesProvider._onDidChangeTreeData.fire(item);
    }

    private getExerciseButtons (element: V4TItem): V4TItem[] {
        let course = element.item;
        if (course && 'exercises' in course) {
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
                return course.exercises.map(exercise => new V4TItem(exercise.name, type, vscode.TreeItemCollapsibleState.None, element, exercise, {
                    'command': commandName,
                    'title': 'Get exercise files',
                    'arguments': [course ? course.name : null, exercise] // course condition is needed to avoid compilation error, shouldn't be false
                }));
            }
        }
        return this.LOGIN_ITEM;
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
            return items;
        }
        return this.NO_COURSES_ITEM;
    }

    async login () {
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
                    this.client.callLogin(username, password).catch(error => {
                        this.client.handleAxiosError(error);
                    });
                }
            }
        }
    }

    validateInputCustomUrl (value: string): string | undefined | null | Thenable<string | undefined | null> {
        // Regular expresion for urls
        let regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
        let pattern = new RegExp(regexp);
        if (pattern.test(value)) {
            return null;
        } else {
            return 'Invalid URL';
        }

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

    private async getFiles (dir: string, zipDir: string, zipName: string, requestThenable: Thenable<any>, templateDir?: string) {
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
            let courseName = await vscode.window.showInputBox({ prompt: 'Course name' });
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
                let newCourseName = await vscode.window.showInputBox({ prompt: 'Course name' });
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
        if (item.item && 'exercises' in item.item) {
            this.getExercises(item, item.item);
        }
    }

    async addExercise (item: V4TItem) {
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
            let name = await vscode.window.showInputBox({ prompt: 'Exercise name' });
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

}

export class UserPick implements vscode.QuickPickItem {
    constructor(
        public readonly label: string,
        public readonly user: User
    ) { }
}