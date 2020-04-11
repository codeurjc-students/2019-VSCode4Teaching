import * as vscode from "vscode";
export class FinishItem {
    private _finishItem: vscode.StatusBarItem;
    constructor() {
        const text = "Finish exercise";
        this._finishItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._finishItem.text = "$(checklist) " + text;
        this._finishItem.tooltip = text;
        this._finishItem.command = "vscode4teaching.finishexercise";
    }

    get finishItem() {
        return this._finishItem;
    }

    public hide() {
        this._finishItem.hide();
    }

    public show() {
        this._finishItem.show();
    }

    public dispose() {
        this._finishItem.dispose();
    }
}
