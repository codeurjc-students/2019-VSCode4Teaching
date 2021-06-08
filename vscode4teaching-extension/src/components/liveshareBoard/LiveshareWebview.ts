import { AxiosResponse } from "axios";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { Course } from "../../model/serverModel/course/Course";
import { User } from "../../model/serverModel/user/User";
import { Role } from "../../model/serverModel/user/Role";

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

    private constructor(panel: vscode.WebviewPanel, dashboardName: string, courses: Course[]) {
        this.panel = panel;
        this._dashboardName = dashboardName;
        this._courses = courses;
        this.sortAsc = false;

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
            }
        });
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
            path.join(LiveshareWebview.resourcesPath, "dashboard.js"),
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
        for (let i = 0; i < this._courses.length; i++) {
            tables += await this.generateHTMLTableFromCourse(this._courses[i]);
        }

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
                <h1>Users in courses</h1>
                <hr/>
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

    private async generateHTMLTableFromCourse(course: Course): Promise<string> {
        let rows = "";
        // (await APIClient.getUsersInCourse(course.id).then(
        //     data => {
        //         data.data.forEach(user => {
        //             rows = rows + "<tr>\n";
        //             rows = rows + "<td>" + (user.name ? (user.name) : "") + " " + (user.lastName ? (user.lastName) : "") + "</td>\n";
        //             rows = rows + "<td>" + (user.username ? (user.username) : "") + "</td>\n";
        //             rows = rows + "<td>" + (user.roles ? user.roles.reduce((ac, r) => ac + r.roleName.replace("ROLE_", "") + " | ", "").replace(/\s\|\s$/, "") : "") + "</td>\n";
        //             rows = rows + "<td><button class='liveshare-send'>Send</button></td>\n";
        //             rows = rows + "</tr>\n";
        //         });
        //     }
        // ).catch(e => console.error(e));

        (await APIClient.getUsersInCourse(course.id)).data.forEach(user => {
            rows = rows + "<tr>\n";
            rows = rows + "<td>" + (user.name ? (user.name) : "") + " " + (user.lastName ? (user.lastName) : "") + "</td>\n";
            rows = rows + "<td>" + (user.username ? (user.username) : "") + "</td>\n";
            rows = rows + "<td>" + (user.roles ? user.roles.reduce((ac, r) => ac + r.roleName.replace("ROLE_", "") + " | ", "").replace(/\s\|\s$/, "") : "") + "</td>\n";
            rows = rows + "<td><button class='liveshare-send'>Send</button></td>\n";
            rows = rows + "</tr>\n";
        });

        const text = `<br/>
        <h3>Users in ${course.name}</h3>
        <table>
            <tr>
                <th>Full name 
                    <span class="sorter ${this.sortAsc ? 'active' : ''}">
                        <span></span>
                        <span></span>
                    </span>
                </th>
                <th>Username 
                    <span class="sorter ${this.sortAsc ? 'active' : ''}">
                        <span></span>
                        <span></span>
                    </span>
                </th>
                <th>Role 
                    <span class="sorter ${this.sortAsc ? 'active' : ''}">
                        <span></span>
                        <span></span>
                    </span>
                </th>
                <th>Liveshare</th>
            </tr>
            ${rows}
        </table>`

        return text;
    }

}
