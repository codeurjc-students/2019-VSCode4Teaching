import * as vscode from "vscode";

export abstract class V4TStatusBarItem {
    private _item: vscode.StatusBarItem;

    constructor(private text: string, private icon: string, private command: string) {
        this._item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._item.text = "$(" + icon + ") " + text;
        this._item.tooltip = text;
        this._item.command = command;
    }

    get item(): vscode.StatusBarItem {
        return this._item;
    }

    public hide() {
        this._item.hide();
    }

    public show() {
        this._item.show();
    }

    public dispose() {
        this._item.dispose();
    }
}
