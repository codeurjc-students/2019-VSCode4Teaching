import * as vscode from "vscode";

export class OpenQuickPick implements vscode.QuickPickItem {

    constructor(
        public name: string,
        public children: OpenQuickPick[],
        public parents?: OpenQuickPick[],
        public isGoBackButton: boolean = false,
        public fullPath?: vscode.Uri,
        public description?: string,
        public detail?: string,
        public picked?: boolean,
        public alwaysShow?: boolean,
    ) {

    }

    get label(): string {
        let prefix = "";
        if (this.children.length > 0) {
            prefix = "$(folder) ";
        } else if (!this.isGoBackButton) {
            prefix = "$(file) ";
        }
        return prefix + this.name;
    }
}
