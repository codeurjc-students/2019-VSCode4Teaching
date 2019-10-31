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

    getTreeItem(element: V4TItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: V4TItem | undefined): vscode.ProviderResult<V4TItem[]> {
        if (element) {
            // Only collapsable items are courses
            let course = this.findCourseByName(element.label);
            if (course) {
                // If exercises were downloaded previously show them, else get them from server
                if (course.exercises) {
                    // Map exercises to TreeItems
                    return course.exercises.map(exercise => new V4TItem(exercise.name, V4TItemType.Exercise, vscode.TreeItemCollapsibleState.None, {
                        "command": "vscode4teaching.getexercisefiles",
                        "title": "Get exercise files",
                        "arguments": [course ? course.name : null, exercise.name, exercise.id] // course condition is needed to avoid compilation error, shouldn't be false
                    }));
                } else {
                    this.getExercises(element, course);
                }
            }
        }
        else {
            // If not logged add login button, else show courses
            if (!this.client.jwtToken) {
                return [new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, {
                    "command": "vscode4teaching.login",
                    "title": "Log in to VS Code 4 Teaching"
                })];
            } else {
                if (this.userinfo && this.userinfo.courses) {
                    // Map courses to TreeItems
                    return this.userinfo.courses.map(course => new V4TItem(course.name, V4TItemType.Course, vscode.TreeItemCollapsibleState.Collapsed));
                } else {
                    return [];
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
        let loginThenable = this.client.login(username, password);
        vscode.window.setStatusBarMessage("Logging in to VS Code 4 Teaching...", loginThenable);
        let response = await loginThenable;
        vscode.window.showInformationMessage("Logged in");
        this.client.jwtToken = response.data['jwtToken'];
        let coursesThenable = this.client.getUserInfo();
        vscode.window.setStatusBarMessage("Getting user courses...", coursesThenable);
        let userResponse = await coursesThenable;
        this.userinfo = userResponse.data;
        this._onDidChangeTreeData.fire();
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

    private findCourseByName(name: string): Course | undefined {
        if (this.userinfo && this.userinfo.courses) {
            return this.userinfo.courses.filter(course => course.name === name)[0];
        }
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

    async getExerciseFiles(courseName: string, exerciseName: string, exerciseId: number): Promise<string | null> {
        if (this.userinfo && !fs.existsSync('v4tdownloads/' + this.userinfo.username + "/" + courseName + '/' + exerciseName)) {
            if (!fs.existsSync('v4tdownloads/' + this.userinfo.username + "/" + courseName)) {
                if (!fs.existsSync('v4tdownloads/' + this.userinfo.username)) {
                    if (!fs.existsSync('v4tdownloads/')) {
                        fs.mkdirSync('v4tdownloads/');
                    }
                    fs.mkdirSync('v4tdownloads/' + this.userinfo.username);
                }
                fs.mkdirSync('v4tdownloads/' + this.userinfo.username + "/" + courseName);
            }
            fs.mkdirSync('v4tdownloads/' + this.userinfo.username + "/" + courseName + '/' + exerciseName);
        }
        let requestThenable = this.client.getExerciseFiles(exerciseId);
        vscode.window.setStatusBarMessage("Downloading exercise files...", requestThenable);
        await requestThenable.then(response => {
            JSZip.loadAsync(response.data).then(zip => {
                zip.forEach((relativePath, file) => {
                    if (this.userinfo) {
                        let v4tpath = 'v4tdownloads/' + this.userinfo.username + "/" + courseName + '/' + exerciseName + '/' + relativePath;
                        if (this.userinfo && file.dir) {
                            fs.mkdirSync(v4tpath);
                        } else {
                            file.async('nodebuffer').then(fileData => {
                                fs.writeFileSync(v4tpath, fileData);
                            });
                        }
                    }
                });
            });
        }).catch(error => {
            this.handleAxiosError(error);
        });
        if (this.userinfo) {
            return path.resolve('v4tdownloads' + path.sep + this.userinfo.username + path.sep + courseName + path.sep + exerciseName);
        } else {
            return Promise.resolve(null);
        }
    }

    private handleAxiosError(error: any) {
        if (error.response) {
            vscode.window.showErrorMessage(error.response.data);
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server");
        } else {
            vscode.window.showErrorMessage(error.message);
        }
    }
}

export class V4TItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly type: V4TItemType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    get iconPath() {
        if (this.type === V4TItemType.Login) {
            return {
                light: path.join(__filename, '..', '..', 'resources', 'light', 'login.png'),
                dark: path.join(__filename, '..', '..', 'resources', 'dark', 'login.png')
            };
        }
    }
}

export enum V4TItemType {
    Login,
    Course,
    Exercise
}