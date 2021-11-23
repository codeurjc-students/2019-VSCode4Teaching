import escapeRegExp from "lodash.escaperegexp";
import * as vscode from "vscode";
import { APIClient } from "../client/APIClient";
import { FileZipUtil } from "../utils/FileZipUtil";

export class EUIUpdateService {

    public static addModifiedPath(uri: vscode.Uri) {
        const matches = (this.URI_REGEX.exec(uri.path));
        if (!matches) { return null; }
        matches.shift();
        this.modifiedPaths.add(matches[0]);
    }

    public static async updateExercise(exerciseId: number) {
        const response = await APIClient.getExerciseUserInfo(exerciseId);
        console.debug(response);
        const originalStatus = response.data.status;
        const responseEui = await APIClient.updateExerciseUserInfo(exerciseId, originalStatus, Array.from(this.modifiedPaths));
        this.modifiedPaths.clear();
        console.debug(responseEui);
    }

    // Regex to extract the path for the file.
    // Group is the path with username, course and exercise included.
    private static readonly URI_REGEX: RegExp = new RegExp(escapeRegExp(vscode.Uri.file(FileZipUtil.downloadDir).path) + "(\/[^\/]+\/[^\/]+\/[^\/]+\/.+)$", "i");
    private static modifiedPaths: Set<string> = new Set();

}
