import * as vscode from 'vscode';
import { RestClient } from './restclient';
export class CoursesProvider implements vscode.TreeDataProvider<Course> {
    private _onDidChangeTreeData: vscode.EventEmitter<Course | undefined> = new vscode.EventEmitter<Course | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<Course | null | undefined> = this._onDidChangeTreeData.event;
    private client = new RestClient();
    private logged: boolean = false;

    getTreeItem(element: Course): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: Course | undefined): vscode.ProviderResult<Course[]> {
        if (element) {
            return [element];
        }
        else {
            if (!this.logged) {
                return [new Course("Login", vscode.TreeItemCollapsibleState.None, {
                    "command": "vscode4teaching.login",
                    "title": "Log in to VS Code 4 Teaching"
                })];
            } else {
                //TODO get courses
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
            this.logged = true;
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
        let regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
        let pattern = new RegExp(regexp);
        if (pattern.test(value)) {
            return null;
        } else {
            return "Invalid URL";
        }

    }

    getClient(): RestClient {
        return this.client;
    }
}

export class Course extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

}