import { AxiosResponse } from "axios";
import * as fs from "fs";
import * as JSZip from "jszip";
import * as path from "path";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { WebSocketV4TConnection } from "../../src/client/WebSocketV4TConnection";
import { CoursesProvider } from "../../src/components/courses/CoursesTreeProvider";
import * as extension from "../../src/extension";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { User } from "../../src/model/serverModel/user/User";
import { LiveShareService } from "../../src/services/LiveShareService";
import { TeacherCommentService } from "../../src/services/TeacherCommentsService";
import { FileIgnoreUtil } from "../../src/utils/FileIgnoreUtil";

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/components/courses/CoursesTreeProvider");
const mockedCoursesTreeProvider = mocked(CoursesProvider, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("path");
const mockedPath = mocked(path, true);
jest.mock("fs");
const mockedFs = mocked(fs, true);
jest.mock("../../src/services/TeacherCommentsService");
const mockedTeacherCommentService = mocked(TeacherCommentService, true);
jest.mock("../../src/utils/FileIgnoreUtil");
const mockedFileIgnoreUtil = mocked(FileIgnoreUtil, true);
jest.mock("jszip");
const mockedJSZip = mocked(JSZip, true);
jest.mock("../../src/services/LiveShareService");
const mockedLiveShareService = mocked(LiveShareService, true);
jest.mock("../../src/client/WebSocketV4TConnection");
const mockedWebSocketV4TConnection = mocked(WebSocketV4TConnection, true);

jest.useFakeTimers();

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

describe("Extension entry point", () => {
    const commandIds: string[] = [
        "vscode4teaching.login",
        "vscode4teaching.logout",
        "vscode4teaching.getexercisefiles",
        "vscode4teaching.getstudentfiles",
        "vscode4teaching.addcourse",
        "vscode4teaching.editcourse",
        "vscode4teaching.deletecourse",
        "vscode4teaching.refreshcourses",
        "vscode4teaching.refreshexercises",
        "vscode4teaching.addexercise",
        "vscode4teaching.editexercise",
        "vscode4teaching.deleteexercise",
        "vscode4teaching.adduserstocourse",
        "vscode4teaching.removeusersfromcourse",
        "vscode4teaching.diff",
        "vscode4teaching.createComment",
        "vscode4teaching.share",
        "vscode4teaching.signup",
        "vscode4teaching.signupteacher",
        "vscode4teaching.getwithcode",
        "vscode4teaching.finishexercise",
        "vscode4teaching.showdashboard",
        "vscode4teaching.showliveshareboard",
    ];
    function expectAllCommandsToBeRegistered(subscriptions: any[]) {
        expect(subscriptions).toHaveLength(commandIds.length);
        expect(mockedVscode.commands.registerCommand).toHaveBeenCalledTimes(commandIds.length);
        for (let i = 0; i < commandIds.length; i++) {
            expect(mockedVscode.commands.registerCommand.mock.calls[i][0]).toBe(commandIds[i]);
        }
    }
    it("should activate correctly", () => {

        mockedClient.initializeSessionFromFile.mockReturnValueOnce(false); // Initialization will be covered in another test

        extension.activate(ec);

        expect(mockedVscode.window.registerTreeDataProvider).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.registerTreeDataProvider).toHaveBeenNthCalledWith(1, "vscode4teachingview", extension.coursesProvider);
        expectAllCommandsToBeRegistered(ec.subscriptions);
    });

    it("should be initialized for students", async () => {
        const exercise: Exercise = {
            id: 50,
            name: "Exercise test",
        };
        const cwds: vscode.WorkspaceFolder[] = [
            {
                uri: mockedVscode.Uri.parse("testURL"),
                index: 0,
                name: exercise.name,
            },
        ];
        const zipLocation = path.sep === "/" ? "testZipLocation/" + exercise.id + ".zip" : "testZipLocation\\" + exercise.id + ".zip";
        const v4tjson = {
            zipLocation,
        };
        const user: User = {
            id: 40,
            roles: [{
                roleName: "ROLE_STUDENT",
            }],
            username: "johndoejr",
        };
        mockedCurrentUser.getUserInfo.mockReturnValue(user);
        const eui: ExerciseUserInfo = {
            exercise,
            user,
            status: 0,
            updateDateTime: new Date().toISOString(),
            modifiedFiles: [],
        };
        const euiResponse: AxiosResponse<ExerciseUserInfo> = {
            data: eui,
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };

        mockedClient.handleAxiosError.mockImplementation((error) => console.error(error));
        mockedClient.getExerciseUserInfo.mockResolvedValueOnce(euiResponse);

        mockedPath.resolve.mockReturnValueOnce("testParentURL").mockImplementation((x) => x);

        mockedVscode.window.showInformationMessage.mockResolvedValueOnce(undefined);

        mockedVscode.workspace.findFiles.mockResolvedValueOnce([mockedVscode.Uri.parse("testV4TLocation")]);
        const fswFunctionMocks: vscode.FileSystemWatcher = {
            dispose: jest.fn(),
            ignoreChangeEvents: false,
            ignoreCreateEvents: false,
            ignoreDeleteEvents: false,
            onDidChange: jest.fn(),
            onDidCreate: jest.fn(),
            onDidDelete: jest.fn(),
        };
        mockedVscode.workspace.createFileSystemWatcher.mockImplementation(() => fswFunctionMocks);

        const bufferMock = Buffer.from("test");
        mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(v4tjson)).mockReturnValue(bufferMock);
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readFile.mockImplementation((filePath, cb) => {
            cb(null, bufferMock);
        });

        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);

        mockedFileIgnoreUtil.recursiveReadGitIgnores.mockReturnValue([]);

        await extension.initializeExtension(cwds);

        expect(mockedClient.handleAxiosError).toHaveBeenCalledTimes(0);
        expect(extension.commentProvider?.addCwd).toHaveBeenCalledTimes(1);
        expect(extension.commentProvider?.getThreads).toHaveBeenCalledTimes(1);
        expect(extension.commentInterval).toBeTruthy();
        expect(global.setInterval).toHaveBeenCalledTimes(1);
        const intervalMock = (global.setInterval as jest.Mock);
        // expect getThreads function bound by its commentProvider as first argument of setInterval
        expect(Object.create(extension.commentProvider?.getThreads.prototype) instanceof intervalMock.mock.calls[0][0]).toBe(true);
        expect(intervalMock.mock.calls[0][1]).toBe(60000);
        expect(intervalMock.mock.calls[0][2]).toBe(exercise.id);
        expect(intervalMock.mock.calls[0][3]).toBe("johndoejr");
        expect(intervalMock.mock.calls[0][4]).toBe(cwds[0]);
        expect(intervalMock.mock.calls[0][5]).toBe(mockedClient.handleAxiosError);
        expect(mockedVscode.workspace.createFileSystemWatcher).toHaveBeenCalledTimes(1);
        expect(fswFunctionMocks.onDidChange).toHaveBeenCalledTimes(1);
        expect(fswFunctionMocks.onDidCreate).toHaveBeenCalledTimes(1);
        expect(fswFunctionMocks.onDidDelete).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.onWillSaveTextDocument).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.onDidSaveTextDocument).toHaveBeenCalledTimes(1);
        expect(mockedVscode.commands.executeCommand).toHaveBeenCalledTimes(2);
        expect(mockedVscode.commands.executeCommand).toHaveBeenNthCalledWith(1, "setContext", "vscode4teaching.isTeacher", false);
        expect(mockedVscode.commands.executeCommand).toHaveBeenNthCalledWith(2, "workbench.view.explorer");
        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        const message = `The exercise has been downloaded! You can start editing its files in the Explorer view. You can mark the exercise as finished using the 'Finish' button in the status bar below.`;
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(1, message);
        expect(extension.finishItem).toBeTruthy();
    });

});
