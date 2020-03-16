import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import { FileIgnoreUtil } from "./FileIgnoreUtil";
import * as vscode from 'vscode';
import { AxiosPromise } from "axios";
import * as mkdirp from 'mkdirp';
import { ModelUtils, Exercise } from "../model/serverModel/ServerModel";
import { V4TExerciseFile } from "../model/V4TExerciseFile";
import { CurrentUser } from "../model/CurrentUser";
export interface ZipInfo {
    dir: string;
    zipDir: string;
    zipName: string;
}
export namespace FileZipUtil {

    const downloadDir = vscode.workspace.getConfiguration('vscode4teaching')['defaultExerciseDownloadDirectory'];
    export const INTERNAL_FILES_DIR = path.resolve(__dirname, '..', 'v4t');

    export function exerciseZipInfo (courseName: string, exercise: Exercise): ZipInfo {
        if (CurrentUser.userinfo) {
            let dir = path.resolve(downloadDir, CurrentUser.userinfo.username, courseName, exercise.name);
            let zipDir = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, CurrentUser.userinfo.username);
            let zipName = exercise.id + ".zip";
            return {
                dir: dir,
                zipDir: zipDir,
                zipName: zipName
            };
        } else {
            throw new Error('Not logged in');
        }
    }

    export function studentZipInfo (courseName: string, exercise: Exercise, templateDir?: string): ZipInfo {
        if (CurrentUser.userinfo) {
            let dir = path.resolve(downloadDir, "teacher", CurrentUser.userinfo.username, courseName, exercise.name);
            let zipDir = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, "teacher", CurrentUser.userinfo.username);
            let studentZipName = exercise.id + ".zip";
            return {
                dir: dir,
                zipDir: zipDir,
                zipName: studentZipName
            };
        } else {
            throw new Error('Not logged in');
        }
    }

    export function templateZipInfo (courseName: string, exercise: Exercise): ZipInfo {
        if (CurrentUser.userinfo) {
            let templateDir = path.resolve(downloadDir, "teacher", CurrentUser.userinfo.username, courseName, exercise.name, "template");
            let templateZipDir = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, "teacher", CurrentUser.userinfo.username);
            let templateZipName = exercise.id + "-template.zip";
            return {
                dir: templateDir,
                zipDir: templateZipDir,
                zipName: templateZipName
            };
        } else {
            throw new Error('Not logged in');
        }
    }

    export async function filesFromZip (zipInfo: ZipInfo, requestThenable: AxiosPromise<ArrayBuffer>, templateDir?: string) {
        if (!fs.existsSync(zipInfo.dir)) {
            mkdirp.sync(zipInfo.dir);
        }
        try {
            let response = await requestThenable;
            let zip = await JSZip.loadAsync(response.data);
            // Save ZIP for FSW operations
            if (!fs.existsSync(zipInfo.zipDir)) {
                mkdirp.sync(zipInfo.zipDir);
            }
            let zipUri = path.resolve(zipInfo.zipDir, zipInfo.zipName);
            zip.generateAsync({ type: "nodebuffer" }).then(ab => {
                fs.writeFileSync(zipUri, ab);
            });
            zip.forEach((relativePath, file) => {
                let v4tpath = path.resolve(zipInfo.dir, relativePath);
                if (CurrentUser.userinfo && !fs.existsSync(path.dirname(v4tpath))) {
                    mkdirp.sync(path.dirname(v4tpath));
                }
                if (file.dir && !fs.existsSync(v4tpath)) {
                    mkdirp.sync(v4tpath);
                } else {
                    file.async('nodebuffer').then(fileData => {
                        fs.writeFileSync(v4tpath, fileData);
                    }).catch(error => {
                        console.error(error);
                    });
                }
            });
            // The purpose of this file is to indicate this is an exercise directory to V4T to enable file uploads, etc
            let isTeacher = CurrentUser.userinfo ? ModelUtils.isTeacher(CurrentUser.userinfo) : false;
            let fileContent: V4TExerciseFile = {
                zipLocation: zipUri,
                teacher: isTeacher,
                template: templateDir ? templateDir : undefined
            };
            fs.writeFileSync(path.resolve(zipInfo.dir, "v4texercise.v4t"), JSON.stringify(fileContent), { encoding: "utf8" });
            return zipInfo.dir;
        } catch (error) {
            vscode.window.showErrorMessage(error);
        }
    }

    export async function getZipFromUris (fileUris: vscode.Uri[]) {
        let zip = new JSZip();
        fileUris.forEach(uri => {
            let uriPath = path.resolve(uri.fsPath);
            let stat = fs.statSync(uriPath);
            if (stat && stat.isDirectory()) {
                FileZipUtil.buildZipFromDirectory(uriPath, zip, path.dirname(uriPath));
            } else {
                const filedata = fs.readFileSync(uriPath);
                zip.file(path.relative(path.dirname(uriPath), uriPath), filedata);
            }
        });
        return await zip.generateAsync({
            type: 'nodebuffer'
        });
    }

    export async function buildZipFromDirectory (dir: string, zip: JSZip, root: string, ignoredFiles: string[] = []) {
        const list = fs.readdirSync(dir);
        let newIgnoredFiles = FileIgnoreUtil.readGitIgnores(dir);
        newIgnoredFiles.forEach((file: string) => {
            if (!ignoredFiles.includes(file)) {
                ignoredFiles.push(file);
            }
        });
        for (let file of list) {
            file = path.resolve(dir, file);
            if (!ignoredFiles.includes(file)) {
                let stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    FileZipUtil.buildZipFromDirectory(file, zip, root, ignoredFiles);
                } else {
                    const filedata = fs.readFileSync(file);
                    zip.file(path.relative(root, file), filedata);
                }
            }

        }
    }
}