import { AxiosResponse } from "axios";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { WebSocketV4TConnection } from "../../client/WebSocketV4TConnection";
import { Course } from "../../model/serverModel/course/Course";
import { Exercise } from "../../model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../model/serverModel/exercise/ExerciseUserInfo";

export class DashboardWebview {
    public static currentPanel: DashboardWebview | undefined;

    public static readonly viewType = "v4tdashboard";

    public static readonly resourcesPath = __dirname.includes(path.sep + "out") ?
        path.join(__dirname, "..", "resources", "dashboard") :
        path.join(__dirname, "..", "..", "..", "resources", "dashboard");

    public static show(euis: ExerciseUserInfo[], course: Course, exercise: Exercise) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (DashboardWebview.currentPanel) {
            DashboardWebview.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const dashboardName = exercise.name;

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

        DashboardWebview.currentPanel = new DashboardWebview(panel, dashboardName, euis, course, exercise);
    }

    public readonly panel: vscode.WebviewPanel;

    private ws: WebSocketV4TConnection;

    private readonly _dashboardName: string;
    private _euis: ExerciseUserInfo[];
    // private _reloadInterval: NodeJS.Timeout | undefined;
    private lastUpdatedInterval: NodeJS.Timeout;
    private _exercise: Exercise;
    private sortAsc: boolean;

    private constructor(panel: vscode.WebviewPanel, dashboardName: string, euis: ExerciseUserInfo[], course: Course, exercise: Exercise) {
        this.panel = panel;
        this._dashboardName = dashboardName;
        this._euis = euis;
        this._exercise = exercise;
        this.sortAsc = false;

        // Set the webview's initial html content
        this.updateHtml();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => {
            global.clearInterval(this.lastUpdatedInterval);
            // global.clearInterval(this._reloadInterval);
            this.ws.close();
            this.dispose();
        });

        // Update the content based on view changes
        this.panel.onDidChangeViewState(
            (e) => {
                if (this.panel.visible) {
                    this.updateHtml();
                }
            },
        );
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "reload": {
                    this.reloadData();
                    break;
                }
                // case "changeReloadTime": {
                //     // reloadTime comes in seconds
                //     const reloadTime = message.reloadTime;
                //     if (this._reloadInterval) {
                //         global.clearInterval(this._reloadInterval);
                //         this._reloadInterval = undefined;
                //     }
                //     if (reloadTime > 0) {
                //         this._reloadInterval = global.setInterval(() => {
                //             this.reloadData();
                //         }, reloadTime * 1000);
                //     }
                //     break;
                // }
                case "goToWorkspace": {
                    await vscode.commands.executeCommand("vscode4teaching.getstudentfiles", course.name, exercise).then(async () => {
                        const workspaces = vscode.workspace.workspaceFolders;
                        if (workspaces) {
                            const wsF = vscode.workspace.workspaceFolders?.find((e) => e.name === message.username);
                            if (wsF) {
                                const doc1 = await vscode.workspace.openTextDocument(await this.findLastModifiedFile(wsF, message.lastMod));
                                // let doc1 = await vscode.workspace.openTextDocument(await this.findMainFile(wsF));
                                await vscode.window.showTextDocument(doc1);
                            }
                        }
                    });
                    break;
                }

                case "diff": {
                    await vscode.commands.executeCommand("vscode4teaching.getstudentfiles", course.name, exercise).then(async () => {
                        const workspaces = vscode.workspace.workspaceFolders;
                        if (workspaces) {
                            const wsF = vscode.workspace.workspaceFolders?.find((e) => e.name === message.username);
                            if (wsF) {
                                await vscode.commands.executeCommand("vscode4teaching.diff", await this.findLastModifiedFile(wsF, message.lastMod));
                            }
                        }
                    });
                    break;
                }

                case "sort": {
                    this.sortAsc = message.desc;
                    const weight = this.sortAsc ? 1 : -1;
                    switch (message.column) {
                        case 0: {
                            this._euis.sort((a, b) => {

                                const aname = ((a.user.name) ? a.user.name : "") + " " + ((a.user.lastName) ? a.user.lastName : "");
                                const bname = ((b.user.name) ? b.user.name : "") + " " + ((b.user.lastName) ? b.user.lastName : "");

                                if (aname > bname) {
                                    return -1 * weight;
                                } else if (a.user.username < b.user.username) {
                                    return 1 * weight;
                                } else { return 0; }
                            });
                            break;
                        }
                        case 1: {
                            this._euis.sort((a, b) => {
                                if (a.user.username > b.user.username) {
                                    return -1 * weight;
                                } else if (a.user.username < b.user.username) {
                                    return 1 * weight;
                                } else { return 0; }
                            });
                            break;
                        }
                        case 2: {
                            this._euis.sort((a, b) => {
                                if (a.status > b.status) {
                                    return -1 * weight;
                                } else if (a.user.username < b.user.username) {
                                    return 1 * weight;
                                } else { return 0; }
                            });
                            break;
                        }
                        case 3: {
                            this._euis.sort((a, b) => {
                                if (a.updateDateTime > b.updateDateTime) {
                                    return -1 * weight;
                                } else if (a.updateDateTime < b.updateDateTime) {
                                    return 1 * weight;
                                } else { return 0; }
                            });
                        }
                    }
                    this.updateHtml();
                    break;
                }
            }
        });
        this.ws = new WebSocketV4TConnection("dashboard-refresh", (dataStringified) => {
            if (dataStringified) {
                const { handle } = JSON.parse(dataStringified.data);
                if (handle === "refresh") {
                    this.reloadData();
                }
            }
        });
        // Only used to refresh elapsed times
        this.lastUpdatedInterval = global.setInterval(this.updateLastDate, 1000, this.panel, this._euis, this.getElapsedTime);
    }

    public dispose() {
        DashboardWebview.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();
    }

    private updateLastDate(panel: vscode.WebviewPanel, euis: ExerciseUserInfo[], getElapsedTime: (pastDate: Date) => string) {
        const message: { [key: string]: string } = {};
        for (const eui of euis) {
            message["user-lastmod-" + eui.user.id] = getElapsedTime(eui.updateDateTime);
        }
        panel.webview.postMessage(message);
    }

    private async findLastModifiedFile(folder: vscode.WorkspaceFolder, fileRoute: string) {
        if (fileRoute === "null") { return this.findMainFile(folder); }

        const fileRegex = /^\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)$/;
        const regexResults = fileRegex.exec(fileRoute);
        if (regexResults && regexResults.length > 1) {
            const match: vscode.Uri[] = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, regexResults[1]));
            if (match.length === 1) {
                return match[0];
            }
        }
        return this.findMainFile(folder);
    }

    private async findMainFile(folder: vscode.WorkspaceFolder) {
        const patterns = ["readme.*", "readme", "Main.*", "main.*", "index.html", "*"];
        let matches: vscode.Uri[] = [];
        let i = 0;
        while (matches.length <= 0 && i < patterns.length) {
            const file = new vscode.RelativePattern(folder, patterns[i++]);
            matches = (await vscode.workspace.findFiles(file));
        }
        if (matches.length <= 0) {
            matches = (await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "*")));
        }
        return matches[0];
    }

    private reloadData() {
        APIClient.getAllStudentsExerciseUserInfo(this._exercise.id).then((response: AxiosResponse<ExerciseUserInfo[]>) => {
            console.debug(response);
            this._euis = response.data;
            this.updateHtml();
        }).catch((error) => APIClient.handleAxiosError(error));
    }

    private updateHtml() {
        this.panel.webview.html = this.getHtmlForWebview();
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
        for (const eui of this._euis) {
            rows = rows + "<tr>\n";
            if (eui.user.name && eui.user.lastName) {
                rows = rows + "<td>" + eui.user.name + " " + eui.user.lastName + "</td>\n";
            } else {
                rows = rows + "<td></td>";
            }
            rows = rows + "<td class='username'>" + eui.user.username + "</td>\n";

            switch (eui.status) {
                case 0: {
                    // not started
                    rows = rows + '<td class="not-started-cell">Not started</td>\n';
                    break;
                }
                case 1: {
                    // finished
                    rows = rows + '<td class="finished-cell">Finished</td>\n';
                    break;
                }
                case 2: {
                    // started but not finished
                    rows = rows + '<td class="onprogress-cell">On progress</td>\n';
                    break;
                }
            }
            rows = rows + `<td>`;
            const buttons = `<button data-lastMod = '${eui.lastModifiedFile}' class='workspace-link'>Open</button><button data-lastMod-diff = '${eui.lastModifiedFile}' class='workspace-link-diff'>Diff</button>`;
            rows += eui.lastModifiedFile ? buttons : `Not found`;
            rows = rows + `</td>\n`;
            rows = rows + `<td class='last-modification' id='user-lastmod-${eui.user.id}'>${this.getElapsedTime(eui.updateDateTime)}</td>\n`;
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
            <h1>Exercise dashboard</h1>
            <hr/>
            <!--<div class="reload-options">
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
                -->
                <br/>
                <table>
                    <tr>
                        <th>Full name
                            <span class="sorter ${this.sortAsc ? "active" : ""}">
                                <span></span>
                                <span></span>
                            </span>
                        </th>
                        <th>Username
                            <span class="sorter ${this.sortAsc ? "active" : ""}">
                                <span></span>
                                <span></span>
                            </span>
                        </th>
                        <th>Exercise status
                            <span class="sorter ${this.sortAsc ? "active" : ""}">
                                <span></span>
                                <span></span>
                            </span>
                        </th>
                        <th>Last modified file</th>
                        <th>Last modification
                            <span class="sorter ${this.sortAsc ? "active" : ""}">
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

    private getElapsedTime(pastDateStr: Date) {
        if (!pastDateStr) { return "-"; }
        let elapsedTime = (new Date().getTime() - new Date(pastDateStr).getTime()) / 1000;
        if (elapsedTime < 0) { elapsedTime = 0; }
        let unit = "s";
        if (elapsedTime > 60) {
            elapsedTime /= 60;   // convert to minutes
            if (elapsedTime > 60) {
                elapsedTime /= 60;  // convert to hours
                if (elapsedTime > 24) {
                    elapsedTime /= 24;  // convert to days
                    if (elapsedTime > 365) {
                        elapsedTime /= 365;  // convert to years
                        unit = "yr";
                    } else { unit = "d"; }
                } else { unit = "h"; }
            } else { unit = "min"; }
        }

        return `${Math.floor(elapsedTime)} ${unit}`;
    }
}
