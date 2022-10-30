import { AxiosResponse } from "axios";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import * as extension from "../../src/extension";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseStatus } from "../../src/model/serverModel/exercise/ExerciseStatus";
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { FileInfo } from "../../src/model/serverModel/file/FileInfo";
import { User } from "../../src/model/serverModel/user/User";
import { NoteComment } from "../../src/services/NoteComment";
import { TeacherCommentService } from "../../src/services/TeacherCommentsService";
import { BasicNode, DiffBetweenDirectories, MergedTreeNode, QuickPickTreeNode } from "../../src/utils/DiffBetweenDirectories";
import { FileZipUtil } from "../../src/utils/FileZipUtil";
import { ZipInfo } from "../../src/utils/ZipInfo";
import { mockFsDirent } from "./__mocks__/mockFsUtils";
import { mockedPathJoin } from "./__mocks__/mockPathUtils";

jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/services/TeacherCommentsService");
const mockedTeacherCommentService = mocked(TeacherCommentService, true);
jest.mock("../../src/utils/DiffBetweenDirectories");
const mockedDiffBetweenDirectories = mocked(DiffBetweenDirectories, true);
jest.mock("../../src/utils/FileZipUtil");
const mockedFileZipUtil = mocked(FileZipUtil, true);

jest.mock("path");
const mockedPath = mocked(path, true);
jest.mock("fs");
const mockedFs = mocked(fs, true);
jest.mock("mkdirp");
const mockedMkdirp = mocked(mkdirp, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);


const ec: vscode.ExtensionContext = {
    subscriptions: [],
    workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn()
    },
    globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn()
    },
    secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn(),
        onDidChange: jest.fn()
    },
    extensionUri: mockedVscode.Uri.parse("test"),
    extensionPath: "test",
    environmentVariableCollection: {
        persistent: true,
        replace: jest.fn(),
        append: jest.fn(),
        prepend: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
    },
    asAbsolutePath: jest.fn(),
    storageUri: mockedVscode.Uri.parse("test"),
    storagePath: "test",
    globalStorageUri: mockedVscode.Uri.parse("test"),
    globalStoragePath: "test",
    logUri: mockedVscode.Uri.parse("test"),
    logPath: "test",
    extensionMode: 2,
    extension: {
        id: "test",
        extensionUri: mockedVscode.Uri.parse("test"),
        extensionPath: "test",
        isActive: true,
        packageJSON: {},
        extensionKind: 1,
        exports: {},
        activate: jest.fn()
    }
};

describe("Command implementations", () => {
    // Command tests
    const commandFunctions = Object.create(null);
    mockedVscode.commands.registerCommand.mockImplementation((commandId, commandFn) => {
        commandFunctions[commandId] = commandFn;
        return {
            dispose: jest.fn(),
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockedClient.initializeSessionFromFile.mockReturnValueOnce(false); // Initialization will be covered in another test
        extension.activate(ec);
    });

    // Tests are introduced in the same order commands are listed in extension.ts > context.subscriptions.push(...commands);

    it("should finish exercise correctly (student)", async () => {
        const warnMessage = "Finish exercise? When the exercise is marked as completed, it will not be possible to send new updates.";
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
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        };
        const eui: ExerciseUserInfo = {
            id: 3,
            status: ExerciseStatus.StatusEnum.FINISHED,
            user,
            exercise,
            updateDateTime: new Date().toISOString(),
            modifiedFiles: [],
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
        expect(mockedClient.updateExerciseUserInfo).toHaveBeenNthCalledWith(1, 2, ExerciseStatus.StatusEnum.FINISHED);
    });

    it("should download single student exercise files (student)", async () => {
        const courseName = "Test course";
        const exercise: Exercise = {
            id: 10,
            name: "Test exercise",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
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
        mockedFileZipUtil.studentExerciseZipInfo.mockReturnValueOnce(zipInfo);
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
        const exerciseUpdateResponse: AxiosResponse<ExerciseUserInfo> = {
            data: {
                exercise: exercise,
                status: ExerciseStatus.StatusEnum.IN_PROGRESS,
                user: user,
                id: 11,
                updateDateTime: ""
            },
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        const euiResponse: AxiosResponse<ExerciseUserInfo> = {
            data: {
                exercise: exercise,
                status: ExerciseStatus.StatusEnum.NOT_STARTED,
                user: user,
                id: 11,
                updateDateTime: ""
            },
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.getExerciseUserInfo.mockResolvedValueOnce(euiResponse);
        mockedClient.updateExerciseUserInfo.mockResolvedValueOnce(exerciseUpdateResponse);
        mockedVscode.workspace.updateWorkspaceFolders.mockReturnValueOnce(true);

        await commandFunctions["vscode4teaching.getexercisefiles"](courseName, exercise);

        expect(mockedFileZipUtil.studentExerciseZipInfo).toHaveBeenCalledTimes(1);
        expect(mockedFileZipUtil.studentExerciseZipInfo).toHaveBeenNthCalledWith(1, courseName, exercise);
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
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenNthCalledWith(1, 0, 0, {
            uri: mockedVscode.Uri.file(zipInfo.dir),
            name: exercise.name
        });
    });

    it("should download all student's files of exercise without solution (teacher)", async () => {
        const courseName = "Test course";
        const exercise: Exercise = {
            id: 10,
            name: "Test exercise",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
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
        mockedFileZipUtil.studentExerciseZipInfo.mockReturnValueOnce(zipInfo);
        mockedFileZipUtil.teacherExerciseZipInfo.mockReturnValueOnce(templateZipInfo);
        mockedFileZipUtil.filesFromZip.mockResolvedValueOnce(templateZipInfo.dir).mockResolvedValueOnce(zipInfo.dir);

        mockedFs.readdirSync.mockReturnValueOnce([
            mockFsDirent("student_11", true),
            mockFsDirent("student_12", true),
            mockFsDirent("errorfile.txt", false),
            mockFsDirent("template", true)
        ]);
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);
        mockedPath.resolve
                  .mockReturnValueOnce("fileInfo")
                  .mockReturnValueOnce("fileInfo/johndoejr.json")
                  .mockReturnValueOnce("fileInfo/johndoejr2.json")
                  .mockReturnValueOnce("newWorkspace/template")
                  .mockReturnValueOnce("newWorkspace/student_11")
                  .mockReturnValueOnce("newWorkspace/student_12");
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

        expect(mockedFileZipUtil.teacherExerciseZipInfo).toHaveBeenCalledTimes(2);
        expect(mockedFileZipUtil.teacherExerciseZipInfo).toHaveBeenNthCalledWith(1, courseName, exercise, "template");
        expect(mockedFileZipUtil.teacherExerciseZipInfo).toHaveBeenNthCalledWith(2, courseName, exercise);
        expect(mockedFileZipUtil.filesFromZip).toHaveBeenCalledTimes(2);
        expect(mockedCurrentUser.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(mockedCurrentUser.getUserInfo).toHaveBeenCalledTimes(1);
        expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
        expect(mockedMkdirp.sync).toHaveBeenCalledTimes(1);
        expect(mockedMkdirp.sync).toHaveBeenNthCalledWith(1, "fileInfo");
        expect(mockedClient.getFilesInfo).toHaveBeenCalledTimes(2);
        expect(mockedClient.getFilesInfo).toHaveBeenNthCalledWith(1, "student_11", exercise.id);
        expect(mockedClient.getFilesInfo).toHaveBeenNthCalledWith(2, "student_12", exercise.id);
        expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
        expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(1, "fileInfo/johndoejr.json", JSON.stringify(fileInfoResponse1.data), { encoding: "utf8" });
        expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(2, "fileInfo/johndoejr2.json", JSON.stringify(fileInfoResponse2.data), { encoding: "utf8" });
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenNthCalledWith(1, 0, 0,
            { uri: mockedVscode.Uri.file("newWorkspace/template") },
            { uri: mockedVscode.Uri.file("newWorkspace/student_11") },
            { uri: mockedVscode.Uri.file("newWorkspace/student_12") });
    });

    it("should download all student's files of exercise with solution (teacher)", async () => {
        const courseName = "Test course";
        const exercise: Exercise = {
            id: 10,
            name: "Test exercise",
            includesTeacherSolution: true,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
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
        const solutionZipInfo: ZipInfo = {
            dir: "newWorkspace/template",
            zipDir: "zipDir",
            zipName: "10-solution.zip",
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
        mockedFileZipUtil.studentExerciseZipInfo.mockReturnValueOnce(zipInfo);
        mockedFileZipUtil.teacherExerciseZipInfo.mockImplementation(
            (course, exercise, resourceType) =>
                (resourceType === "template") ? templateZipInfo : solutionZipInfo
        );
        mockedFileZipUtil.filesFromZip
                         .mockResolvedValueOnce(templateZipInfo.dir)
                         .mockResolvedValueOnce(zipInfo.dir)
                         .mockResolvedValueOnce(solutionZipInfo.dir);

        mockedFs.readdirSync.mockReturnValueOnce([
            mockFsDirent("student_11", true),
            mockFsDirent("student_12", true),
            mockFsDirent("errorfile.txt", false),
            mockFsDirent("template", true),
            mockFsDirent("solution", true),
        ]);
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);
        mockedPath.resolve
                  .mockReturnValueOnce("fileInfo")
                  .mockReturnValueOnce("fileInfo/johndoejr.json")
                  .mockReturnValueOnce("fileInfo/johndoejr2.json")
                  .mockReturnValueOnce("newWorkspace/template")
                  .mockReturnValueOnce("newWorkspace/solution")
                  .mockReturnValueOnce("newWorkspace/student_11")
                  .mockReturnValueOnce("newWorkspace/student_12");
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

        expect(mockedFileZipUtil.teacherExerciseZipInfo).toHaveBeenCalledTimes(3);
        expect(mockedFileZipUtil.teacherExerciseZipInfo).toHaveBeenNthCalledWith(1, courseName, exercise, "template");
        expect(mockedFileZipUtil.teacherExerciseZipInfo).toHaveBeenNthCalledWith(2, courseName, exercise);
        expect(mockedFileZipUtil.teacherExerciseZipInfo).toHaveBeenNthCalledWith(3, courseName, exercise, "solution");
        expect(mockedFileZipUtil.filesFromZip).toHaveBeenCalledTimes(3);
        expect(mockedCurrentUser.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(mockedCurrentUser.getUserInfo).toHaveBeenCalledTimes(1);
        expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
        expect(mockedMkdirp.sync).toHaveBeenCalledTimes(1);
        expect(mockedMkdirp.sync).toHaveBeenNthCalledWith(1, "fileInfo");
        expect(mockedClient.getFilesInfo).toHaveBeenCalledTimes(2);
        expect(mockedClient.getFilesInfo).toHaveBeenNthCalledWith(1, "student_11", exercise.id);
        expect(mockedClient.getFilesInfo).toHaveBeenNthCalledWith(2, "student_12", exercise.id);
        expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
        expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(1, "fileInfo/johndoejr.json", JSON.stringify(fileInfoResponse1.data), { encoding: "utf8" });
        expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(2, "fileInfo/johndoejr2.json", JSON.stringify(fileInfoResponse2.data), { encoding: "utf8" });
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.updateWorkspaceFolders).toHaveBeenNthCalledWith(1, 0, 0,
            { uri: mockedVscode.Uri.file("newWorkspace/template") },
            { uri: mockedVscode.Uri.file("newWorkspace/solution") },
            { uri: mockedVscode.Uri.file("newWorkspace/student_11") },
            { uri: mockedVscode.Uri.file("newWorkspace/student_12") });
    });

    it("should run diff between student's exercise and template (teacher)", async () => {
        const file = mockedVscode.Uri.file("student_11/file.txt");
        const wf: vscode.WorkspaceFolder = {
            index: 0,
            name: "student_11",
            uri: mockedVscode.Uri.file("student_11"),
        };
        mockedVscode.workspace.getWorkspaceFolder.mockReturnValueOnce(wf);
        mockedPath.relative.mockReturnValueOnce("file.txt");
        extension.setTemplate("parentdir", "template");
        mockedPath.resolve.mockReturnValueOnce("parentdir");
        mockedPath.resolve.mockReturnValueOnce("template/file.txt");
        mockedFs.existsSync.mockReturnValueOnce(true);

        await commandFunctions["vscode4teaching.diff"](file);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(0);
        expect(mockedVscode.workspace.getWorkspaceFolder).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.getWorkspaceFolder).toHaveBeenNthCalledWith(1, file);
        expect(mockedPath.relative).toHaveBeenCalledTimes(1);
        expect(mockedPath.relative).toHaveBeenNthCalledWith(1, wf.uri.fsPath, file.fsPath);
        expect(mockedPath.resolve).toHaveBeenCalledTimes(2);
        expect(mockedPath.resolve).toHaveBeenNthCalledWith(1, "student_11", "..");
        expect(mockedPath.resolve).toHaveBeenNthCalledWith(2, "parentdir", "template", "file.txt");
        expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
        expect(mockedVscode.commands.executeCommand).toHaveBeenCalledTimes(1);
        expect(mockedVscode.commands.executeCommand).toHaveBeenNthCalledWith(1, "vscode.diff", mockedVscode.Uri.file("template/file.txt"), file);
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
        const route = path.sep === "/" ? "/v4t/johndoe/course/exercise/johndoejr/file.txt" : "e:\\v4t\\johndoe\\course\\exercise\\johndoejr\\file.txt";
        const threadMock: vscode.CommentThread = {
            uri: mockedVscode.Uri.parse(route),
            range: rangeMock,
            collapsibleState: mockedVscode.CommentThreadCollapsibleState.Expanded,
            canReply: true,
            comments: commentsMock,
            dispose: jest.fn()
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

    /**
     * PENDING traducir desde aquí hasta abajo del todo porque empieza la locura xD
     */
    it("should download teacher's solution when available (successful scenario) (student)", async () => {
        const user: User = {
            id: 1,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoejr"
        };
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);

        const exercise: Exercise = {
            id: 2,
            name: "Exercise",
            includesTeacherSolution: true,
            solutionIsPublic: true,
            allowEditionAfterSolutionDownloaded: false
        };
        extension.setFinishItem(exercise.id);
        extension.setDownloadTeacherSolutionItem(exercise);

        mockedVscode.window.showInformationMessage
            // First button: beginning of process
                    .mockResolvedValueOnce({ title: "Accept" })
            // Second button: to start diff with solution functionality (not covered in this test)
                    .mockResolvedValueOnce(undefined);

        const solutionZipInfo: ZipInfo = {
            dir: "newWorkspace/solution",
            zipDir: "zipDir",
            zipName: "1-solution.zip",
        };
        mockedFileZipUtil.studentSolutionZipInfo.mockReturnValueOnce(solutionZipInfo);
        mockedFileZipUtil.filesFromZip.mockResolvedValueOnce(solutionZipInfo.dir);

        const responseData: Buffer = Buffer.from("Test");
        mockedClient.getExerciseResourceById.mockResolvedValueOnce({
            status: 201,
            statusText: "",
            headers: {},
            config: {},
            data: responseData
        });

        await commandFunctions["vscode4teaching.downloadteachersolution"]();

        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(3);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(1, "The solution will then be downloaded. Once downloaded, the exercise will be marked as finished and it will not be possible to continue editing it.", { modal: true }, { title: "Accept" });
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(2, "The solution has been downloaded and the exercise has been marked as finished, so subsequent editions will not be saved.");
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(3, "To visualize the differences between the submitted proposal and the solution, you can click on this button or access the function in the toolbar.", { title: "Show diff with solution" });
        expect(mockedFileZipUtil.studentSolutionZipInfo).toHaveBeenCalledTimes(1);
        expect(mockedFileZipUtil.studentSolutionZipInfo).toHaveBeenNthCalledWith(1, exercise);
        expect(mockedFileZipUtil.filesFromZip).toHaveBeenCalledTimes(1);
    });

    it("should download teacher's solution when not published yet (fail scenario) (student)", async () => {
        const user: User = {
            id: 1,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoejr"
        };
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);

        const exercise: Exercise = {
            id: 2,
            name: "Exercise",
            includesTeacherSolution: true,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        };
        extension.setFinishItem(exercise.id);
        extension.setDownloadTeacherSolutionItem(exercise);

        mockedVscode.window.showInformationMessage.mockResolvedValueOnce({ title: "Accept" });

        await commandFunctions["vscode4teaching.downloadteachersolution"]();

        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(1, "The solution will then be downloaded. Once downloaded, the exercise will be marked as finished and it will not be possible to continue editing it.", { modal: true }, { title: "Accept" });
        expect(mockedFileZipUtil.studentSolutionZipInfo).toHaveBeenCalledTimes(0);
        expect(mockedFileZipUtil.filesFromZip).toHaveBeenCalledTimes(0);
    });

    /**
     * Tree 1
     * Graphic representation:
     *
     * A
     * ├─ B
     * │  ├─ F
     * │  ├─ G
     * │  ├─ H
     * ├─ C
     * │  ├─ I
     * ├─ D
     * ├─ E
     * │  ├─ J
     * │  │  ├─ L
     * │  │  ├─ M
     * │  ├─ K
     * │  │  ├─ N
     */
        // Level 4 nodes
    const tree1NodeL: BasicNode = { fileName: "L", children: [] };
    const tree1NodeM: BasicNode = { fileName: "M", children: [] };
    const tree1NodeN: BasicNode = { fileName: "N", children: [] };
    // Level 3 nodes
    const tree1NodeF: BasicNode = { fileName: "F", children: [] };
    const tree1NodeG: BasicNode = { fileName: "G", children: [] };
    const tree1NodeH: BasicNode = { fileName: "H", children: [] };
    const tree1NodeI: BasicNode = { fileName: "I", children: [] };
    const tree1NodeJ: BasicNode = { fileName: "J", children: [tree1NodeL, tree1NodeM] };
    const tree1NodeK: BasicNode = { fileName: "K", children: [tree1NodeN] };
    // Level 2 nodes
    const tree1NodeB: BasicNode = { fileName: "B", children: [tree1NodeF, tree1NodeG, tree1NodeH] };
    const tree1NodeC: BasicNode = { fileName: "C", children: [tree1NodeI] };
    const tree1NodeD: BasicNode = { fileName: "D", children: [] };
    const tree1NodeE: BasicNode = { fileName: "E", children: [tree1NodeJ, tree1NodeK] };
    // Level 1: root node
    const tree1RootNode: BasicNode = { fileName: "A", children: [tree1NodeB, tree1NodeC, tree1NodeD, tree1NodeE] };

    /**
     * Tree 2
     * Graphic representation:
     *
     * Z
     * ├─ B
     * │  ├─ G
     * │  ├─ H
     * │  ├─ T
     * ├─ C
     * │  ├─ I
     * ├─ E
     * │  ├─ K
     * │  │  ├─ N
     * ├─ X
     * │  ├─ S
     * │  │  ├─ R
     * ├─ Y
     * │  ├─ U
     * │  ├─ V
     * │  ├─ W
     */
    // Level 4 nodes
    const tree2NodeN: BasicNode = { fileName: "N", children: [] };
    const tree2NodeR: BasicNode = { fileName: "R", children: [] };
    // Level 3 nodes
    const tree2NodeG: BasicNode = { fileName: "G", children: [] };
    const tree2NodeH: BasicNode = { fileName: "H", children: [] };
    const tree2NodeT: BasicNode = { fileName: "T", children: [] };
    const tree2NodeI: BasicNode = { fileName: "I", children: [] };
    const tree2NodeK: BasicNode = { fileName: "K", children: [tree2NodeN] };
    const tree2NodeS: BasicNode = { fileName: "S", children: [tree2NodeR] };
    const tree2NodeU: BasicNode = { fileName: "U", children: [] };
    const tree2NodeV: BasicNode = { fileName: "V", children: [] };
    const tree2NodeW: BasicNode = { fileName: "W", children: [] };
    // Level 2 nodes
    const tree2NodeB: BasicNode = { fileName: "B", children: [tree2NodeG, tree2NodeH, tree2NodeT] };
    const tree2NodeC: BasicNode = { fileName: "C", children: [tree2NodeI] };
    const tree2NodeE: BasicNode = { fileName: "E", children: [tree2NodeK] };
    const tree2NodeX: BasicNode = { fileName: "X", children: [tree2NodeS] };
    const tree2NodeY: BasicNode = { fileName: "Y", children: [tree2NodeU, tree2NodeV, tree2NodeW] };
    // Level 1: root node
    const tree2RootNode: BasicNode = { fileName: "Z", children: [tree2NodeB, tree2NodeC, tree2NodeE, tree2NodeX, tree2NodeY] };

    /**
     * Tree 3
     * Graphic representation:
     *
     * A (0)
     * ├─ B (0)
     * │  ├─ F (-1)
     * │  ├─ G (0)
     * │  ├─ H (0)
     * │  ├─ T (1)
     * ├─ C (0)
     * │  ├─ I (0)
     * ├─ D (-1)
     * ├─ E (0)
     * │  ├─ J (-1)
     * │  │  ├─ L (-1)
     * │  │  ├─ M (-1)
     * │  ├─ K (0)
     * │  │  ├─ N (0)
     * ├─ X (1)
     * │  ├─ S (1)
     * │  │  ├─ R (1)
     * ├─ Y (1)
     * │  ├─ U (1)
     * │  ├─ V (1)
     * │  ├─ W (1)
     */
    // Level 4 nodes
    const tree3NodeL: MergedTreeNode = { value: "L", source: -1, children: [], originalNodes: { left: tree1NodeL } };
    const tree3NodeM: MergedTreeNode = { value: "M", source: -1, children: [], originalNodes: { left: tree1NodeM } };
    const tree3NodeN: MergedTreeNode = { value: "N", source: 0, children: [], originalNodes: { left: tree1NodeN, right: tree2NodeN } };
    const tree3NodeR: MergedTreeNode = { value: "R", source: 1, children: [], originalNodes: { right: tree2NodeR } };
    // Level 3 nodes
    const tree3NodeF: MergedTreeNode = { value: "F", source: -1, children: [], originalNodes: { left: tree1NodeF } };
    const tree3NodeG: MergedTreeNode = { value: "G", source: 0, children: [], originalNodes: { left: tree1NodeG, right: tree2NodeG } };
    const tree3NodeH: MergedTreeNode = { value: "H", source: 0, children: [], originalNodes: { left: tree1NodeH, right: tree2NodeH } };
    const tree3NodeT: MergedTreeNode = { value: "T", source: 1, children: [], originalNodes: { right: tree2NodeT } };
    const tree3NodeI: MergedTreeNode = { value: "I", source: 0, children: [], originalNodes: { left: tree1NodeI, right: tree2NodeI } };
    const tree3NodeJ: MergedTreeNode = { value: "J", source: -1, children: [tree3NodeL, tree3NodeM], originalNodes: { left: tree1NodeJ } };
    const tree3NodeK: MergedTreeNode = { value: "K", source: 0, children: [tree3NodeN], originalNodes: { left: tree1NodeK, right: tree2NodeK } };
    const tree3NodeS: MergedTreeNode = { value: "S", source: 1, children: [tree3NodeR], originalNodes: { right: tree2NodeS } };
    const tree3NodeU: MergedTreeNode = { value: "U", source: 1, children: [], originalNodes: { right: tree2NodeU } };
    const tree3NodeV: MergedTreeNode = { value: "V", source: 1, children: [], originalNodes: { right: tree2NodeV } };
    const tree3NodeW: MergedTreeNode = { value: "W", source: 1, children: [], originalNodes: { right: tree2NodeW } };
    // Level 2 nodes
    const tree3NodeB: MergedTreeNode = { value: "B", source: 0, children: [tree3NodeF, tree3NodeG, tree3NodeH, tree3NodeT], originalNodes: { left: tree1NodeB, right: tree2NodeB } };
    const tree3NodeC: MergedTreeNode = { value: "C", source: 0, children: [tree3NodeI], originalNodes: { left: tree1NodeC, right: tree2NodeC } };
    const tree3NodeD: MergedTreeNode = { value: "D", source: -1, children: [], originalNodes: { left: tree1NodeD } };
    const tree3NodeE: MergedTreeNode = { value: "E", source: 0, children: [tree3NodeJ, tree3NodeK], originalNodes: { left: tree1NodeE, right: tree2NodeE } };
    const tree3NodeX: MergedTreeNode = { value: "X", source: 1, children: [tree3NodeS], originalNodes: { right: tree2NodeX } };
    const tree3NodeY: MergedTreeNode = { value: "Y", source: 1, children: [tree3NodeU, tree3NodeV, tree3NodeW], originalNodes: { right: tree2NodeY } };
    // Level 1: root node
    const tree3RootNode: MergedTreeNode = { value: "A", source: 0, children: [tree3NodeB, tree3NodeC, tree3NodeD, tree3NodeE, tree3NodeX, tree3NodeY], originalNodes: { left: tree1RootNode, right: tree2RootNode } }

    /**
     * Tree 4
     * Graphic representation:
     *
     * Same structure as tree 3.
     */
    // Level 1: root node
    const quickPickTreeRootNode: QuickPickTreeNode = { label: "$(folder) A", source: 0, description: "Available in both left and right folder", children: [], relativePath: "", parent: undefined };
    // Level 2
    const quickPickTreeNodeB: QuickPickTreeNode = { label: "$(folder) B", source: 0, description: "Available in both left and right folder", children: [], relativePath: "B", parent: quickPickTreeRootNode };
    const quickPickTreeNodeC: QuickPickTreeNode = { label: "$(folder) C", source: 0, description: "Available in both left and right folder", children: [], relativePath: "C", parent: quickPickTreeRootNode };
    const quickPickTreeNodeD: QuickPickTreeNode = { label: "$(file) D", source: -1, description: "Only available in left folder", children: [], relativePath: "D", parent: quickPickTreeRootNode };
    const quickPickTreeNodeE: QuickPickTreeNode = { label: "$(folder) E", source: 0, description: "Available in both left and right folder", children: [], relativePath: "E", parent: quickPickTreeRootNode };
    const quickPickTreeNodeX: QuickPickTreeNode = { label: "$(folder) X", source: 1, description: "Only available in right folder", children: [], relativePath: "X", parent: quickPickTreeRootNode };
    const quickPickTreeNodeY: QuickPickTreeNode = { label: "$(folder) Y", source: 1, description: "Only available in right folder", children: [], relativePath: "Y", parent: quickPickTreeRootNode };
    // Level 3 nodes
    const quickPickTreeNodeF: QuickPickTreeNode = { label: "$(file) F", source: -1, description: "Only available in left folder", children: [], relativePath: "B/F", parent: quickPickTreeNodeB };
    const quickPickTreeNodeG: QuickPickTreeNode = { label: "$(file) G", source: 0, description: "Available in both left and right folder", children: [], relativePath: "B/G", parent: quickPickTreeNodeB };
    const quickPickTreeNodeH: QuickPickTreeNode = { label: "$(file) H", source: 0, description: "Available in both left and right folder", children: [], relativePath: "B/H", parent: quickPickTreeNodeB };
    const quickPickTreeNodeT: QuickPickTreeNode = { label: "$(file) T", source: 1, description: "Only available in right folder", children: [], relativePath: "B/T", parent: quickPickTreeNodeB };
    const quickPickTreeNodeI: QuickPickTreeNode = { label: "$(file) I", source: 0, description: "Available in both left and right folder", children: [], relativePath: "C/I", parent: quickPickTreeNodeC };
    const quickPickTreeNodeJ: QuickPickTreeNode = { label: "$(folder) J", source: -1, description: "Only available in left folder", children: [], relativePath: "E/J", parent: quickPickTreeNodeE };
    const quickPickTreeNodeK: QuickPickTreeNode = { label: "$(folder) K", source: 0, description: "Available in both left and right folder", children: [], relativePath: "E/K", parent: quickPickTreeNodeE };
    const quickPickTreeNodeS: QuickPickTreeNode = { label: "$(folder) S", source: 1, description: "Only available in right folder", children: [], relativePath: "X/S", parent: quickPickTreeNodeX };
    const quickPickTreeNodeU: QuickPickTreeNode = { label: "$(file) U", source: 1, description: "Only available in right folder", children: [], relativePath: "Y/U", parent: quickPickTreeNodeY };
    const quickPickTreeNodeV: QuickPickTreeNode = { label: "$(file) V", source: 1, description: "Only available in right folder", children: [], relativePath: "Y/V", parent: quickPickTreeNodeY };
    const quickPickTreeNodeW: QuickPickTreeNode = { label: "$(file) W", source: 1, description: "Only available in right folder", children: [], relativePath: "Y/W", parent: quickPickTreeNodeY };
    // Level 4 nodes
    const quickPickTreeNodeL: QuickPickTreeNode = { label: "$(file) L", source: -1, description: "Only available in left folder", children: [], relativePath: "E/J/L", parent: quickPickTreeNodeJ };
    const quickPickTreeNodeM: QuickPickTreeNode = { label: "$(file) M", source: -1, description: "Only available in left folder", children: [], relativePath: "E/J/M", parent: quickPickTreeNodeJ };
    const quickPickTreeNodeN: QuickPickTreeNode = { label: "$(file) N", source: 0, description: "Available in both left and right folder", children: [], relativePath: "E/K/N", parent: quickPickTreeNodeK };
    const quickPickTreeNodeR: QuickPickTreeNode = { label: "$(file) R", source: 1, description: "Only available in right folder", children: [], relativePath: "X/S/R", parent: quickPickTreeNodeS };
    // Definition of children lists
    // Level 1: root node
    quickPickTreeRootNode.children = [quickPickTreeNodeB, quickPickTreeNodeC, quickPickTreeNodeD, quickPickTreeNodeE, quickPickTreeNodeX, quickPickTreeNodeY];
    // Level 2
    quickPickTreeNodeB.children = [quickPickTreeNodeF, quickPickTreeNodeG, quickPickTreeNodeH, quickPickTreeNodeT];
    quickPickTreeNodeC.children = [quickPickTreeNodeI];
    quickPickTreeNodeE.children = [quickPickTreeNodeJ, quickPickTreeNodeK];
    quickPickTreeNodeX.children = [quickPickTreeNodeS];
    quickPickTreeNodeY.children = [quickPickTreeNodeU, quickPickTreeNodeV, quickPickTreeNodeW];
    // Level 3
    quickPickTreeNodeJ.children = [quickPickTreeNodeL, quickPickTreeNodeM];
    quickPickTreeNodeK.children = [quickPickTreeNodeN];
    quickPickTreeNodeS.children = [quickPickTreeNodeR];

    it("should let student check diff with solution when downloaded (case diff) (student)", async () => {
        const uri = {
            authority: "",
            fragment: "",
            fsPath: "test",
            path: "test",
            query: "",
            scheme: "file",
            with: jest.fn(),
            toJSON: jest.fn(),
            toString: jest.fn()
        };

        mockedVscode.workspace.workspaceFolders = [
            {
                index: 0,
                name: "Name",
                uri
            }
        ];

        mockedPath.resolve
            // First call: parent directory
                  .mockReturnValueOnce("test")
            // Second call: solution directory
                  .mockReturnValueOnce("test/solution");


        mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal
                                    .mockReturnValueOnce(tree1RootNode)
                                    .mockReturnValueOnce(tree2RootNode);

        mockedDiffBetweenDirectories.mergeDirectoryTrees.mockReturnValueOnce(tree3RootNode);

        mockedDiffBetweenDirectories.mergedTreeToQuickPickTree.mockReturnValueOnce(quickPickTreeRootNode);

        mockedDiffBetweenDirectories.directorySelectionQuickPick.mockResolvedValueOnce({
            relativePath: "file",
            source: 0
        });

        mockedPath.join.mockImplementation(mockedPathJoin);


        await commandFunctions["vscode4teaching.diffwithsolution"]();


        expect(mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal).toHaveBeenCalledTimes(2);
        expect(mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal).toHaveBeenNthCalledWith(1, "test", [/solution/, /^.*\.v4t$/]);
        expect(mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal).toHaveBeenNthCalledWith(2, "test/solution", [/^.*\.v4t$/]);
        expect(mockedDiffBetweenDirectories.mergeDirectoryTrees).toHaveBeenCalledTimes(1);
        expect(mockedDiffBetweenDirectories.mergeDirectoryTrees).toHaveBeenNthCalledWith(1, tree1RootNode, tree2RootNode);
        expect(mockedVscode.commands.executeCommand).toHaveBeenCalledTimes(1);
        expect(mockedVscode.commands.executeCommand).toHaveBeenNthCalledWith(1, "vscode.diff", { fsPath: "test/file" }, { fsPath: "test/solution/file" });
    });

    it("should let student check diff with solution when downloaded (case open) (student)", async () => {
        const uri = {
            authority: "",
            fragment: "",
            fsPath: "test",
            path: "test",
            query: "",
            scheme: "file",
            with: jest.fn(),
            toJSON: jest.fn(),
            toString: jest.fn()
        };

        mockedVscode.workspace.workspaceFolders = [
            {
                index: 0,
                name: "Name",
                uri
            }
        ];

        mockedPath.resolve
            // First call: parent directory
                  .mockReturnValueOnce("test")
            // Second call: solution directory
                  .mockReturnValueOnce("test/solution");


        mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal
                                    .mockReturnValueOnce(tree1RootNode)
                                    .mockReturnValueOnce(tree2RootNode);

        mockedDiffBetweenDirectories.mergeDirectoryTrees.mockReturnValueOnce(tree3RootNode);

        mockedDiffBetweenDirectories.mergedTreeToQuickPickTree.mockReturnValueOnce(quickPickTreeRootNode);

        mockedDiffBetweenDirectories.directorySelectionQuickPick.mockResolvedValueOnce({
            relativePath: "otherFile",
            source: 1
        });

        mockedPath.join.mockImplementation(mockedPathJoin);


        await commandFunctions["vscode4teaching.diffwithsolution"]();


        expect(mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal).toHaveBeenCalledTimes(2);
        expect(mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal).toHaveBeenNthCalledWith(1, "test", [/solution/, /^.*\.v4t$/]);
        expect(mockedDiffBetweenDirectories.deepFilteredDirectoryTraversal).toHaveBeenNthCalledWith(2, "test/solution", [/^.*\.v4t$/]);
        expect(mockedDiffBetweenDirectories.mergeDirectoryTrees).toHaveBeenCalledTimes(1);
        expect(mockedDiffBetweenDirectories.mergeDirectoryTrees).toHaveBeenNthCalledWith(1, tree1RootNode, tree2RootNode);
        expect(mockedVscode.commands.executeCommand).toHaveBeenCalledTimes(1);
        expect(mockedVscode.commands.executeCommand).toHaveBeenNthCalledWith(1, "vscode.open", { fsPath: "test/solution/otherFile" });
    });

});
