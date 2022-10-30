import { AxiosResponse } from "axios";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { WebSocketV4TConnection } from "../../client/WebSocketV4TConnection";
import { Course } from "../../model/serverModel/course/Course";
import { Exercise } from "../../model/serverModel/exercise/Exercise";
import { ExerciseStatus } from "../../model/serverModel/exercise/ExerciseStatus";
import { ExerciseUserInfo } from "../../model/serverModel/exercise/ExerciseUserInfo";
import { v4tLogger } from "../../services/LoggerService";
import { CoursesProvider } from "../courses/CoursesTreeProvider";
import { OpenQuickPick } from "./OpenQuickPick";

export class DashboardWebview {
    public static currentPanel: DashboardWebview | undefined;

    public static readonly viewType = "v4tdashboard";

    public static readonly resourcesPath = __dirname.includes(path.sep + "out") ? path.join(__dirname, "..", "resources", "dashboard") : path.join(__dirname, "..", "..", "..", "resources", "dashboard");

    public static show(euis: ExerciseUserInfo[], course: Course, exercise: Exercise, fullMode: boolean) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it
        if (DashboardWebview.currentPanel) {
            DashboardWebview.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const dashboardTitle = exercise.name;
        const dashboardDisplayInformation = { h1: course.name, h2: exercise.name };

        const panel = vscode.window.createWebviewPanel(DashboardWebview.viewType, "V4T Dashboard: " + dashboardTitle, column || vscode.ViewColumn.One, {
            // Enable javascript in the webview
            enableScripts: true,

            // And restrict the webview to only loading content from our extension's `resources` directory.
            localResourceRoots: [vscode.Uri.file(DashboardWebview.resourcesPath)],
        });

        DashboardWebview.currentPanel = new DashboardWebview(panel, dashboardTitle, dashboardDisplayInformation, euis, course, exercise, fullMode);
    }

    public static exists(): boolean {
        return DashboardWebview.currentPanel !== undefined;
    }

    public readonly panel: vscode.WebviewPanel;

    private ws: WebSocketV4TConnection;

    private readonly _dashboardTitle: string;
    private readonly _dashboardDisplayInformation: { h1: string, h2: string };
    private _euis: ExerciseUserInfo[];
    private updateGeneralStatisticsInterval: NodeJS.Timeout;
    private updateStudentsProgressInterval: NodeJS.Timeout;
    private readonly _course: Course;
    private _exercise: Exercise;
    private sortAsc: boolean;
    private hiddenStudentNames: boolean;
    private fullMode: boolean;

    private constructor(panel: vscode.WebviewPanel, dashboardTitle: string, dashboardDisplayInformation: { h1: string, h2: string }, euis: ExerciseUserInfo[], course: Course, exercise: Exercise, fullMode: boolean) {
        this.panel = panel;
        this._dashboardTitle = dashboardTitle;
        this._dashboardDisplayInformation = dashboardDisplayInformation;
        this._euis = euis;
        this._course = course;
        this._exercise = exercise;
        this.sortAsc = false;
        this.hiddenStudentNames = true;
        this.fullMode = fullMode;

        // Set the webview's initial HTML content
        this.updateHTML();

        // Set up listeners
        // 1. Listen for panel's disposal
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => {
            global.clearInterval(this.updateGeneralStatisticsInterval);
            global.clearInterval(this.updateStudentsProgressInterval);
            this.ws.close();
            this.dispose();
        });

        // 2. Listen for attributes' changes
        // Update the content based on view changes
        this.panel.onDidChangeViewState((e) => {
            if (this.panel.visible) {
                this.updateHTML();
            }
        });

        // 3. Listen for incoming messages
        this.panel.webview.onDidReceiveMessage(async message => this.handleReceivedMessages(message));

        // Set up WebSocket connection to backend
        this.ws = new WebSocketV4TConnection("dashboard-refresh", (dataStringified) => {
            if (dataStringified) {
                const { handle } = JSON.parse(dataStringified.data);
                if (handle === "refresh") {
                    this.reloadData();
                }
            }
        });

        // Set up re-generation of elapsed times
        this.updateGeneralStatisticsInterval = global.setInterval(this.updateNumberModificationsGeneralStatisticsTimes.bind(this), 1000);
        this.updateStudentsProgressInterval = global.setInterval(this.updateStudentsProgressTimes.bind(this), 1000);
    }

    private onMessageGoToWorkspace = (message: any) => {
        this.showQuickPick(message.username, this._course, this._exercise, message.eui_id)
            .then(async (filePath) => {
                if (filePath !== undefined) {
                    const doc1 = await vscode.workspace.openTextDocument(filePath);
                    await vscode.window.showTextDocument(doc1);
                }
                this.panel.webview.postMessage({ type: "openDone", username: message.username });
            })
            .catch((err) => {
                v4tLogger.error(err);
                vscode.window.showErrorMessage(err);
            });
    };

    private onMessageDiff = (message: any) => {
        this.showQuickPick(message.username, this._course, this._exercise, message.eui_id)
            .then(async (filePath) => {
                if (filePath !== undefined) {
                    await vscode.commands.executeCommand("vscode4teaching.diff", filePath);
                }
                this.panel.webview.postMessage({ type: "openDone", username: message.username });
            })
            .catch((err) => {
                v4tLogger.error(err);
                vscode.window.showErrorMessage(err);
            });
    };

    private onMessageSort = (message: any) => {
        this.sortAsc = message.desc;
        const weight = this.sortAsc ? 1 : -1;
        switch (message.column) {
            case "fullName": {
                this._euis.sort((a, b) => {
                    const aname = (a.user.name ? a.user.name : "") + " " + (a.user.lastName ? a.user.lastName : "");
                    const bname = (b.user.name ? b.user.name : "") + " " + (b.user.lastName ? b.user.lastName : "");

                    if (aname > bname) {
                        return -1 * weight;
                    } else if (aname < bname) {
                        return 1 * weight;
                    } else {
                        return 0;
                    }
                });
                break;
            }
            case "exerciseFolder": {
                this._euis.sort((a, b) => {
                    const adirectory = "student_" + a.id;
                    const bdirectory = "student_" + b.id;
                    if (adirectory > bdirectory) {
                        return -1 * weight;
                    } else if (adirectory < bdirectory) {
                        return 1 * weight;
                    } else {
                        return 0;
                    }
                });
                break;
            }
            case "status": {
                this._euis.sort((a, b) => {
                    if (a.status > b.status) {
                        return -1 * weight;
                    } else if (a.status < b.status) {
                        return 1 * weight;
                    } else {
                        return 0;
                    }
                });
                break;
            }
            case "lastModification": {
                this._euis.sort((a, b) => {
                    if (a.updateDateTime > b.updateDateTime) {
                        return -1 * weight;
                    } else if (a.updateDateTime < b.updateDateTime) {
                        return 1 * weight;
                    } else {
                        return 0;
                    }
                });
            }
        }
        this.updateHTML();
    };

    private onMessagePublishSolution = () => {
        if (this._exercise.includesTeacherSolution) {
            this._exercise.solutionIsPublic = true;
            APIClient.editExercise(this._exercise.id, this._exercise)
                     .then(ex => {
                         this._exercise = ex.data;
                         this.updateHTML();
                         CoursesProvider.triggerTreeReload();
                         vscode.window.showInformationMessage("The solution was published to students successfully.");
                     })
                     .catch(err => {
                         APIClient.handleAxiosError(err);
                         vscode.window.showErrorMessage("The solution could not be published.");
                     });
        }
    };

    private onMesssageAllowEditionAfterSolutionDownloaded = () => {
        if (this._exercise.includesTeacherSolution) {
            this._exercise.allowEditionAfterSolutionDownloaded = !this._exercise.allowEditionAfterSolutionDownloaded;
            APIClient.editExercise(this._exercise.id, this._exercise)
                     .then(ex => {
                         this._exercise = ex.data;
                         this.updateHTML();
                         CoursesProvider.triggerTreeReload();
                         vscode.window.showInformationMessage(`Edition after downloading solution was ${ this._exercise.allowEditionAfterSolutionDownloaded ? "enabled" : "disabled" }.\nThis parameter can be changed while solution is not published to students.`);
                     })
                     .catch(err => {
                         APIClient.handleAxiosError(err);
                         vscode.window.showErrorMessage("This parameter could not be changed.");
                     })
        }
    };

    private async handleReceivedMessages(message: any) {
        switch (message.type) {
            case "reload": {
                this.reloadData();
                break;
            }
            case "goToWorkspace": {
                this.onMessageGoToWorkspace(message);
                break;
            }
            case "diff": {
                this.onMessageDiff(message);
                break;
            }

            case "sort": {
                this.onMessageSort(message);
                break;
            }

            case "changeVisibilityStudentsNames": {
                this.hiddenStudentNames = message.value;
                this.updateHTML();
                break;
            }

            case "publishSolution": {
                this.onMessagePublishSolution();
                break;
            }

            case "allowEditionAfterSolutionDownloaded": {
                this.onMesssageAllowEditionAfterSolutionDownloaded();
                break;
            }
        }
    }

    public dispose() {
        DashboardWebview.currentPanel = undefined;
        this.panel.dispose();
    }


    // Periodic modifications
    // 1. Number of modifications performed in a period of time (general statistics' section)
    private getEuisEditedInTheLastNMinutes(minutes: number): number {
        return this._euis.filter(eui =>
            ((new Date().getTime() - new Date(eui.updateDateTime).getTime()) / 60000) < minutes
        ).length;
    }

    private updateNumberModificationsGeneralStatisticsTimes() {
        const message: { [key: string]: string } = {};
        [5, 30, 60, 120].forEach(
            minutes => message[`timeValue${ minutes }`] = this.getEuisEditedInTheLastNMinutes(minutes).toString()
        );
        this.panel.webview.postMessage({ type: "updateGeneralStatistics", content: message });
    }

    // 2. Last modification column of student's progress table
    private updateStudentsProgressTimes() {
        const message: { [key: string]: string } = {};
        for (const eui of this._euis) {
            message["user-lastmod-" + eui.user.id] = this.getElapsedTime(eui.updateDateTime);
        }
        this.panel.webview.postMessage({ type: "updateLastModificationTimes", content: message });
    }


    private async findLastModifiedFile(folder: vscode.WorkspaceFolder, fileRoute: string): Promise<{ uri: vscode.Uri; relativePath: string }> {
        if (fileRoute === "null") {
            return this.findMainFile(folder);
        }

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

    private async findMainFile(folder: vscode.WorkspaceFolder): Promise<{ uri: vscode.Uri; relativePath: string }> {
        const patterns = ["readme.*", "readme", "Main.*", "main.*", "index.html", "*"];
        let matches: vscode.Uri[] = [];
        let i = 0;
        let pattern = "";
        while (matches.length <= 0 && i < patterns.length) {
            pattern = patterns[i++];
            const file = new vscode.RelativePattern(folder, pattern);
            matches = await vscode.workspace.findFiles(file);
        }
        if (matches.length <= 0) {
            matches = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "*"));
        }
        return { uri: matches[0], relativePath: pattern };
    }

    private reloadData() {
        APIClient.getAllStudentsExerciseUserInfo(this._exercise.id)
                 .then((response: AxiosResponse<ExerciseUserInfo[]>) => {
                     this._euis = response.data;
                     this.updateHTML();
                 })
                 .catch((error) => APIClient.handleAxiosError(error));
    }

    private updateHTML() {
        this.panel.webview.html = this.getHTMLForWebview();
    }

    private getHTMLForWebview() {
        // Corresponding URI to embed CSS stylesheet in the webview
        const cssUri = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(DashboardWebview.resourcesPath, "dashboard.css")));

        // Corresponding URI to embed Dashboard script in the webview
        const scriptUri = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(DashboardWebview.resourcesPath, "dashboard.js")));

        // Corresponding URI to embed Chart.js (v3.9.1) script in the webview
        const chartJsUri = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(DashboardWebview.resourcesPath, "chart.js")));

        // Lambda function to return corresponding URI to images
        const imgUri = (imgName: string) => this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(DashboardWebview.resourcesPath, "img", imgName + ".png")));


        // Transform EUIs to HTML table rows
        let rows: string = "";
        for (const eui of this._euis) {
            rows = rows + `<tr data-username="${ eui.user.username }" data-eui="${ eui.id }">\n`;

            if (!this.hiddenStudentNames) {
                if (eui.user.name && eui.user.lastName) {
                    rows = rows + "<td>" + eui.user.name + " " + eui.user.lastName + "</td>\n";
                } else {
                    rows = rows + "<td></td>";
                }
            }
            rows = rows + `<td class="exercise-folder">student_${ eui.id }</td>\n`;
            switch (eui.status) {
                case ExerciseStatus.StatusEnum.NOT_STARTED: {
                    rows = rows + `<td class="not-started-cell"><img src="${ imgUri("exercise_not_started") }" alt="Not started icon" class="status-icon-img"><div>Not started</div></td>\n`;
                    break;
                }
                case ExerciseStatus.StatusEnum.FINISHED: {
                    rows = rows + `<td class="finished-cell"><img src="${ imgUri("exercise_finished") }" alt="Finished icon" class="status-icon-img"><div>Finished</div></td>\n`;
                    break;
                }
                case ExerciseStatus.StatusEnum.IN_PROGRESS: {
                    rows = rows + `<td class="inprogress-cell"><img src="${ imgUri("exercise_in_progress") }" alt="In progress icon" class="status-icon-img"><div>In progress</div></td>\n`;
                    break;
                }
            }
            rows = rows + `<td class="last-modification" id="user-lastmod-${ eui.user.id }">${ this.getElapsedTime(eui.updateDateTime) }</td>\n`;
            if (this.fullMode) {
                rows += `<td class="button-col"><button class="workspace-link-open">Open</button><button class="workspace-link-diff">Diff</button></td>\n`;
            }
            rows = rows + "</tr>\n";
        }

        // Use a nonce to whitelist which scripts can be run
        const nonce = this.getNonce();

        // Return HTML body
        return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${ this.panel.webview.cspSource } https:; script-src 'nonce-${ nonce }'; style-src-elem ${ this.panel.webview.cspSource };">
                    <title>V4T Dashboard: ${ this._dashboardTitle }</title>
                    <link rel="stylesheet" type="text/css" href="${ cssUri }">
                </head>
                <body>
                    <!-- SECTION 1: HEADER -->
                    ${this.fullMode
                        ? ''
                        : `<div class="alert-info"><strong>Preview mode.</strong> Some features, such as downloading student files or reviewing them, are disabled and are only accessible in full mode.</div>`
                    }
                    <h1>${this._dashboardDisplayInformation.h1}</h1>
                    <h2>${this._dashboardDisplayInformation.h2}</h2>

                    <hr>

                    ${ this._euis.length === 0 ? `
                    <div class="alert-info"><strong>Warning</strong>: There are no students registered in this course. Thus, no further information can be displayed about this exercise.</div>
                    ` : `
                    <!-- SECTION 2: GENERAL STATISTICS -->
                    <section class="generalStatistics">
                        <h3>General statistics</h3>
                        <div class="row">
                            <div class="col" id="col-1">
                                <canvas
                                    id="statusChart"
                                    data-notstarted="${ this._euis.filter(eui => eui.status === ExerciseStatus.StatusEnum.NOT_STARTED).length }"
                                    data-inprogress="${ this._euis.filter(eui => eui.status === ExerciseStatus.StatusEnum.IN_PROGRESS).length }"
                                    data-finished="${ this._euis.filter(eui => eui.status === ExerciseStatus.StatusEnum.FINISHED).length }"
                                ></canvas>
                            </div>
                            <div class="col" id="col-2">
                                <div class="rowTotals">
                                    <div class="label">Students in course</div>
                                    <div class="value">${ this._euis.length }</div>
                                </div>
                                <div class="rowStatus">
                                    <div class="status" id="notStartedStatus">
                                        <div class="icon">
                                            <img src="${ imgUri("exercise_not_started") }" alt="Not started icon">
                                        </div>
                                        <div class="info">
                                            <div class="label">Not started</div>
                                            <div class="value">${ this._euis.filter(eui => eui.status === ExerciseStatus.StatusEnum.NOT_STARTED).length }</div>
                                        </div>
                                    </div>
                                    <div class="status" id="inProgressStatus">
                                        <div class="icon">
                                            <img src="${ imgUri("exercise_in_progress") }" alt="In progress icon">
                                        </div>
                                        <div class="info">
                                            <div class="label">In progress</div>
                                            <div class="value">${ this._euis.filter(eui => eui.status === ExerciseStatus.StatusEnum.IN_PROGRESS).length }</div>
                                        </div>
                                    </div>
                                    <div class="status" id="finishedStatus">
                                        <div class="icon">
                                            <img src="${ imgUri("exercise_finished") }" alt="Finished icon">
                                        </div>
                                        <div class="info">
                                            <div class="label">Finished</div>
                                            <div class="value">${ this._euis.filter(eui => eui.status === ExerciseStatus.StatusEnum.FINISHED).length }</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col" id="col-3">
                                <div class="rowTime">
                                    <div class="label">Modifications in the last 5 mins</div>
                                    <div class="value" id="timeValue5">${ this.getEuisEditedInTheLastNMinutes(5) }</div>
                                </div>
                                <div class="rowTime">
                                    <div class="label">Modifications in the last 30 mins</div>
                                    <div class="value" id="timeValue30">${ this.getEuisEditedInTheLastNMinutes(30) }</div>
                                </div>
                                <div class="rowTime">
                                    <div class="label">Modifications in the last hour</div>
                                    <div class="value" id="timeValue60">${ this.getEuisEditedInTheLastNMinutes(60) }</div>
                                </div>
                                <div class="rowTime">
                                    <div class="label">Modifications in the last 2 hours</div>
                                    <div class="value" id="timeValue120">${ this.getEuisEditedInTheLastNMinutes(120) }</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr>

                    <!-- SECTION 3: EXERCISE CONFIGURATION -->
                    <section class="exerciseConfiguration">
                        <h3>Exercise configuration</h3>
                        <details>
                            <summary><strong>Teacher short guide</strong></summary>
                            <div class="details-content">
                                This quick guide summarizes the functionalities that can be used in this Dashboard.

                                <ul>
                                    <li>The <strong>Hide student's names</strong> option allows you to show/hide a column that includes the first and last names of all students shown in the progress table below. It is enabled by default.</li>
                                    <li>In case the exercises include a <strong>solution proposal</strong>, two additional controls are displayed:
                                    <ul>
                                        <li>The <strong>publish solution to students</strong> option allows teachers to decide when the solution to an exercise can be downloaded by students. This action is irrevocable, disabling this control when it is enabled. By default it is disabled.</li>
                                        <li>The <strong>allow edition after downloading solution</strong> option allows you to decide whether the exercises can be edited by the students once they have downloaded the solution. This behavior cannot be changed from the moment the solution is published. By default it is deactivated.</li>
                                    </ul>
                                    </li>
                                </ul>
                            </div>
                        </details>
                        <div class="optionsPanel">
                            <div class="checkboxRow">
                                ${this._exercise.includesTeacherSolution
                                ? `<div class="option">
                                        <div class="name">Publish solution to students</div>
                                        <label class="control checkbox_label">
                                            <input type="checkbox" name="publishSolution" id="publishSolution"${ this._exercise.solutionIsPublic ? " checked disabled" : "" }/>
                                            <div class="checkbox_switch"></div>
                                        </label>
                                    </div>
                                    <div class="option">
                                        <div class="name">Allow edition after downloading solution</div>
                                        <label class="control checkbox_label">
                                            <input type="checkbox" name="allowEditionAfterSolutionDownloaded" id="allowEditionAfterSolutionDownloaded"${ this._exercise.solutionIsPublic ? " disabled" : "" }${ this._exercise.allowEditionAfterSolutionDownloaded ? " checked" : "" }/>
                                            <div class="checkbox_switch"></div>
                                        </label>
                                    </div>`
                                : ''}
                            </div>
                        </div>
                    </section>

                    <hr>

                    <!-- SECTION 4: STUDENT'S PROGRESS -->
                    <section class="studentsProgress">
                        <h3>Student's progress</h3>
                        <div class="optionsPanel">
                            <div class="checkboxRow">
                                <div class="option">
                                    <div class="name">Hide student's names</div>
                                    <label class="control checkbox_label">
                                        <input type="checkbox" name="hideStudentNames" id="hideStudentNames"${ this.hiddenStudentNames ? " checked" : "" }/>
                                        <div class="checkbox_switch"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <table>
                            <tr>
                                ${!this.hiddenStudentNames
                                    ? `
                                        <th>Full name
                                            <span class="sorter ${ this.sortAsc ? "active" : "" }" data-column="fullName">
                                                <span></span>
                                                <span></span>
                                            </span>
                                        </th>`
                                    : ""
                                }
                                <th>Exercise folder
                                    <span class="sorter ${ this.sortAsc ? "active" : "" }" data-column="exerciseFolder">
                                        <span></span>
                                        <span></span>
                                    </span>
                                </th>
                                <th>Exercise status
                                    <span class="sorter ${ this.sortAsc ? "active" : "" }" data-column="status">
                                        <span></span>
                                        <span></span>
                                    </span>
                                </th>
                                <th>Last modification
                                    <span class="sorter ${ this.sortAsc ? "active" : "" }" data-column="lastModification">
                                        <span></span>
                                        <span></span>
                                    </span>
                                </th>
                                ${this.fullMode
                                    ? `<th>Actions</th>`
                                    : ""
                                }
                            </tr>
                            ${ rows }
                        </table>
                    </section>
                    ` }
                    <script nonce="${ nonce }" src="${ chartJsUri }"></script>
                    <script nonce="${ nonce }" src="${ scriptUri }"></script>
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
        if (!pastDateStr) {
            return "-";
        }
        pastDateStr = (pastDateStr.slice(-1)[0] === "Z") ? pastDateStr : pastDateStr + "Z";
        let elapsedTime = (new Date().getTime() - new Date(pastDateStr).getTime()) / 1000;
        if (elapsedTime < 0) {
            elapsedTime = 0;
        }
        let unit = "s";
        if (elapsedTime > 60) {
            elapsedTime /= 60; // convert to minutes
            if (elapsedTime > 60) {
                elapsedTime /= 60; // convert to hours
                if (elapsedTime > 24) {
                    elapsedTime /= 24; // convert to days
                    if (elapsedTime > 365) {
                        elapsedTime /= 365; // convert to years
                        unit = "yr";
                    } else {
                        unit = "d";
                    }
                } else {
                    unit = "h";
                }
            } else {
                unit = "min";
            }
        }

        return `${ Math.floor(elapsedTime) } ${ unit }`;
    }

    /**
     * Show quick pick with all modified files in EUIs for each user
     * @param username string username
     * @param course Course course
     * @param exercise Exercise exercise
     * @param eui_id EUI identificator
     * @returns Thenable<string|undefined> the selected file
     */
    private async showQuickPick(username: string, course: Course, exercise: Exercise, eui_id: number): Promise<vscode.Uri | undefined> {
        // Download most recent files
        await vscode.commands.executeCommand("vscode4teaching.getstudentfiles", course.name, exercise);
        return vscode.window
                     .withProgress(
                         {
                             location: vscode.ProgressLocation.Notification,
                             cancellable: false,
                             title: "Getting modified files...",
                         },
                         (progress, token) => this.buildQuickPickItems(username, eui_id)
                     )
                     .then(async (result: OpenQuickPick[]) => {
                         if (result) {
                             const selection = await this.showQuickPickRecursive(result);
                             if (selection) {
                                 return selection;
                             }
                         }
                     });
    }

    private async buildQuickPickItems(username: string, eui_id: number): Promise<OpenQuickPick[]> {
        // Find all modified files URIs (paths)
        const workspaces = vscode.workspace.workspaceFolders;
        if (workspaces) {
            const wsF = workspaces.find((e) => e.name === "student_" + eui_id.toString());
            if (wsF) {
                const euis = this._euis.filter((eui) => eui.id.toString() === eui_id.toString());
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
                        vscode.window.showWarningMessage(`No modified files for ${ username }`);
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
                v4tLogger.debug(selection);
                return selection.fullPath;
            }
        }
    }
}
