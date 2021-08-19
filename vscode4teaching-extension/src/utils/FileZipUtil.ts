import { AxiosPromise } from "axios";
import * as fs from "fs";
import JSZip from "jszip";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";
import { APIClient } from "../client/APIClient";
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
    public static readonly INTERNAL_FILES_DIR = path.resolve(__dirname, "v4t");

    public static get downloadDir() {
        return vscode.workspace.getConfiguration("vscode4teaching").get("defaultExerciseDownloadDirectory", "v4tdownloads");
    }

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
            console.debug(zip);
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
        console.debug(zip);
        return await zip.generateAsync({
            type: "nodebuffer",
        });
    }

    /**
     * Updates or adds a single file in zip and uploads it
     * @param ignoredFiles List of ignored files
     * @param filePath Path of the file
     * @param exerciseId Exercise id
     * @param jszipFile JSZip instance
     * @param cwd Current Working Directory
     */
    public static async updateFile(jszipFile: JSZip, filePath: string, rootPath: string, ignoredFiles: string[], exerciseId: number) {
        if (!ignoredFiles.includes(filePath)) {
            const absFilePath = path.resolve(filePath);
            const readFilePromise = promisify(fs.readFile);
            try {
                const data = await readFilePromise(absFilePath);
                const relativeFilePath = path.relative(rootPath, absFilePath).replace(/\\/g, "/");
                if (!filePath.includes("v4texercise.v4t")) {
                    jszipFile.file(relativeFilePath, data);
                    const thenable = jszipFile.generateAsync({ type: "nodebuffer" });
                    vscode.window.setStatusBarMessage("Compressing files...", thenable);
                    console.debug(jszipFile);
                    return thenable.then((zipData) => APIClient.uploadFiles(exerciseId, zipData))
                        .then((response) => console.debug(response))
                        .catch((axiosError) => APIClient.handleAxiosError(axiosError));
                }
            } catch (err) {
                if (filePath.includes("v4texercise.v4t")) {
                    throw err;
                } else {
                    console.error(err);
                }
            }
        }
    }

    /**
     * Deletes a single file in zip and uploads it
     * @param ignoredFiles List of ignored files
     * @param filePath Path of the file
     * @param exerciseId Exercise id
     * @param jszipFile JSZip instance
     * @param cwd Current Working Directory
     */
    public static async deleteFile(jszipFile: JSZip, filePath: string, rootPath: string, ignoredFiles: string[], exerciseId: number) {
        if (!ignoredFiles.includes(filePath)) {
            const absFilePath = path.resolve(filePath);
            const relativeFilePath = path.relative(rootPath, absFilePath).replace(/\\/g, "/");
            jszipFile.remove(relativeFilePath);
            const thenable = jszipFile.generateAsync({ type: "nodebuffer" });
            vscode.window.setStatusBarMessage("Compressing files...", thenable);
            return thenable.then((zipData) => { APIClient.uploadFiles(exerciseId, zipData); })
                .then((response) => console.debug(response))
                .catch((err) => APIClient.handleAxiosError(err));
        }
    }

    private static async buildZipFromDirectory(dir: string, zip: JSZip, root: string, ignoredFiles: string[] = []) {
        const list = fs.readdirSync(dir);
        const newIgnoredFiles = FileIgnoreUtil.readGitIgnores(dir);
        newIgnoredFiles.forEach((file: string) => {
            if (!ignoredFiles.includes(file)) {
                ignoredFiles.push(file);
            }
        });
        for (const file of list) {
            const filePath = path.resolve(dir, file);
            const fileUnix = filePath.replace(/\\/g, "/");
            if (!ignoredFiles.includes(filePath)) {
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    FileZipUtil.buildZipFromDirectory(filePath, zip, root, ignoredFiles);
                } else {
                    const filedata = fs.readFileSync(filePath);
                    zip.file(path.relative(root, fileUnix)?.replace(/\\/g, "/"), filedata);
                }
            }

        }
    }
}
