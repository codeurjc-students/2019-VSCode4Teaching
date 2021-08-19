import { AxiosPromise, AxiosResponse } from "axios";
import * as fs from "fs";
import JSZip from "jszip";
import * as path from "path";
import rimraf from "rimraf";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { V4TExerciseFile } from "../../src/model/V4TExerciseFile";
import { FileZipUtil } from "../../src/utils/FileZipUtil";
import { ZipInfo } from "../../src/utils/ZipInfo";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/client/APIClient");
const mockedAPIClient = mocked(APIClient, true);

describe("FileZipUtil", () => {
    const rootPath = path.resolve(__dirname, "..", "files");
    const extractedPath = path.resolve(rootPath, "extracted");
    const zipPath = path.resolve(rootPath, "zips");
    const newFilePath = path.resolve(rootPath, "newfile.txt");
    const pathZip = path.resolve(rootPath, "exs.zip");

    async function readZip() {
        const buffer = fs.readFileSync(pathZip);
        return JSZip.loadAsync(buffer);
    }

    afterEach(() => {
        rimraf(zipPath, (error: any) => {
            return error;
        });
        rimraf(extractedPath, (error: any) => {
            return error;
        });
        rimraf(newFilePath, (error: any) => {
            return error;
        });
        mockedAPIClient.uploadFiles.mockClear();
    });

    it("should obtain files from zip of exercise", async () => {
        const extractPathCourseExercise = path.resolve(extractedPath, "course", "exercise");
        const zipPathStudent = path.resolve(zipPath, "johndoejr");
        const zipName = "2.zip";
        const zipInfo: ZipInfo = {
            dir: extractPathCourseExercise,
            zipDir: zipPathStudent,
            zipName,
        };
        const arraybuffer: ArrayBuffer = fs.readFileSync(pathZip).buffer; // Arraybuffer with zip data
        const response: AxiosResponse<ArrayBuffer> = {
            config: {},
            headers: {},
            status: 200,
            statusText: "",
            data: arraybuffer,
        };
        const thenable: AxiosPromise<ArrayBuffer> = Promise.resolve(response);
        mockedCurrentUser.isLoggedIn.mockReturnValue(true);
        mockedCurrentUser.getUserInfo.mockReturnValue({
            id: 10,
            roles: [{
                roleName: "ROLE_STUDENT",
            }],
            username: "johndoejr",
        });

        await FileZipUtil.filesFromZip(zipInfo, thenable);
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledTimes(0);
        // Check that zip was saved
        const zipFilePath = path.resolve(zipPathStudent, zipName);
        expect(fs.existsSync(zipFilePath)).toBeTruthy();
        // Check that all files have been extracted
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "ex1.html"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "ex2.html"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, ".gitignore"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "exs", ".gitignore"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "exs", "ex3.html"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "exs", "ignoredex.html"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "exs", "ignoredexs", "exignored.html"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "exs", "ignoredexs", "notignoredex.html"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "exs", "ignoredexs", "notignoredexs", "exnotignored.html"))).toBeTruthy();
        expect(fs.existsSync(path.resolve(extractPathCourseExercise, "exs", "ex4", "ex4.html"))).toBeTruthy();
        // Check v4t file
        const v4tPath = path.resolve(extractPathCourseExercise, "v4texercise.v4t");
        expect(fs.existsSync(v4tPath)).toBeTruthy();
        const v4tInfo: V4TExerciseFile = JSON.parse(fs.readFileSync(v4tPath, { encoding: "utf8" }));
        expect(v4tInfo.teacher).toBeFalsy();
        expect(v4tInfo.zipLocation).toBe(zipFilePath);
        expect(v4tInfo.template).toBeFalsy();
    });

    it("should add file to zip instance", async () => {
        const zipInstance = await readZip();
        const expectedZipInstance = await readZip();
        const exercise: Exercise = {
            id: 2,
            name: "Test exercise",
        };
        const ignoredPaths: string[] = [];
        // Create file to add
        fs.writeFileSync(newFilePath, "Test");
        const filePath = path.relative(rootPath, newFilePath);
        expectedZipInstance.file(filePath, "Test");

        await FileZipUtil.updateFile(zipInstance, newFilePath, rootPath, ignoredPaths, exercise.id);

        expect(mockedAPIClient.uploadFiles).toHaveBeenCalledTimes(1);
        expect(mockedAPIClient.handleAxiosError).toHaveBeenCalledTimes(0);
        expect(zipInstance.files).toHaveProperty([filePath]);
    });

    it("should delete file from zip instance", async () => {
        const zipInstance = await readZip();
        const expectedZipInstance = await readZip();
        const exercise: Exercise = {
            id: 2,
            name: "Test exercise",
        };
        const ignoredPaths: string[] = [];
        const filePath = path.relative(rootPath, path.resolve(rootPath, "exs", "ex3.html"));
        expectedZipInstance.remove(filePath);

        await FileZipUtil.deleteFile(zipInstance, filePath, rootPath, ignoredPaths, exercise.id);

        expect(mockedAPIClient.uploadFiles).toHaveBeenCalledTimes(1);
        expect(mockedAPIClient.handleAxiosError).toHaveBeenCalledTimes(0);
        expect(zipInstance.files).not.toHaveProperty(filePath);
    });
});
