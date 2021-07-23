import { AxiosPromise } from "axios";
import * as fs from "fs";
import * as JSZip from "jszip";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as vscode from "vscode";
import { CurrentUser } from "../client/CurrentUser";
import { Exercise } from "../model/serverModel/exercise/Exercise";
import { ModelUtils } from "../model/serverModel/ModelUtils";
import { V4TExerciseFile } from "../model/V4TExerciseFile";
import { FileIgnoreUtil } from "./FileIgnoreUtil";
import { ZipInfo } from "./ZipInfo";

/**
 * Utility class used for zipping files
 */
export class FileZipUtil {
    public static readonly downloadDir = vscode.workspace.getConfiguration("vscode4teaching").get("defaultExerciseDownloadDirectory", "v4tdownloads");
    public static readonly INTERNAL_FILES_DIR = path.resolve(__dirname, "..", "v4t");

    /**
     * Returns zip info from an exercise
     * @param courseName course name
     * @param exercise exercise
     */
    public static exerciseZipInfo(courseName: string, exercise: Exercise): ZipInfo {
        if (CurrentUser.isLoggedIn()) {
            const currentUser = CurrentUser.getUserInfo();
            const dir = path.resolve(FileZipUtil.downloadDir, currentUser.username, courseName, exercise.name);
            const zipDir = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, currentUser.username);
            const zipName = exercise.id + ".zip";
            return {
                dir,
                zipDir,
                zipName,
            };
        } else {
            throw new Error("Not logged in");
        }
    }

    /**
     * Returns zip info from student files
     * @param courseName course name
     * @param exercise exercise
     */
    public static studentZipInfo(courseName: string, exercise: Exercise): ZipInfo {
        if (CurrentUser.isLoggedIn()) {
            const currentUser = CurrentUser.getUserInfo();
            const dir = path.resolve(FileZipUtil.downloadDir, "teacher", currentUser.username, courseName, exercise.name);
            const zipDir = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, "teacher", currentUser.username);
            const studentZipName = exercise.id + ".zip";
            return {
                dir,
                zipDir,
                zipName: studentZipName,
            };
        } else {
            throw new Error("Not logged in");
        }
    }

    /**
     * Returns zip info from a template of an exercise
     * @param courseName course name
     * @param exercise exercise
     */
    public static templateZipInfo(courseName: string, exercise: Exercise): ZipInfo {
        if (CurrentUser.isLoggedIn()) {
            const currentUser = CurrentUser.getUserInfo();
            const templateDir = path.resolve(FileZipUtil.downloadDir, "teacher", currentUser.username, courseName, exercise.name, "template");
            const templateZipDir = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, "teacher", currentUser.username);
            const templateZipName = exercise.id + "-template.zip";
            return {
                dir: templateDir,
                zipDir: templateZipDir,
                zipName: templateZipName,
            };
        } else {
            throw new Error("Not logged in");
        }
    }

    /**
     * Zip files and call a thenable with the zip
     * @param zipInfo zip info (check previous functions)
     * @param requestThenable thenable to call with zip
     * @param templateDir Optional template dir (use only if zipping a template)
     */
    public static async filesFromZip(zipInfo: ZipInfo, requestThenable: AxiosPromise<ArrayBuffer>, templateDir?: string) {
        if (!fs.existsSync(zipInfo.dir)) {
            mkdirp.sync(zipInfo.dir);
        }
        try {
            const response = await requestThenable;
            console.debug(response);
            const zip = await JSZip.loadAsync(response.data);
            // Save ZIP for FSW operations
            if (!fs.existsSync(zipInfo.zipDir)) {
                mkdirp.sync(zipInfo.zipDir);
            }
            const zipUri = path.resolve(zipInfo.zipDir, zipInfo.zipName);
            const ab = await zip.generateAsync({ type: "nodebuffer" });
            fs.writeFileSync(zipUri, ab);
            const v4tpathArray: string[] = [];
            const promises: Array<Promise<Buffer>> = [];
            zip.forEach((relativePath, file) => {
                const v4tpath = path.resolve(zipInfo.dir, relativePath);
                if (CurrentUser.isLoggedIn() && !fs.existsSync(path.dirname(v4tpath))) {
                    mkdirp.sync(path.dirname(v4tpath));
                }
                if (file.dir && !fs.existsSync(v4tpath)) {
                    mkdirp.sync(v4tpath);
                } else {
                    v4tpathArray.push(v4tpath);
                    promises.push(file.async("nodebuffer"));
                }
            });
            const fileDataArray = await Promise.all(promises);
            for (let i = 0; i < promises.length; i++) {
                try {
                    const fileData = fileDataArray[i];
                    const v4tpath = v4tpathArray[i];
                    fs.writeFileSync(v4tpath, fileData);
                } catch (error) {
                    vscode.window.showErrorMessage(error);
                }
            }
            // The purpose of this file is to indicate this is an exercise directory to V4T to enable file uploads, etc
            const isTeacher = CurrentUser.isLoggedIn() ? ModelUtils.isTeacher(CurrentUser.getUserInfo()) : false;
            const fileContent: V4TExerciseFile = {
                zipLocation: zipUri,
                teacher: isTeacher,
                template: templateDir ? templateDir : undefined,
            };
            fs.writeFileSync(path.resolve(zipInfo.dir, "v4texercise.v4t"), JSON.stringify(fileContent), { encoding: "utf8" });
            return zipInfo.dir;
        } catch (error) {
            vscode.window.showErrorMessage(error);
        }
    }

    /**
     * Returns Buffer with zipped files
     * @param fileUris files
     */
    public static async getZipFromUris(fileUris: vscode.Uri[]) {
        const zip = new JSZip();
        fileUris.forEach((uri) => {
            const uriPath = path.resolve(uri.fsPath)?.replace(/\\/g, "/");
            const stat = fs.statSync(uriPath);
            if (stat && stat.isDirectory()) {
                FileZipUtil.buildZipFromDirectory(uriPath, zip, path.dirname(uriPath));
            } else {
                const filedata = fs.readFileSync(uriPath);
                zip.file(path.relative(path.dirname(uriPath), uriPath), filedata);
            }
        });
        return await zip.generateAsync({
            type: "nodebuffer",
        });
    }

    private static async buildZipFromDirectory(dir: string, zip: JSZip, root: string, ignoredFiles: string[] = []) {
        const list = fs.readdirSync(dir);
        const newIgnoredFiles = FileIgnoreUtil.readGitIgnores(dir);
        newIgnoredFiles.forEach((file: string) => {
            if (!ignoredFiles.includes(file)) {
                ignoredFiles.push(file);
            }
        });
        for (let file of list) {
            file = path.resolve(dir, file)?.replace(/\\/g, "/");
            if (!ignoredFiles.includes(file)) {
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    FileZipUtil.buildZipFromDirectory(file, zip, root, ignoredFiles);
                } else {
                    const filedata = fs.readFileSync(file);
                    zip.file(path.relative(root, file)?.replace(/\\/g, "/"), filedata);
                }
            }

        }
    }
}
