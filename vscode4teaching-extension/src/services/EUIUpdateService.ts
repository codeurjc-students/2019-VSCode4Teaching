import escapeRegExp from "lodash.escaperegexp";
import * as fs from "fs";
import * as vscode from "vscode";
import { APIClient } from "../client/APIClient";
import { FileZipUtil } from "../utils/FileZipUtil";

export class EUIUpdateService {

    public static addModifiedPath(uri: vscode.Uri, cwdUri: vscode.Uri) {
        if(uri.path.startsWith(cwdUri.path) && fs.statSync(uri.fsPath).isFile()) {
            this.modifiedPaths.add(uri.path.slice(cwdUri.path.length));
        }
    }

    public static async updateExercise(exerciseId: number) {
        const response = await APIClient.getExerciseUserInfo(exerciseId);
        const originalStatus = response.data.status;
        await APIClient.updateExerciseUserInfo(exerciseId, originalStatus, Array.from(this.modifiedPaths));
        this.modifiedPaths.clear();
    }

    private static modifiedPaths: Set<string> = new Set();
}
