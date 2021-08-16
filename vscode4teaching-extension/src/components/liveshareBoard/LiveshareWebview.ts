import * as path from "path";
import * as vscode from "vscode";
import * as vsls from "vsls";
import { APIClient } from "../../client/APIClient";
import { CurrentUser } from "../../client/CurrentUser";
import { connectWS, handleLiveshareMessage, liveshareAPI, setLiveshareAPI, ws } from "../../extension";
import { Course } from "../../model/serverModel/course/Course";
import { User } from "../../model/serverModel/user/User";

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
        const dashboardName = "Liveshare Dashboard";

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
    private data: any[];
    private users: Set<string>;
    private sortAsc: boolean;
    private shareCode: vscode.Uri | null;

    private constructor(panel: vscode.WebviewPanel, dashboardName: string, courses: Course[]) {
        this.panel = panel;
        this._dashboardName = dashboardName;
        this._courses = courses;
        this.data = [];
        this.users = new Set();

        this.sortAsc = false;
        this.shareCode = null;

        this.getUsersDataFromCourses().then((_) => {
            // Set the webview's initial html content
            this.getHtmlForWebview().then(
                (data) => {
                    this.panel.webview.html = data;
                },
                (err) => { console.error(err); },
            );
        });

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => this.dispose());

        // Update the content based on view changes
        this.panel.onDidChangeViewState(
            (e) => {
                if (this.panel.visible) {
                    this.getHtmlForWebview().then(
                        (data) => {
                            this.panel.webview.html = data;
                        },
                        (err) => { console.error(err); },
                    );
                }
            },
        );
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "start-liveshare": {

                    if (CurrentUser.getUserInfo().username === message.username) {
                        vscode.window.showWarningMessage("Choose a valid user to start Live Share");
                        break;
                    }

                    if (!liveshareAPI) {
                        const api = await vsls.getApi();
                        if (api == null) {
                            vscode.window.showErrorMessage("Install Live Share extension in order to use its integrated service on V4T", "Install").then(
                                (res) => {
                                    if (res === "Install") {
                                        vscode.commands.executeCommand("workbench.extensions.installExtension", "ms-vsliveshare.vsliveshare-pack");
                                    }
                                },
                            );
                        } else { setLiveshareAPI(api); }
                    }
                    if (liveshareAPI) {
                        this.sendLiveshareCode(message.username);
                    }
                }
                case "sort-ls": {
                    this.sortAsc = message.desc;
                    const weight = this.sortAsc ? 1 : -1;
                    switch (message.column % this.data.length) {
                        case 0: {
                            // full name
                            this.data[message.courseIndex].users.sort((a: User, b: User) => {

                                const aname = ((a.name) ? a.name : "") + " " + ((a.lastName) ? a.lastName : "");
                                const bname = ((b.name) ? b.name : "") + " " + ((b.lastName) ? b.lastName : "");

                                if (aname > bname) {
                                    return -1 * weight;
                                } else if (a.username < b.username) {
                                    return 1 * weight;
                                } else { return 0; }
                            });
                            break;
                        }
                        case 1: {
                            // username
                            this.data[message.courseIndex].users.sort((a: User, b: User) => {
                                if (a.username > b.username) {
                                    return -1 * weight;
                                } else if (a.username < b.username) {
                                    return 1 * weight;
                                } else { return 0; }
                            });
                            break;
                        }
                        case 2: {
                            // role
                            this.data[message.courseIndex].users.sort((a: User, b: User) => {
                                if (a.roles.some((r) => r.roleName === "ROLE_TEACHER")) { return -1 * weight; }
                                if (b.roles.some((r) => r.roleName === "ROLE_TEACHER")) { return 1 * weight; }
                                if (a.username < b.username) { return -1 * weight; }
                                if (a.username > b.username) { return 1 * weight; } else { return 0; }
                            });
                            break;
                        }
                    }
                    this.panel.webview.html = await this.getHtmlForWebview();
                    break;
                }
            }
        });
    }

    public dispose() {
        LiveshareWebview.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();
    }

    private async getUsersDataFromCourses(): Promise<void> {
        for (const course of this._courses) {
            const users = await this.getUsersFromCourse(course);
            this.data.push({ course, users });
        }
    }

    private async getUsersFromCourse(course: Course): Promise<User[]> {
        const users = await APIClient.getUsersInCourse(course.id);
        console.debug(users);
        if (!users?.data) { return []; }

        let currentUsername: string;
        try {
            currentUsername = CurrentUser.getUserInfo().username;
        } catch (err) {
            console.error(err);
        }
        const filteredUsers = users.data
            .filter((user) => currentUsername && currentUsername !== user.username)
            .sort((user1, user2) => {
                if (user1.roles.some((r) => r.roleName === "ROLE_TEACHER")) { return -1; }
                if (user2.roles.some((r) => r.roleName === "ROLE_TEACHER")) { return 1; }
                if (user1.username < user2.username) { return -1; }
                if (user1.username > user2.username) { return 1; } else { return 0; }
            });

        this.users = new Set([...this.users, ...filteredUsers.map((user) => user.username)]);
        return filteredUsers;
    }

    private async sendLiveshareCode(username: string) {
        if (!username) {
            const errorMsg = "Error sending Live Share code: username is null";
            vscode.window.showErrorMessage(errorMsg);
            console.error(errorMsg);
            return;
        }
        if (liveshareAPI) {
            if (!this.shareCode) {
                const optionalCode = await liveshareAPI.share();
                if (optionalCode) { this.shareCode = optionalCode; }
            }
            if (!this.shareCode) {
                vscode.window.showErrorMessage("Error generating Live Share Code");
                return;
            }
            if (!ws) {
                vscode.window.showInformationMessage("Reconnecting websocket session...");
                connectWS("liveshare", (data: any) => handleLiveshareMessage(data?.data));
            }
            let from: string;
            try {
                from = CurrentUser.getUserInfo().username;
            } catch (error) {
                vscode.window.showInformationMessage("Error getting sender username: sending undefined");
                from = "undefined";
            }
            ws?.send(JSON.stringify({ target: username, from, code: this.shareCode?.toString() }),
                (err) => {
                    if (err) {
                        vscode.window.showErrorMessage("Error sending code. Please, try opening another view to refresh the context.");
                        console.error(err);
                    }
                    // TODO: Se podría incluir un botón que llame a initializeExtension, y que así se recargue todo
                });
        }
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
        for (let i = 0; i < this.data.length; i++) {
            // tables += await this.generateHTMLTableFromCourse(this._courses[i]);
            const text = await this.generateHTMLTableFromCourse(this.data[i].course, this.data[i].users, i);
            tables += text;
        }

        let searchbar: string = "<datalist id='usernames'>\n";
        this.users.forEach((username) => {
            searchbar = searchbar + `<option value='${username}'>`;
        });
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

    private async generateHTMLTableFromCourse(course: Course, users: User[], courseIndex: number): Promise<string> {
        let rows = "";
        if (!users.length) { return ""; }
        users
            .forEach((user) => {
                rows = rows + "<tr>\n";
                rows = rows + "<td>" + (user.name ? (user.name) : "") + " " + (user.lastName ? (user.lastName) : "") + "</td>\n";
                rows = rows + "<td class='username'>" + (user.username ? (user.username) : "") + "</td>\n";
                rows = rows + "<td>" + (user.roles ? user.roles.reduce((ac, r) => ac + r.roleName.replace("ROLE_", "") + " | ", "").replace(/\s\|\s$/, "") : "") + "</td>\n";
                rows = rows + "<td><button class='liveshare-send'>Send</button></td>\n";
                rows = rows + "</tr>\n";

            });

        const text = `<br/>
        <h3>Users in ${course.name}</h3>
        <table data-courseIndex="${courseIndex}">
            <tr>
                <th>Full name
                    <span class="sorter-ls ${this.sortAsc ? "active" : ""}">
                        <span></span>
                        <span></span>
                    </span>
                </th>
                <th>Username
                    <span class="sorter-ls ${this.sortAsc ? "active" : ""}">
                        <span></span>
                        <span></span>
                    </span>
                </th>
                <th>Role
                    <span class="sorter-ls ${this.sortAsc ? "active" : ""}">
                        <span></span>
                        <span></span>
                    </span>
                </th>
                <th>Liveshare</th>
            </tr>
            ${rows}
        </table>`;

        return text;
    }
}
