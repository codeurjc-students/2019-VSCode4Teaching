import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { CoursesProvider } from "../../src/components/courses/CoursesTreeProvider";
import { V4TItem } from "../../src/components/courses/V4TItem/V4TItem";
import { V4TItemType } from "../../src/components/courses/V4TItem/V4TItemType";
import { User } from "../../src/model/serverModel/user/User";

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

let coursesProvider = new CoursesProvider();
const mockedUserModel: User = {
    id: 1,
    username: "johndoe",
    roles: [{
        roleName: "ROLE_STUDENT",
    }],
    courses: [
        {
            id: 2,
            name: "Test course 1",
            exercises: [
                {
                    id: 4,
                    name: "Exercise 1",
                },
                {
                    id: 40,
                    name: "Exercise 2",
                },
            ],
        },
        {
            id: 3,
            name: "Test course 2",
            exercises: [
                {
                    id: 5,
                    name: "Exercise 1",
                },
            ],
        },
    ],
};
let mockedUser = mockedUserModel;
describe("Tree View", () => {
    afterEach(() => {
        mockedCurrentUser.isLoggedIn.mockClear();
        mockedCurrentUser.updateUserInfo.mockClear();
        mockedVscode.EventEmitter.mockClear();
        mockedClient.initializeSessionFromFile.mockClear();
        coursesProvider = new CoursesProvider();
        mockedUser = mockedUserModel;
    });

    it("should show log in buttons when not logged in and session could not be initialized", () => {
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
            expect(elements).toStrictEqual([LOGIN_ITEM, SIGNUP_ITEM]);
        } else {
            fail("No elements returned");
        }
    });

    it("should update user info when session is initialized", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => false);
        mockedClient.initializeSessionFromFile.mockImplementation(() => true);
        mockedCurrentUser.updateUserInfo.mockImplementation(() => Promise.resolve(mockedUser));

        const elements = coursesProvider.getChildren();
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
        expect(elements).toStrictEqual([]); // Don't return anything while updating
    });
});
