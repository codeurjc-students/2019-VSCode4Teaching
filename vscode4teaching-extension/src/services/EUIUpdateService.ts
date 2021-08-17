import * as vscode from "vscode";
import { APIClient } from "../client/APIClient";
import { ExerciseUserInfo } from "../model/serverModel/exercise/ExerciseUserInfo";
import { FileZipUtil } from "../utils/FileZipUtil";

export class EUIUpdateService {

    public static getExerciseInfoFromUri(uri: vscode.Uri) {
        const matches = (this.URI_REGEX.exec(uri.path));
        if (!matches) { return null; }
        matches.shift();
        return {
            uri: uri.path,
            path: matches[0],
            username: matches[1],
            courseName: matches[2],
            exerciseName: matches[3],
            fileName: matches[matches.length - 1],
        };
    }

    public static async updateExercise(uri: vscode.Uri, exerciseId: number) {
        const info = this.getExerciseInfoFromUri(uri);
        const response = await APIClient.getExerciseUserInfo(exerciseId);
        console.debug(response);
        const originalStatus = response.data.status;
        const responseEui = APIClient.updateExerciseUserInfo(exerciseId, originalStatus, info?.path || "");
        console.debug(responseEui);
    }

    private static readonly URI_REGEX: RegExp = new RegExp("/\/" + FileZipUtil.downloadDir + "(\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+))$/");
}
