import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { CoursesProvider } from "../../src/components/courses/CoursesTreeProvider";
import * as extension from "../../src/extension";

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/components/courses/CoursesTreeProvider");
const mockedCoursesTreeProvider = mocked(CoursesProvider, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);

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
    ];
    function expectAllCommandsToBeRegistered(subscriptions: any[]) {
        expect(subscriptions).toHaveLength(commandIds.length);
        expect(mockedVscode.commands.registerCommand).toHaveBeenCalledTimes(commandIds.length);
        for (let i = 0; i < commandIds.length; i++) {
            expect(mockedVscode.commands.registerCommand.mock.calls[i][0]).toBe(commandIds[i]);
        }
    }
    it("should activate correctly", () => {
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

        mockedClient.initializeSessionFromFile.mockReturnValueOnce(false); // Initialization will be covered in another test

        extension.activate(ec);

        expect(mockedVscode.window.registerTreeDataProvider).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.registerTreeDataProvider).toHaveBeenNthCalledWith(1, "vscode4teachingview", extension.coursesProvider);
        expectAllCommandsToBeRegistered(ec.subscriptions);
    });
});
