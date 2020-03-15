import JSZip = require("jszip");
import * as fs from 'fs';
import * as path from 'path';
import { FileIgnoreUtil } from "../fileIgnoreUtil";
import { RestController } from "../restController";
import * as vscode from 'vscode';
import { AxiosPromise } from "axios";
import * as mkdirp from 'mkdirp';
import { ModelUtils, Exercise } from "../model/serverModel";
import { V4TExerciseFile } from "../model/v4texerciseFile";
import { CurrentUser } from "../currentUser";

export class FileZipService {

    private restController = RestController.getController();
    private downloadDir = vscode.workspace.getConfiguration('vscode4teaching')['defaultExerciseDownloadDirectory'];
    static readonly INTERNAL_FILES_DIR = path.resolve(__dirname, '..', 'v4t');

    async getExerciseFiles (courseName: string, exercise: Exercise) {
        if (CurrentUser.userinfo) {
            let dir = path.resolve(this.downloadDir, CurrentUser.userinfo.username, courseName, exercise.name);
            let zipDir = path.resolve(FileZipService.INTERNAL_FILES_DIR, CurrentUser.userinfo.username);
            let zipName = exercise.id + ".zip";
            return this.getFiles(dir, zipDir, zipName, this.restController.getExerciseFiles(exercise.id));
        }
    }

    async getStudentFiles (courseName: string, exercise: Exercise) {
        if (CurrentUser.userinfo) {
            let dir = path.resolve(this.downloadDir, "teacher", CurrentUser.userinfo.username, courseName, exercise.name);
            let zipDir = path.resolve(FileZipService.INTERNAL_FILES_DIR, "teacher", CurrentUser.userinfo.username);
            let studentZipName = exercise.id + ".zip";
            let templateDir = path.resolve(this.downloadDir, "teacher", CurrentUser.userinfo.username, courseName, exercise.name, "template");
            let templateZipName = exercise.id + "-template.zip";
            return Promise.all([
                this.getFiles(templateDir, zipDir, templateZipName, this.restController.getTemplate(exercise.id)),
                this.getFiles(dir, zipDir, studentZipName, this.restController.getAllStudentFiles(exercise.id), templateDir)
            ]);
        }
    }

    private async getFiles (dir: string, zipDir: string, zipName: string, requestThenable: AxiosPromise<ArrayBuffer>, templateDir?: string) {
        if (!fs.existsSync(dir)) {
            mkdirp.sync(dir);
        }
        try {
            let response = await requestThenable;
            let zip = await JSZip.loadAsync(response.data);
            // Save ZIP for FSW operations
            if (!fs.existsSync(zipDir)) {
                mkdirp.sync(zipDir);
            }
            let zipUri = path.resolve(zipDir, zipName);
            zip.generateAsync({ type: "nodebuffer" }).then(ab => {
                fs.writeFileSync(zipUri, ab);
            });
            zip.forEach((relativePath, file) => {
                let v4tpath = path.resolve(dir, relativePath);
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
            fs.writeFileSync(path.resolve(dir, "v4texercise.v4t"), JSON.stringify(fileContent), { encoding: "utf8" });
            return dir;
        } catch (error) {
            this.restController.handleAxiosError(error);
        }
    }

    static async getZipFromUris (fileUris: vscode.Uri[]) {
        let zip = new JSZip();
        fileUris.forEach(uri => {
            let uriPath = path.resolve(uri.fsPath);
            let stat = fs.statSync(uriPath);
            if (stat && stat.isDirectory()) {
                FileZipService.buildZipFromDirectory(uriPath, zip, path.dirname(uriPath));
            } else {
                const filedata = fs.readFileSync(uriPath);
                zip.file(path.relative(path.dirname(uriPath), uriPath), filedata);
            }
        });
        return await zip.generateAsync({
            type: 'nodebuffer'
        });
    }

    private static buildZipFromDirectory (dir: string, zip: JSZip, root: string, ignoredFiles: string[] = []) {
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
                    FileZipService.buildZipFromDirectory(file, zip, root, ignoredFiles);
                } else {
                    const filedata = fs.readFileSync(file);
                    zip.file(path.relative(root, file), filedata);
                }
            }

        }
    }
}