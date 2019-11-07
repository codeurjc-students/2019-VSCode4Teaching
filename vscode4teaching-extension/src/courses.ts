import * as vscode from 'vscode';
import { RestClient } from './restclient';
import * as path from 'path';
import { User, Course, Exercise } from './model';
import * as fs from 'fs';
import * as JSZip from 'jszip';

export class CoursesProvider implements vscode.TreeDataProvider<V4TItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<V4TItem | undefined> = new vscode.EventEmitter<V4TItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<V4TItem | null | undefined> = this._onDidChangeTreeData.event;
    private _client = new RestClient();
    private _userinfo: User | undefined;
    private error401thrown = false;
    private error403thrown = false;
    private loading = false;

    getTreeItem(element: V4TItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: V4TItem | undefined): vscode.ProviderResult<V4TItem[]> {
        if (!this.loading) {
            if (element) {
                // Only collapsable items are courses
                let course = element.item;
                if (course && "exercises" in course) {
                    // If exercises were downloaded previously show them, else get them from server
                    if (course.exercises.length > 0) {
                        // Map exercises to TreeItems
                        let type: V4TItemType;
                        if (this.userinfo && this.userinfo.roles.filter(role => role.roleName === "ROLE_TEACHER").length > 0) {
                            type = V4TItemType.ExerciseTeacher;
                        } else {
                            type = V4TItemType.ExerciseStudent;
                        }
                        return course.exercises.map(exercise => new V4TItem(exercise.name, type, vscode.TreeItemCollapsibleState.None, exercise, {
                            "command": "vscode4teaching.getexercisefiles",
                            "title": "Get exercise files",
                            "arguments": [course ? course.name : null, exercise] // course condition is needed to avoid compilation error, shouldn't be false
                        }));
                    } else {
                        this.getExercises(element, course);
                    }
                }
            } else {
                // If not logged add login button, else show courses
                if (!this.client.jwtToken) {
                    try {
                        if (fs.existsSync(__dirname + "/v4t/v4tsession")) {
                            let readSession = fs.readFileSync(__dirname + "/v4t/v4tsession").toString();
                            let sessionParts = readSession.split("\n");
                            this.client.jwtToken = sessionParts[0];
                            this.client.xsrfToken = sessionParts[1];
                            this.client.baseUrl = sessionParts[2];
                            this.getChildren();
                        }
                    } catch (error) {
                        return [new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, {
                            "command": "vscode4teaching.login",
                            "title": "Log in to VS Code 4 Teaching"
                        })];
                    }
                    return [new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, {
                        "command": "vscode4teaching.login",
                        "title": "Log in to VS Code 4 Teaching"
                    })];
                } else {
                    if ((!this.userinfo || !this.userinfo.courses) && !this.error401thrown && !this.error403thrown) {
                        this.loading = true;
                        let thenable = this.getUserInfo();
                        vscode.window.setStatusBarMessage("Getting data...", thenable);
                        thenable.then(() => {
                            this._onDidChangeTreeData.fire();
                        }).finally(() => {
                            this.loading = false;
                        });
                    }
                    if (this.userinfo && this.userinfo.courses) {
                        let isTeacher = this.userinfo.roles.filter(role => role.roleName === "ROLE_TEACHER").length > 0;
                        let type: V4TItemType;
                        if (isTeacher) {
                            type = V4TItemType.CourseTeacher;
                        } else {
                            type = V4TItemType.CourseStudent;
                        }
                        let items = this.userinfo.courses.map(course => new V4TItem(course.name, type, vscode.TreeItemCollapsibleState.Collapsed, course));
                        if (isTeacher) {
                            items.unshift(new V4TItem("Add Course", V4TItemType.AddCourse, vscode.TreeItemCollapsibleState.None, undefined, {
                                command: "vscode4teaching.addcourse",
                                title: "Add Course"
                            }));
                        }
                        return items;
                    }
                    return [new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, {
                        "command": "vscode4teaching.login",
                        "title": "Log in to VS Code 4 Teaching"
                    })];
                }
            }
        }
    }

    async login() {
        // Ask for server url, then username, then password, and try to log in at the end
        let serverInputOptions: vscode.InputBoxOptions = { "prompt": "Server", "value": "http://localhost:8080" };
        serverInputOptions.validateInput = this.validateInputCustomUrl;
        let url: string | undefined = await vscode.window.showInputBox(serverInputOptions);
        if (url) {
            this.client.baseUrl = url;
            let username: string | undefined = await vscode.window.showInputBox({ "prompt": "Username" });
            if (username) {
                let password: string | undefined = await vscode.window.showInputBox({ "prompt": "Password", "password": true });
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
            if (fs.existsSync(__dirname + '/v4t/v4tsession')) {
                fs.unlinkSync(__dirname + '/v4t/v4tsession');
            }
            this.client.jwtToken = undefined;
            this.client.xsrfToken = "";
            await this.client.getCsrfToken();
            let loginThenable = this.client.login(username, password);
            vscode.window.setStatusBarMessage("Logging in to VS Code 4 Teaching...", loginThenable);
            let response = await loginThenable;
            vscode.window.showInformationMessage("Logged in");
            this.client.jwtToken = response.data['jwtToken'];
            if (!fs.existsSync(__dirname + "/v4t")) {
                fs.mkdirSync(__dirname + "/v4t");
            }
            fs.writeFileSync(__dirname + "/v4t/v4tsession", this.client.jwtToken + "\n" + this.client.xsrfToken + "\n" + this.client.baseUrl);
            await this.getUserInfo();
            this._onDidChangeTreeData.fire();
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    private async getUserInfo() {
        let coursesThenable = this.client.getUserInfo();
        vscode.window.setStatusBarMessage("Getting user courses...", coursesThenable);
        // Errors have to be controlled in the caller function
        let userResponse = await coursesThenable;
        this.userinfo = userResponse.data;
    }

    validateInputCustomUrl(value: string): string | undefined | null | Thenable<string | undefined | null> {
        // Regular expresion for urls
        let regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
        let pattern = new RegExp(regexp);
        if (pattern.test(value)) {
            return null;
        } else {
            return "Invalid URL";
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
        vscode.window.setStatusBarMessage("Getting exercises...", exercisesThenable);
        exercisesThenable.then(response => {
            if (course) {
                course.exercises = response.data;
                this._onDidChangeTreeData.fire(item);
            }
        }).catch(error => {
            this.handleAxiosError(error);
        });

    }

    async getExerciseFiles(courseName: string, exercise: Exercise): Promise<string | null> {
        if (this.userinfo && !fs.existsSync('v4tdownloads/' + this.userinfo.username + "/" + courseName + '/' + exercise.name)) {
            if (!fs.existsSync('v4tdownloads/' + this.userinfo.username + "/" + courseName)) {
                if (!fs.existsSync('v4tdownloads/' + this.userinfo.username)) {
                    if (!fs.existsSync('v4tdownloads/')) {
                        fs.mkdirSync('v4tdownloads/');
                    }
                    fs.mkdirSync('v4tdownloads/' + this.userinfo.username);
                }
                fs.mkdirSync('v4tdownloads/' + this.userinfo.username + "/" + courseName);
            }
            fs.mkdirSync('v4tdownloads/' + this.userinfo.username + "/" + courseName + '/' + exercise.name);
        }
        let requestThenable = this.client.getExerciseFiles(exercise.id);
        vscode.window.setStatusBarMessage("Downloading exercise files...", requestThenable);
        let response = await requestThenable;
        let zip = await JSZip.loadAsync(response.data);
        zip.forEach((relativePath, file) => {
            if (this.userinfo) {
                let v4tpath = 'v4tdownloads/' + this.userinfo.username + "/" + courseName + '/' + exercise.name + '/' + relativePath;
                if (this.userinfo && file.dir && !fs.existsSync(v4tpath)) {
                    fs.mkdirSync(v4tpath);
                } else {
                    file.async('nodebuffer').then(fileData => {
                        fs.writeFileSync(v4tpath, fileData);
                    });
                }
            }
        });
        if (this.userinfo) {
            return path.resolve('v4tdownloads' + path.sep + this.userinfo.username + path.sep + courseName + path.sep + exercise.name);
        } else {
            return Promise.resolve(null);
        }
    }

    private handleAxiosError(error: any) {
        if (error.response) {
            if (error.response.status === 401 && !this.error401thrown) {
                vscode.window.showWarningMessage("It seems that we couldn't log in, please log in.");
                this.error401thrown = true;
                this.client.jwtToken = undefined;
                this.client.xsrfToken = "";
                if (fs.existsSync(__dirname + "/v4t/v4tsession")) {
                    fs.unlinkSync(__dirname + "/v4t/v4tsession");
                }
                this._onDidChangeTreeData.fire();
            } else if (error.response.status === 403 && !this.error403thrown) {
                vscode.window.showWarningMessage("Something went wrong, please try again.");
                this.error403thrown = true;
                this.client.getCsrfToken();
            } else {
                let msg = error.response.data;
                if (error.response.data instanceof Object) {
                    msg = JSON.stringify(error.response.data);
                }
                vscode.window.showErrorMessage("Error " + error.response.status + ". " + msg);
                this.error401thrown = false;
                this.error403thrown = false;
            }
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server");
        } else {
            vscode.window.showErrorMessage(error.message);
        }
    }

    async addCourse() {
        try {
            let courseName = await vscode.window.showInputBox({ prompt: "Course name" });
            if (courseName) {
                let addCourseThenable = this.client.addCourse(courseName);
                vscode.window.setStatusBarMessage("Sending course info...", addCourseThenable);
                await addCourseThenable;
                let userInfoThenable = this.getUserInfo();
                vscode.window.setStatusBarMessage("Getting course info...", userInfoThenable);
                await this.getUserInfo();
                this._onDidChangeTreeData.fire();
            }
        } catch (error) {
            // Only axios requests throw error
            this.handleAxiosError(error);
        }

    }

    async editCourse(course: Course) {
        try {
            let newCourseName = await vscode.window.showInputBox({ prompt: "Course name" });
            if (newCourseName && this.userinfo && this.userinfo.courses) {
                let course = this.userinfo.courses.find(course => course.name === course.name);
                if (course) {
                    let editCourseThenable = this.client.editCourse(course.id, newCourseName);
                    vscode.window.setStatusBarMessage("Sending course info...", editCourseThenable);
                    await editCourseThenable;
                    let userInfoThenable = this.getUserInfo();
                    vscode.window.setStatusBarMessage("Getting course info...", userInfoThenable);
                    await this.getUserInfo();
                    this._onDidChangeTreeData.fire();
                }
            }
        } catch (error) {
            // Only axios requests throw error
            this.handleAxiosError(error);
        }
    }

    async deleteCourse(course: Course) {
        try {
            let selectedOption = await vscode.window.showWarningMessage("Are you sure you want to delete " + course.name + "?", { modal: true }, "Accept");
            if ((selectedOption === "Accept") && this.userinfo && this.userinfo.courses) {
                let course = this.userinfo.courses.find(course => course.name === course.name);
                if (course) {
                    let deleteCourseThenable = this.client.deleteCourse(course.id);
                    vscode.window.setStatusBarMessage("Sending course info...", deleteCourseThenable);
                    await deleteCourseThenable;
                    let userInfoThenable = this.getUserInfo();
                    vscode.window.setStatusBarMessage("Getting course info...", userInfoThenable);
                    await this.getUserInfo();
                    this._onDidChangeTreeData.fire();
                }
            }
        } catch (error) {
            // Only axios requests throw error
            this.handleAxiosError(error);
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
}

export class V4TItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly type: V4TItemType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
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