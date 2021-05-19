import { AxiosResponse } from "axios";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { ExerciseUserInfo } from "../../model/serverModel/exercise/ExerciseUserInfo";

export class DashboardWebview {
    public static currentPanel: DashboardWebview | undefined;

    public static readonly viewType = "v4tdashboard";

    public static readonly resourcesPath = __dirname.includes(path.sep + "out" + path.sep) ?
        path.join(__dirname, "..", "..", "..", "..", "resources", "dashboard") :
        path.join(__dirname, "..", "..", "..", "resources", "dashboard");

    public static show(euis: ExerciseUserInfo[], exerciseId: number) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (DashboardWebview.currentPanel) {
            DashboardWebview.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        let dashboardName = "";
        if (euis.length > 0) {
            dashboardName = euis[0].exercise.name;
        }

        const panel = vscode.window.createWebviewPanel(
            DashboardWebview.viewType,
            "V4T Dashboard: " + dashboardName,
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `resources` directory.
                localResourceRoots: [vscode.Uri.file(DashboardWebview.resourcesPath)],
            },
        );

        DashboardWebview.currentPanel = new DashboardWebview(panel, dashboardName, euis, exerciseId);
    }

    public readonly panel: vscode.WebviewPanel;

    private readonly _dashboardName: string;
    private _euis: ExerciseUserInfo[];
    private _reloadInterval: NodeJS.Timeout | undefined;
    private _exerciseId: number;
    private sortAsc: boolean;

    private constructor(panel: vscode.WebviewPanel, dashboardName: string, euis: ExerciseUserInfo[], exerciseId: number) {
        this.panel = panel;
        this._dashboardName = dashboardName;
        this._euis = euis;
        this._exerciseId = exerciseId;
        this.sortAsc = false;

        // Set the webview's initial html content
        this.panel.webview.html = this.getHtmlForWebview();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => this.dispose());

        // Update the content based on view changes
        this.panel.onDidChangeViewState(
            (e) => {
                if (this.panel.visible) {
                    this.panel.webview.html = this.getHtmlForWebview();
                }
            },
        );
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "reload": {
                    this.reloadData();
                    break;
                }
                case "changeReloadTime": {
                    // reloadTime comes in seconds
                    const reloadTime = message.reloadTime;
                    if (this._reloadInterval) {
                        global.clearInterval(this._reloadInterval);
                        this._reloadInterval = undefined;
                    }
                    if (reloadTime > 0) {
                        this._reloadInterval = global.setInterval(() => {
                            this.reloadData();
                        }, reloadTime * 1000);
                    }
                    break;
                }
                case "goToWorkspace": {
                    let workspaces = vscode.workspace.workspaceFolders;
                    if (workspaces) {
                        let wsF = vscode.workspace.workspaceFolders?.find(e => e.name === message.username);
                        if (wsF) {
                            let doc1 = await vscode.workspace.openTextDocument(await this.findMainFile(wsF));
                            await vscode.window.showTextDocument(doc1);
                        }
                    }
                }

                case "sort": {
                    this.sortAsc = message.desc;
                    let weight = this.sortAsc ? 1 : -1;
                    switch (message.column) {
                        case 0: {
                            this._euis.sort(function (a, b) {

                                const aname = ((a.user.name) ? a.user.name : '') + ' ' + ((a.user.lastName) ? a.user.lastName : '');
                                const bname = ((b.user.name) ? b.user.name : '') + ' ' + ((b.user.lastName) ? b.user.lastName : '');

                                if (aname > bname)
                                    return -1 * weight;
                                else if (a.user.username < b.user.username)
                                    return 1 * weight;
                                else return 0;
                            })
                            break;
                        }
                        case 1: {
                            this._euis.sort(function (a, b) {
                                if (a.user.username > b.user.username)
                                    return -1 * weight;
                                else if (a.user.username < b.user.username)
                                    return 1 * weight;
                                else return 0;
                            })
                            break;
                        }
                        case 2: {
                            this._euis.sort(function (a, b) {
                                if (a.status > b.status)
                                    return -1 * weight;
                                else if (a.user.username < b.user.username)
                                    return 1 * weight;
                                else return 0
                            })
                            break;
                        }
                    }
                    this.panel.webview.html = this.getHtmlForWebview();
                    break;
                }
            }
        });
    }

    private async findMainFile(folder: vscode.WorkspaceFolder) {
        const patterns = ['readme.*', 'readme', 'Main.*', 'main.*', 'index.html', '*']
        let matches: vscode.Uri[] = [];
        let i = 0;
        while (matches.length <= 0 && i < patterns.length) {
            let file = new vscode.RelativePattern(folder, patterns[i++]);
            matches = (await vscode.workspace.findFiles(file));
        }
        // if (matches.length <= 0)
        //     matches = (await vscode.workspace.findFiles(folder, '*'))
        return matches[0];
    }

    public dispose() {
        DashboardWebview.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();
    }

    private reloadData() {
        APIClient.getAllStudentsExerciseUserInfo(this._exerciseId).then((response: AxiosResponse<ExerciseUserInfo[]>) => {
            this._euis = response.data;
            this.panel.webview.html = this.getHtmlForWebview();
        }).catch((error) => APIClient.handleAxiosError(error));
    }

    private getHtmlForWebview() {
        // Local path to main script run in the webview
        const scriptPath = vscode.Uri.file(
            path.join(DashboardWebview.resourcesPath, "dashboard.js"),
        );
        // And the uri we use to load this script in the webview
        const scriptUri = this.panel.webview.asWebviewUri(scriptPath);

        // Local path to styles
        const cssPath = vscode.Uri.file(
            path.join(DashboardWebview.resourcesPath, "dashboard.css"),
        );

        // Styles uri
        const cssUri = this.panel.webview.asWebviewUri(cssPath);

        // Transform EUIs to html table data
        let rows: string = "";
        // for (const eui of this._euis) {
        for (let i = 0; i < this._euis.length; i++) {
            let eui = this._euis[i];

            rows = rows + "<tr>\n";
            if (eui.user.name && eui.user.lastName) {
                rows = rows + "<td>" + eui.user.name + " " + eui.user.lastName + "</td>\n";
            } else {
                rows = rows + "<td></td>";
            }
            rows = rows + "<td class='username'>" + eui.user.username + "</td>\n";

            switch (eui.status) {
                case 0: {
                    //not started
                    rows = rows + '<td class="not-started-cell">Not started</td>\n';
                    break;
                }
                case 1: {
                    //finished
                    rows = rows + '<td class="finished-cell">Finished</td>\n';
                    break;
                }
                case 2: {
                    //started but not finished
                    rows = rows + '<td class="onprogress-cell">On progress</td>\n';
                    break;
                }
            }
            rows = rows + `<td>`
            let f = vscode.workspace.workspaceFolders?.find(folder => folder.name === eui.user.username)
            rows += f ? `<button class='workspace-link'>Open</button>` : `Not found`;
            rows = rows + `</td>\n`
            rows = rows + `<td class='last-modification'>${this.getElapsedTime(new Date(eui.updateDateTime))}</td>\n`;
            rows = rows + "</tr>\n";

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
                <div class="reload-options">
                    <label for="time-reload">Reload every: </label>
                    <br/>
                    <select id="time-reload">
                        <option value="0" selected>Never</option>
                        <option value="5">5 seconds</option>
                        <option value="30">30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                    </select>
                    <button id="button-reload">Reload</button>
                </div>
                <br/>
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
                        <th>Exercise status 
                            <span class="sorter ${this.sortAsc ? 'active' : ''}">
                                <span></span>
                                <span></span>
                            </span>
                        </th>
                        <th>Open in Workspace</th>
                        <th>Last modification 
                            <span class="sorter ${this.sortAsc ? 'active' : ''}">
                                <span></span>
                                <span></span>
                            </span>
                        </th>
                    </tr>
                    ${rows}
                </table>
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

    private getElapsedTime(pastDate: Date) {
        let elapsedTime = (new Date().getTime() - pastDate.getTime()) / 1000;
        let unit = ' s';
        if (elapsedTime > 60) {
            elapsedTime /= 60   //convert to minutes
            if (elapsedTime > 60) {
                elapsedTime /= 60;  //convert to hours
                if (elapsedTime > 24) {
                    elapsedTime /= 24;  //convert to days
                    if (elapsedTime > 365) {
                        elapsedTime /= 365;  //convert to years
                        unit =  ' yr'
                    }
                    else unit = ' d'
                } else unit = ' h';
            } else unit = ' min';
        };

        return `${Math.floor(elapsedTime)}${unit}`
    }

}
