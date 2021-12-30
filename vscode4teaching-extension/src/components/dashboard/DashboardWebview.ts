import { AxiosResponse } from "axios";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { WebSocketV4TConnection } from "../../client/WebSocketV4TConnection";
import { Course } from "../../model/serverModel/course/Course";
import { Exercise } from "../../model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../model/serverModel/exercise/ExerciseUserInfo";
import { OpenQuickPick } from "./OpenQuickPick";

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
        const dashboardViewName = course.name + " - " + exercise.name;

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

        DashboardWebview.currentPanel = new DashboardWebview(panel, dashboardName, dashboardViewName, euis, course, exercise);
    }

    public readonly panel: vscode.WebviewPanel;

    private ws: WebSocketV4TConnection;

    private readonly _dashboardName: string;
    private readonly _dashboardViewName: string;
    private _euis: ExerciseUserInfo[];
    // private _reloadInterval: NodeJS.Timeout | undefined;
    private lastUpdatedInterval: NodeJS.Timeout;
    private _exercise: Exercise;
    private sortAsc: boolean;
    private hiddenStudentNames: boolean;

    private constructor(panel: vscode.WebviewPanel, dashboardName: string, dashboardViewName: string, euis: ExerciseUserInfo[], course: Course, exercise: Exercise) {
        this.panel = panel;
        this._dashboardName = dashboardName;
        this._dashboardViewName = dashboardViewName;
        this._euis = euis;
        this._exercise = exercise;
        this.sortAsc = false;
        this.hiddenStudentNames = false;

        // Set the webview's initial html content
        this.updateHtml();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => {
            global.clearInterval(this.lastUpdatedInterval);
            // if (this._reloadInterval !== undefined) {
            //     global.clearInterval(this._reloadInterval);
            // }
            this.ws.close();
            this.dispose();
        });

        // Update the content based on view changes
        this.panel.onDidChangeViewState((e) => {
                if (this.panel.visible) {
                    this.updateHtml();
                }
            }
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
                    this.showQuickPick(message.username, course, exercise).then(async (filePath) => {
                        if (filePath !== undefined) {
                            const doc1 = await vscode.workspace.openTextDocument(filePath);
                            await vscode.window.showTextDocument(doc1);
                        }
                        this.panel.webview.postMessage({ type: "openDone", username: message.username });
                    }).catch((err) => {
                        console.error(err);
                        vscode.window.showErrorMessage(err);
                    });
                    break;
                }

                case "diff": {
                    this.showQuickPick(message.username, course, exercise).then(async (filePath) => {
                        if (filePath !== undefined) {
                            await vscode.commands.executeCommand("vscode4teaching.diff", filePath);
                        }
                        this.panel.webview.postMessage({ type: "openDone", username: message.username });
                    }).catch((err) => {
                        console.error(err);
                        vscode.window.showErrorMessage(err);
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

                case "changeVisibilityStudentsNames": {
                    this.hiddenStudentNames = message.value;
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
        this.lastUpdatedInterval = global.setInterval(this.updateLastDate.bind(this), 1000);
    }

    public dispose() {
        DashboardWebview.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();
    }

    private updateLastDate() {
        const message: { [key: string]: string } = {};
        for (const eui of this._euis) {
            message["user-lastmod-" + eui.user.id] = this.getElapsedTime(eui.updateDateTime);
        }
        this.panel.webview.postMessage({ type: "updateDate", update: message });
    }

    private async findLastModifiedFile(folder: vscode.WorkspaceFolder, fileRoute: string): Promise<{ uri: vscode.Uri, relativePath: string }> {
        if (fileRoute === "null") { return this.findMainFile(folder); }

        const fileRegex = /^\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)$/;
        const regexResults = fileRegex.exec(fileRoute);
        if (regexResults && regexResults.length > 1) {
            const match: vscode.Uri[] = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, regexResults[1]));
            if (match.length === 1) {
                return { uri: match[0], relativePath: regexResults[1] };
            }
        }
        return this.findMainFile(folder);
    }

    private async findMainFile(folder: vscode.WorkspaceFolder): Promise<{ uri: vscode.Uri, relativePath: string }> {
        const patterns = ["readme.*", "readme", "Main.*", "main.*", "index.html", "*"];
        let matches: vscode.Uri[] = [];
        let i = 0;
        let pattern = "";
        while (matches.length <= 0 && i < patterns.length) {
            pattern = patterns[i++];
            const file = new vscode.RelativePattern(folder, pattern);
            matches = (await vscode.workspace.findFiles(file));
        }
        if (matches.length <= 0) {
            matches = (await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "*")));
        }
        return { uri: matches[0], relativePath: pattern };
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
            if (!this.hiddenStudentNames) {
                if (eui.user.name && eui.user.lastName) {
                    rows = rows + "<td>" + eui.user.name + " " + eui.user.lastName + "</td>\n";
                } else {
                    rows = rows + "<td></td>";
                }
            }
            rows = rows + "<td>student_" + eui.id + "</td>\n";
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
            rows = rows + `<td class="button-col">`;
            const buttons = `<button class='workspace-link'>Open</button><button class='workspace-link-diff'>Diff</button>`;
            rows += buttons;
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
                <h1>VSCode4Teaching Dashboard</h1>
                <h2>${this._dashboardViewName}</h2>
                <div class="reload-options">
                    <div class="option">
                        <div class="name">Hide student's names</div>
                        <label class="switch">
                            <input type="checkbox" name="hideStudentNames" id="hideStudentNames"${(this.hiddenStudentNames) ? ' checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <hr/>
                <table>
                    <tr>
                    ${(!this.hiddenStudentNames) ? 
                        `<th>Full name
                            <span class="sorter ${this.sortAsc ? "active" : ""}">
                                <span></span>
                                <span></span>
                            </span>
                        </th>`
                    : '' }
                        <th>Exercise folder
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

    private getElapsedTime(pastDateStr: string) {
        if (!pastDateStr) { return "-"; }
        pastDateStr += "Z";
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

    /**
     * Show quick pick with all modified files in EUIs for each user
     * @param username string username
     * @param course Course course
     * @param exercise Exercise exercise
     * @returns Thenable<string|undefined> the selected file
     */
    private async showQuickPick(username: string, course: Course, exercise: Exercise): Promise<vscode.Uri | undefined> {
        // Download most recent files
        await vscode.commands.executeCommand("vscode4teaching.getstudentfiles", course.name, exercise);
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
            title: "Getting modified files...",
        }, (progress, token) => this.buildQuickPickItems(username))
        .then(async (result: OpenQuickPick[]) => {
            if (result) {
                const selection = await this.showQuickPickRecursive(result);
                if (selection) {
                    return selection;
                }
            }
        });
    }

    private async buildQuickPickItems(username: string): Promise<OpenQuickPick[]> {
        // Find all modified files URIs (paths)
        const workspaces = vscode.workspace.workspaceFolders;
        if (workspaces) {
            const wsF = workspaces.find((e) => e.name === username);
            if (wsF) {
                const euis = this._euis.filter((eui) => eui.user.username === username);
                const uris: vscode.Uri[] = [];
                const relativePaths: string[] = [];
                if (euis.length > 0) {
                    const eui = euis[0];
                    if (eui.modifiedFiles && eui.modifiedFiles.length > 0) {
                        for (const fileName of eui.modifiedFiles) {
                            const lastFile = await this.findLastModifiedFile(wsF, fileName);
                            if (lastFile.uri) {
                                relativePaths.push(lastFile.relativePath);
                                uris.push(lastFile.uri);
                            }
                        }
                    } else {
                        vscode.window.showWarningMessage(`No modified files for ${username}`);
                    }
                }
                if (uris.length > 0) {
                    // Create directory tree object from relative paths with relative path and children
                    // Result is array of objects with keys "name" with the name of the file and "children" if the file is a directory listing its children
                    const result: OpenQuickPick[] = [];
                    relativePaths.forEach((relPath, index) => {
                        result.push(new OpenQuickPick(relPath, [], undefined, false, uris[index]));
                    });
                    return result;
                } else {
                    throw new Error("No files found for student " + username);
                }
            } else {
                throw new Error("No files found for student " + username);
            }
        } else {
            throw new Error("The exercise's workspace is not open.");
        }
    }

    // Add parent object as property to children in the tree with key "children" as array of objects
    private addParentsToChildren(parents: OpenQuickPick[], children: OpenQuickPick[]) {
        children.forEach((child) => {
            child.parents = parents;
            if (child.children) {
                this.addParentsToChildren(children, child.children);
            }
        });
    }

    // Combines parent and child as a single path if there is only one child and it is a directory
    private shortenPaths(item: OpenQuickPick) {
        if ((item.children.length === 1) && (item.children[0].children.length > 0)) {
            const child = item.children[0];
            item.name = item.name + "/" + child.name;
            item.children = child.children;
            this.shortenPaths(item);
        } else {
            for (const child of item.children) {
                this.shortenPaths(child);
            }
        }
    }

    // Recursive show quick pick with files given the file or directory name and an array of children
    private async showQuickPickRecursive(recursiveFiles: OpenQuickPick[]): Promise<vscode.Uri | undefined> {
        if (!recursiveFiles[0].isGoBackButton && recursiveFiles[0].parents && recursiveFiles[0].parents.length > 0) {
            recursiveFiles.unshift(new OpenQuickPick("..", [], recursiveFiles[0].parents, true));
        }
        const selection = await vscode.window.showQuickPick(recursiveFiles, {
            placeHolder: "Choose a file to open",
        });
        if (selection) {
            if (selection.parents && selection.label === "..") {
                return this.showQuickPickRecursive(selection.parents);
            }
            if (selection.children && selection.children.length > 0) {
                return this.showQuickPickRecursive(selection.children);
            } else {
                console.log(selection);
                return selection.fullPath;
            }
        }
    }
}
