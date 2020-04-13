import * as vscode from "vscode";
import { ExerciseUserInfo } from "../../../model/serverModel/exercise/ExerciseUserInfo";

export class DashboardWebview {
    public static currentPanel: DashboardWebview | undefined;

    public static readonly viewType = "v4tdashboard";

    public static show(euis: ExerciseUserInfo[]) {
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
            // {
            //     // Enable javascript in the webview
            //     // enableScripts: true,

            //     // And restrict the webview to only loading content from our extension's `media` directory.
            //     // localResourceRoots: [vscode.Uri.file(path.join(extensionPath, "media"))],
            // },
        );

        DashboardWebview.currentPanel = new DashboardWebview(panel, dashboardName, euis);
    }

    public readonly panel: vscode.WebviewPanel;

    private readonly _dashboardName: string;
    private readonly _euis: ExerciseUserInfo[];

    private constructor(panel: vscode.WebviewPanel, dashboardName: string, euis: ExerciseUserInfo[]) {
        this.panel = panel;
        this._dashboardName = dashboardName;
        this._euis = euis;

        // Set the webview's initial html content
        this.panel.webview.html = this.getHtmlForWebview();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => this.dispose());

        // Update the content based on view changes
        this.panel.onDidChangeViewState(
            (e) => {
                if (this.panel.visible) {
                    this.getHtmlForWebview();
                }
            },
        );
    }

    public dispose() {
        DashboardWebview.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();
    }

    private getHtmlForWebview() {
        let rows: string = "";
        for (const eui of this._euis) {
            rows = rows + "<tr>\n";
            if (eui.user.name && eui.user.lastName) {
                rows = rows + "<td>" + eui.user.name + " " + eui.user.lastName + "</td>\n";
            } else {
                rows = rows + "<td></td>";
            }
            rows = rows + "<td>" + eui.user.username + "</td>\n";
            if (eui.finished) {
                rows = rows + '<td style="background-color: #087f23;">Finished</td>\n';
            } else {
                rows = rows + '<td style="background-color: #c66900;">On progress</td>\n';
            }
            rows = rows + "</tr>\n";
        }
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>V4T Dashboard: ${this._dashboardName}</title>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    td, th {
                        border: 1px solid;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <th>Full name</th>
                        <th>Username</th>
                        <th>Exercise status</th>
                    </tr>
                    ${rows}
                </table>
            </body>
            </html>`;
    }

}
