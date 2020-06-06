import { AxiosPromise, AxiosResponse } from "axios";
import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { CurrentUser } from "../../src/client/CurrentUser";
import { V4TExerciseFile } from "../../src/model/V4TExerciseFile";
import { FileZipUtil } from "../../src/utils/FileZipUtil";
import { ZipInfo } from "../../src/utils/ZipInfo";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);

describe("FileZipUtil", () => {
    const extractedPath = path.resolve(__dirname, "..", "files", "extracted");
    const zipPath = path.resolve(__dirname, "..", "files", "zips");
    afterEach(() => {
        rimraf(zipPath, (error) => {
            return error;
        });
        rimraf(extractedPath, (error) => {
            return error;
        });
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
        const pathZip = path.resolve(__dirname, "..", "files", "exs.zip");
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
});
