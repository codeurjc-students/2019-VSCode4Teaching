import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { CoursesProvider } from "../../src/components/courses/CoursesTreeProvider";
import { V4TItem } from "../../src/components/courses/V4TItem/V4TItem";
import { V4TItemType } from "../../src/components/courses/V4TItem/V4TItemType";

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

let coursesProvider = new CoursesProvider();

describe("Tree View", () => {
    afterEach(() => {
        mockedCurrentUser.isLoggedIn.mockClear();
        mockedClient.initializeSessionFromFile.mockClear();
        coursesProvider = new CoursesProvider();
    });

    it("should show log in buttons", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => false);
        mockedClient.initializeSessionFromFile.mockImplementation(() => false);
        const LOGIN_ITEM = new V4TItem("Login", V4TItemType.Login, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
            command: "vscode4teaching.login",
            title: "Log in to VS Code 4 Teaching",
        });
        const SIGNUP_ITEM = new V4TItem("Sign up", V4TItemType.Signup, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
            command: "vscode4teaching.signup",
            title: "Sign up in VS Code 4 Teaching",
        });
        const elements = coursesProvider.getChildren();
        if (elements) {
            expect(elements.toString()).toBe(new Array([LOGIN_ITEM, SIGNUP_ITEM]).toString());
        } else {
            fail("No elements returned");
        }
    });
});
