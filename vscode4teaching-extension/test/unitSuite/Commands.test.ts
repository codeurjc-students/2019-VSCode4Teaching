import { AxiosResponse } from "axios";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { FinishItem } from "../../src/components/statusBarItems/exercises/FinishItem";
import * as extension from "../../src/extension";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { FileInfo } from "../../src/model/serverModel/file/FileInfo";
import { User } from "../../src/model/serverModel/user/User";
import { NoteComment } from "../../src/services/NoteComment";
import { TeacherCommentService } from "../../src/services/TeacherCommentsService";
import { FileZipUtil } from "../../src/utils/FileZipUtil";
import { ZipInfo } from "../../src/utils/ZipInfo";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("../../src/services/TeacherCommentsService");
const mockedTeacherCommentService = mocked(TeacherCommentService, true);
jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("path");
const mockedPath = mocked(path, true);
jest.mock("fs");
const mockedFs = mocked(fs, true);
jest.mock("../../src/utils/FileZipUtil");
const mockedFileZipUtil = mocked(FileZipUtil, true);
jest.mock("mkdirp");
const mockedMkdirp = mocked(mkdirp, true);

const ec: vscode.ExtensionContext = {
    subscriptions: [],
    workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
    },
    globalState: {
        get: jest.fn(),
        update: jest.fn(),
    },
    extensionUri: mockedVscode.Uri.parse("test"),
    extensionPath: "test",
    asAbsolutePath: jest.fn(),
    storagePath: "test",
    globalStoragePath: "test",
    logPath: "test",
};

describe("Command implementations", () => {

    // command tests
    const commandFunctions = Object.create(null);
    mockedVscode.commands.registerCommand.mockImplementation((commandId, commandFn) => {
        commandFunctions[commandId] = commandFn;
        return {
            dispose: jest.fn(),
        };
    });

    beforeEach(() => {
        mockedClient.initializeSessionFromFile.mockReturnValueOnce(false); // Initialization will be covered in another test
        extension.activate(ec);
    });

    afterEach(() => {
        mockedCurrentUser.isLoggedIn.mockClear();
        mockedCurrentUser.getUserInfo.mockClear();
        mockedPath.resolve.mockClear();
        mockedFs.existsSync.mockClear();
        mockedVscode.commands.executeCommand.mockClear();
        mockedFileZipUtil.filesFromZip.mockClear();
        mockedMkdirp.sync.mockClear();
        mockedClient.getFilesInfo.mockClear();
        mockedFs.writeFileSync.mockClear();
        mockedVscode.workspace.updateWorkspaceFolders.mockClear();
    });

    it("should create comment correctly (teacher)", async () => {
        const line = 0;
        const lineText = "test";
        const positionMock: vscode.Position = {
            line,
            character: 0,
            compareTo: jest.fn(),
            isAfter: jest.fn(),
            isAfterOrEqual: jest.fn(),
            isBefore: jest.fn(),
            isBeforeOrEqual: jest.fn(),
            isEqual: jest.fn(),
            translate: jest.fn(),
            with: jest.fn(),
        };
        const rangeMock: vscode.Range = {
            start: positionMock,
            end: positionMock,
            contains: jest.fn(),
            intersection: jest.fn(),
            isEmpty: true,
            isEqual: jest.fn(),
            isSingleLine: true,
            union: jest.fn(),
            with: jest.fn(),
        };
        const commentsMock: NoteComment[] = [
            new NoteComment("test1", mockedVscode.CommentMode.Preview, { name: "johndoe" }, lineText),
        ];
        const threadMock: vscode.CommentThread = {
            uri: mockedVscode.Uri.parse("/v4t/johndoe/course/exercise/johndoejr/file.txt"),
            range: rangeMock,
            collapsibleState: mockedVscode.CommentThreadCollapsibleState.Expanded,
            comments: commentsMock,
            dispose: jest.fn(),
        };
        const replyMock: vscode.CommentReply = {
            thread: threadMock,
            text: "test",
        };
        const user: User = {
            id: 40,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoe",
        };

        mockedCurrentUser.isLoggedIn.mockReturnValue(true);
        mockedCurrentUser.getUserInfo.mockReturnValue(user);

        mockedFileZipUtil.INTERNAL_FILES_DIR = "v4t";

        mockedPath.sep = "/";
        mockedPath.resolve.mockImplementation((...args) => {
            let finalRoute = "";
            for (const arg of args) {
                finalRoute = finalRoute.concat("/").concat(arg);
            }
            return finalRoute;
        });

        const fileInfoArray: FileInfo[] = [
            {
                id: 101,
                path: "file.txt",
            }, {
                id: 102,
                path: "incorrectfile.txt",
            },
        ];
        mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(fileInfoArray));

        extension.setCommentProvider("johndoe");
        await commandFunctions["vscode4teaching.createComment"](replyMock);

        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledTimes(0);
        expect(mockedPath.resolve).toHaveBeenCalledTimes(1);
        expect(mockedPath.resolve).toHaveBeenNthCalledWith(1, "v4t", "johndoe", ".fileInfo", "exercise", "johndoejr.json");
        expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
        expect(mockedFs.readFileSync).toHaveBeenNthCalledWith(1, "/v4t/johndoe/.fileInfo/exercise/johndoejr.json", { encoding: "utf8" });
        expect(extension.commentProvider?.addComment).toHaveBeenCalledTimes(1);
        expect(extension.commentProvider?.addComment).toHaveBeenNthCalledWith(1, replyMock, 101);
    });

    it("should finish item correctly", async () => {
        const warnMessage = "Finish exercise? Exercise will be marked as finished and you will not be able to upload any more updates";
        const acceptOption = "Accept";

        extension.setFinishItem(2);
        const user: User = {
            id: 1,
            roles: [{ roleName: "ROLE_STUDENT" }],
            username: "johndoejr",
        };
        const exercise: Exercise = {
            id: 2,
            name: "Test exercise",
        };
        const eui: ExerciseUserInfo = {
            status: 1,
            user,
            exercise,
        };
        const response: AxiosResponse<ExerciseUserInfo> = {
            data: eui,
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.updateExerciseUserInfo.mockResolvedValueOnce(response);

        await commandFunctions["vscode4teaching.finishexercise"]();

        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenNthCalledWith(1, warnMessage, { modal: true }, acceptOption);
        expect(mockedClient.updateExerciseUserInfo).toHaveBeenCalledTimes(1);
        expect(mockedClient.updateExerciseUserInfo).toHaveBeenNthCalledWith(1, 2, 1);
    });

    it("should download single student exercise files", async () => {
        const courseName = "Test course";
        const exercise: Exercise = {
            id: 10,
            name: "Test exercise",
        };
        const zipInfo: ZipInfo = {
            dir: "newWorkspace",
            zipDir: "zipDir",
            zipName: "10.zip",
        };
        const user: User = {
            id: 40,
            roles: [{
                roleName: "ROLE_STUDENT",
            }],
            username: "johndoejr",
        };
        mockedFileZipUtil.exerciseZipInfo.mockReturnValueOnce(zipInfo);
        mockedFileZipUtil.filesFromZip.mockResolvedValueOnce(zipInfo.dir);
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);
        mockedPath.resolve.mockReturnValueOnce("fileInfo").mockReturnValueOnce("fileInfo/johndoejr.json");
        mockedFs.existsSync.mockReturnValueOnce(false);
        mockedMkdirp.sync.mockReturnValueOnce("fileInfo");
        const fileInfoResponse: AxiosResponse<FileInfo[]> = {
            data: [{
                id: 100,
                path: "file.txt",
            }, {
                id: 101,
                path: "file2.txt",
            }],
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.getFilesInfo.mockResolvedValueOnce(fileInfoResponse);
        mockedVscode.workspace.updateWorkspaceFolders.mockReturnValueOnce(true);

        await commandFunctions["vscode4teaching.getexercisefiles"](courseName, exercise);

        expect(mockedFileZipUtil.exerciseZipInfo).toHaveBeenCalledTimes(1);
        expect(mockedFileZipUtil.exerciseZipInfo).toHaveBeenNthCalledWith(1, courseName, exercise);
        expect(mockedFileZipUtil.filesFromZip).toHaveBeenCalledTimes(1);
        expect(mockedCurrentUser.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(mockedCurrentUser.getUserInfo).toHaveBeenCalledTimes(1);
        expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
        expect(mockedPath.resolve).toHaveBeenCalledTimes(2);
        expect(mockedMkdirp.sync).toHaveBeenCalledTimes(1);
        expect(mockedMkdirp.sync).toHaveBeenNthCalledWith(1, "fileInfo");
        expect(mockedClient.getFilesInfo).toHaveBeenCalledTimes(1);
        expect(mockedClient.getFilesInfo).toHaveBeenNthCalledWith(1, user.username, exercise.id);
        expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(1, "fileInfo/johndoejr.json", JSON.stringify(fileInfoResponse.data), { encoding: "utf8" });
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenNthCalledWith(1, 0, 0, { uri: mockedVscode.Uri.file(zipInfo.dir), name: exercise.name });
    });

    it("should download all student exercise files", async () => {
        const courseName = "Test course";
        const exercise: Exercise = {
            id: 10,
            name: "Test exercise",
        };
        const zipInfo: ZipInfo = {
            dir: "newWorkspace",
            zipDir: "zipDir",
            zipName: "10.zip",
        };
        const templateZipInfo: ZipInfo = {
            dir: "newWorkspace/template",
            zipDir: "zipDir",
            zipName: "10-template.zip",
        };
        const user: User = {
            id: 40,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoejr",
        };
        mockedFileZipUtil.studentZipInfo.mockReturnValueOnce(zipInfo);
        mockedFileZipUtil.templateZipInfo.mockReturnValueOnce(templateZipInfo);
        mockedFileZipUtil.filesFromZip.mockResolvedValueOnce(templateZipInfo.dir).mockResolvedValueOnce(zipInfo.dir);
        mockedFs.readdirSync.mockReturnValueOnce([{
            name: "johndoejr",
            isBlockDevice: jest.fn(),
            isCharacterDevice: jest.fn(),
            isDirectory: jest.fn().mockReturnValue(true),
            isFIFO: jest.fn(),
            isFile: jest.fn(),
            isSocket: jest.fn(),
            isSymbolicLink: jest.fn(),
        }, {
            name: "johndoejr2",
            isBlockDevice: jest.fn(),
            isCharacterDevice: jest.fn(),
            isDirectory: jest.fn().mockReturnValue(true),
            isFIFO: jest.fn(),
            isFile: jest.fn(),
            isSocket: jest.fn(),
            isSymbolicLink: jest.fn(),
        }, {
            name: "errorfile.txt",
            isBlockDevice: jest.fn(),
            isCharacterDevice: jest.fn(),
            isDirectory: jest.fn().mockReturnValue(false),
            isFIFO: jest.fn(),
            isFile: jest.fn(),
            isSocket: jest.fn(),
            isSymbolicLink: jest.fn(),
        }, {
            name: "template",
            isBlockDevice: jest.fn(),
            isCharacterDevice: jest.fn(),
            isDirectory: jest.fn().mockReturnValue(true),
            isFIFO: jest.fn(),
            isFile: jest.fn(),
            isSocket: jest.fn(),
            isSymbolicLink: jest.fn(),
        }]);
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);
        mockedPath.resolve
            .mockReturnValueOnce("fileInfo")
            .mockReturnValueOnce("fileInfo/johndoejr.json")
            .mockReturnValueOnce("fileInfo/johndoejr2.json")
            .mockReturnValueOnce("newWorkspace/template")
            .mockReturnValueOnce("newWorkspace/johndoejr")
            .mockReturnValueOnce("newWorkspace/johndoejr2");
        mockedFs.existsSync.mockReturnValueOnce(false);
        mockedMkdirp.sync.mockReturnValueOnce("fileInfo");
        const fileInfoResponse1: AxiosResponse<FileInfo[]> = {
            data: [{
                id: 100,
                path: "file.txt",
            }, {
                id: 101,
                path: "file2.txt",
            }],
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        const fileInfoResponse2: AxiosResponse<FileInfo[]> = {
            data: [{
                id: 102,
                path: "file.txt",
            }, {
                id: 103,
                path: "file2.txt",
            }, {
                id: 104,
                path: "file3.txt",
            }],
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.getFilesInfo.mockResolvedValueOnce(fileInfoResponse1).mockResolvedValueOnce(fileInfoResponse2);
        mockedVscode.workspace.updateWorkspaceFolders.mockReturnValueOnce(true);

        await commandFunctions["vscode4teaching.getstudentfiles"](courseName, exercise);

        expect(mockedFileZipUtil.studentZipInfo).toHaveBeenCalledTimes(1);
        expect(mockedFileZipUtil.studentZipInfo).toHaveBeenNthCalledWith(1, courseName, exercise);
        expect(mockedFileZipUtil.templateZipInfo).toHaveBeenCalledTimes(1);
        expect(mockedFileZipUtil.templateZipInfo).toHaveBeenNthCalledWith(1, courseName, exercise);
        expect(mockedFileZipUtil.filesFromZip).toHaveBeenCalledTimes(2);
        expect(mockedCurrentUser.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(mockedCurrentUser.getUserInfo).toHaveBeenCalledTimes(1);
        expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
        expect(mockedPath.resolve).toHaveBeenCalledTimes(6);
        expect(mockedMkdirp.sync).toHaveBeenCalledTimes(1);
        expect(mockedMkdirp.sync).toHaveBeenNthCalledWith(1, "fileInfo");
        expect(mockedClient.getFilesInfo).toHaveBeenCalledTimes(2);
        expect(mockedClient.getFilesInfo).toHaveBeenNthCalledWith(1, "johndoejr", exercise.id);
        expect(mockedClient.getFilesInfo).toHaveBeenNthCalledWith(2, "johndoejr2", exercise.id);
        expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
        expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(1, "fileInfo/johndoejr.json", JSON.stringify(fileInfoResponse1.data), { encoding: "utf8" });
        expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(2, "fileInfo/johndoejr2.json", JSON.stringify(fileInfoResponse2.data), { encoding: "utf8" });
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenNthCalledWith(1, 0, 0,
            { uri: mockedVscode.Uri.file("newWorkspace/template") },
            { uri: mockedVscode.Uri.file("newWorkspace/johndoejr") },
            { uri: mockedVscode.Uri.file("newWorkspace/johndoejr2") });
    });

    it("should run diff", async () => {
        const file = mockedVscode.Uri.file("johndoejr/file.txt");
        const wf: vscode.WorkspaceFolder = {
            index: 0,
            name: "johndoejr",
            uri: mockedVscode.Uri.file("johndoejr"),
        };
        mockedVscode.workspace.getWorkspaceFolder.mockReturnValueOnce(wf);
        mockedPath.relative.mockReturnValueOnce("file.txt");
        extension.setTemplate("johndoejr", "template");
        mockedPath.resolve.mockReturnValueOnce("template/file.txt");
        mockedFs.existsSync.mockReturnValueOnce(true);

        await commandFunctions["vscode4teaching.diff"](file);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(0);
        expect(mockedVscode.workspace.getWorkspaceFolder).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.getWorkspaceFolder).toHaveBeenNthCalledWith(1, file);
        expect(mockedPath.relative).toHaveBeenCalledTimes(1);
        expect(mockedPath.relative).toHaveBeenNthCalledWith(1, wf.uri.fsPath, file.fsPath);
        expect(mockedPath.resolve).toHaveBeenCalledTimes(1);
        expect(mockedPath.resolve).toHaveBeenNthCalledWith(1, "template", "file.txt");
        expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
        expect(mockedVscode.commands.executeCommand).toHaveBeenCalledTimes(1);
        expect(mockedVscode.commands.executeCommand).toHaveBeenNthCalledWith(1, "vscode.diff", file, mockedVscode.Uri.file("template/file.txt"));
    });
});
