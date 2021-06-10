import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { Course } from "../../model/serverModel/course/Course";
import * as vsls from 'vsls';
import { CurrentUser } from "../../client/CurrentUser";
import { liveshareAPI, ws, setLiveshareAPI } from "../../extension";

export class LiveshareWebview {
    public static currentPanel: LiveshareWebview | undefined;

    public static readonly viewType = "v4tliveshareBoard";

    public static readonly resourcesPath = __dirname.includes(path.sep + "out" + path.sep) ?
        path.join(__dirname, "..", "..", "..", "..", "resources", "dashboard") :
        path.join(__dirname, "..", "..", "..", "resources", "dashboard");

    public static show(courses: Course[]) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (LiveshareWebview.currentPanel) {
            LiveshareWebview.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        let dashboardName = "Liveshare Dashboard";

        const panel = vscode.window.createWebviewPanel(
            LiveshareWebview.viewType,
            dashboardName,
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `resources` directory.
                localResourceRoots: [vscode.Uri.file(LiveshareWebview.resourcesPath)],
            },
        );

        LiveshareWebview.currentPanel = new LiveshareWebview(panel, dashboardName, courses);
    }

    public readonly panel: vscode.WebviewPanel;

    private readonly _dashboardName: string;
    private _courses: Course[];
    private _reloadInterval: NodeJS.Timeout | undefined;
    private sortAsc: boolean;
    private shareCode: vscode.Uri | null;


    private constructor(panel: vscode.WebviewPanel, dashboardName: string, courses: Course[]) {
        this.panel = panel;
        this._dashboardName = dashboardName;
        this._courses = courses;
        this.sortAsc = false;
        this.shareCode = null;

        // Set the webview's initial html content
        this.getHtmlForWebview().then(
            data => {
                this.panel.webview.html = data;
            },
            err => { console.error(err); }
        );

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => this.dispose());

        // Update the content based on view changes
        this.panel.onDidChangeViewState(
            (e) => {
                if (this.panel.visible) {
                    this.getHtmlForWebview().then(
                        data => {
                            this.panel.webview.html = data;
                        },
                        err => { console.error(err); }
                    );
                }
            },
        );
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'start-liveshare': {
                    if (!liveshareAPI) {
                        const api = await vsls.getApi();
                        if (api != null)
                            setLiveshareAPI(api);
                    }
                    if (liveshareAPI) {
                        this.sendLiveshareCode(message.username);
                    }
                }
            }
        });
    }

    private async sendLiveshareCode(username: string) {
        if (liveshareAPI) {
            if (!this.shareCode) {
                const optionalCode = await liveshareAPI.share();
                if (optionalCode) this.shareCode = optionalCode;
            }
            if (!this.shareCode) return;
            let from: string;
            try {
                from = CurrentUser.getUserInfo().username;
            } catch (error) {
                from = "undefined";
            }
            ws?.send(JSON.stringify({ "target": username, "from": from, "code": this.shareCode?.toString() }))
        }
    }

    public dispose() {
        LiveshareWebview.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();
    }

    private reloadData() {
        // APIClient.getAllStudentsExerciseUserInfo(this._exerciseId).then((response: AxiosResponse<ExerciseUserInfo[]>) => {
        //     this._euis = response.data;
        //     this.panel.webview.html = this.getHtmlForWebview();
        // }).catch((error) => APIClient.handleAxiosError(error));
    }

    private async getHtmlForWebview() {
        // Local path to main script run in the webview
        const scriptPath = vscode.Uri.file(
            path.join(LiveshareWebview.resourcesPath, "liveshareBoard.js"),
        );
        // And the uri we use to load this script in the webview
        const scriptUri = this.panel.webview.asWebviewUri(scriptPath);

        // Local path to styles
        const cssPath = vscode.Uri.file(
            path.join(LiveshareWebview.resourcesPath, "dashboard.css"),
        );

        // Styles uri
        const cssUri = this.panel.webview.asWebviewUri(cssPath);

        // Transform EUIs to html table data
        let tables: string = "";
        let usersSet = new Set();
        for (let i = 0; i < this._courses.length; i++) {
            // tables += await this.generateHTMLTableFromCourse(this._courses[i]);
            const { text, users } = await this.generateHTMLTableFromCourse(this._courses[i]);
            tables += text;
            usersSet = new Set([...usersSet, ...users]);
        }

        let searchbar: string = "<datalist id='usernames'>\n";
        usersSet.forEach(username => {
            searchbar = searchbar + `<option value='${username}'>`;
        })
        searchbar = searchbar + "</datalist>";

        // Use a nonce to whitelist which scripts can be run
        const nonce = this.getNonce();
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource} https:; script-src 'nonce-${nonce}'; style-src-elem ${this.panel.webview.cspSource};">
                <title>V4T Dashboard: ${this._dashboardName}</title>
                <link rel="stylesheet" type="text/css" href="${cssUri}">
            </head>
            <body>
                <h1>Liveshare - Users in courses</h1>
                <hr/>
                <label for="username-search">Quick search: </label>
                <input id="username-search" list="usernames" type="text">
                ${searchbar}
                <button id="search-send" type="button">Send</button>
                ${tables}
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    private getNonce() {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private async generateHTMLTableFromCourse(course: Course): Promise<any> {
        let data = {
            text: "",
            users: new Set(),
        }
        let rows = "";

        const users = await APIClient.getUsersInCourse(course.id);
        if (!users?.data) return "";

        let currentUsername: string;
        try {
            currentUsername = CurrentUser.getUserInfo().username;
        } catch (_) { }
        users.data.sort((user1, user2) => {
            if (user1.roles.some(r => r.roleName == "ROLE_TEACHER")) return -1;
            if (user2.roles.some(r => r.roleName == "ROLE_TEACHER")) return 1;
            else return 0;
        }).forEach(user => {
            if (!currentUsername || currentUsername === user.username) return;
            data.users.add(user.username);
            rows = rows + "<tr>\n";
            rows = rows + "<td>" + (user.name ? (user.name) : "") + " " + (user.lastName ? (user.lastName) : "") + "</td>\n";
            rows = rows + "<td class='username'>" + (user.username ? (user.username) : "") + "</td>\n";
            rows = rows + "<td>" + (user.roles ? user.roles.reduce((ac, r) => ac + r.roleName.replace("ROLE_", "") + " | ", "").replace(/\s\|\s$/, "") : "") + "</td>\n";
            rows = rows + "<td><button class='liveshare-send'>Send</button></td>\n";
            rows = rows + "</tr>\n";

        });

        data.text = `<br/>
        <h3>Users in ${course.name}</h3>
        <table>
            <tr>
                <th>Full name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Liveshare</th>
            </tr>
            ${rows}
        </table>`

        return data;
    }
}
