import * as vscode from 'vscode';
import { RestClient } from './restclient';
import * as path from 'path';
import { User } from './model';

export class CoursesProvider implements vscode.TreeDataProvider<CourseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CourseItem | undefined> = new vscode.EventEmitter<CourseItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<CourseItem | null | undefined> = this._onDidChangeTreeData.event;
    private _client = new RestClient();
    private _userinfo: User | undefined;

    getTreeItem(element: CourseItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: CourseItem | undefined): vscode.ProviderResult<CourseItem[]> {
        if (element) {
            return [element];
        }
        else {
            if (!this.client.getJwtToken()) {
                return [new CourseItem("Login", vscode.TreeItemCollapsibleState.None, {
                    "command": "vscode4teaching.login",
                    "title": "Log in to VS Code 4 Teaching"
                })];
            } else {
                if (this.userinfo && this.userinfo.courses) {
                    return this.userinfo.courses.map(course => new CourseItem(course.name, vscode.TreeItemCollapsibleState.None));
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
            this.client.setUrl(url);
            let username: string | undefined = await vscode.window.showInputBox({ "prompt": "Username" });
            if (username) {
                let password: string | undefined = await vscode.window.showInputBox({ "prompt": "Password", "password": true });
                if (password) {
                    await this.callLogin(username, password);
                }
            }
        }
    }

    private async callLogin(username: string, password: string) {
        let loginThenable = this.client.login(username, password);
        vscode.window.setStatusBarMessage("Logging in to VS Code 4 Teaching...", loginThenable);
        try {
            let response = await loginThenable;
            vscode.window.showInformationMessage("Logged in");
            this.client.setJwtToken(response.data['jwtToken']);
            let coursesThenable = this.client.getUserInfo();
            vscode.window.setStatusBarMessage("Getting user courses...", coursesThenable);
            let userResponse = await coursesThenable;
            this.userinfo = userResponse.data;
            this._onDidChangeTreeData.fire();
        } catch (error) {
            if (error.response) {
                vscode.window.showErrorMessage(error.response.data);
            } else if (error.request) {
                vscode.window.showErrorMessage("Can't connect to the server");
            } else {
                vscode.window.showErrorMessage(error.message);
            }
        }
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

    get userinfo(): User | undefined {
        if (this._userinfo) {
            return this._userinfo;
        }
    }

    set userinfo(userinfo: User | undefined) {
        this._userinfo = userinfo;
    }
}

export class CourseItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    get iconPath() {
        if (this.label === "Login") {
            return {
                light: path.join(__filename, '..', '..', 'resources', 'light', 'login.png'),
                dark: path.join(__filename, '..', '..', 'resources', 'dark', 'login.png')
            };
        } else {
            return {
                light: path.join(__filename, '..', '..', 'resources', 'light', 'login.png'),
                dark: path.join(__filename, '..', '..', 'resources', 'dark', 'login.png')
            };
        }
    }
}