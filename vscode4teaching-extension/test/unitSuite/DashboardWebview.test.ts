import * as cheerio from "cheerio";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { WebSocketV4TConnection } from "../../src/client/WebSocketV4TConnection";
import { DashboardWebview } from "../../src/components/dashboard/DashboardWebview";
import { Course } from "../../src/model/serverModel/course/Course";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { User } from "../../src/model/serverModel/user/User";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/WebSocketV4TConnection");
const mockedWebSocketV4TConnection = mocked(WebSocketV4TConnection, true);

jest.useFakeTimers();

describe("Dashboard webview", () => {
    it("should be created if it doesn't exist", () => {
        const course: Course = {
            id: 1,
            name: "Course",
            exercises: [],
        };
        const exercise: Exercise = {
            id: 1,
            name: "Exercise 1",
        };
        const student1: User = {
            id: 2,
            username: "student1",
            name: "Student",
            lastName: "1",
            roles: [{ roleName: "ROLE_STUDENT" }],
        };
        const student2: User = {
            id: 3,
            username: "student2",
            name: "Student",
            lastName: "2",
            roles: [{ roleName: "ROLE_STUDENT" }],
        };
        const student3: User = {
            id: 4,
            username: "student3",
            name: "Student",
            lastName: "3",
            roles: [{ roleName: "ROLE_STUDENT" }],
        };
        const euis: ExerciseUserInfo[] = [];
        let now = new Date(new Date().toLocaleString("en-US", { timeZone: "UTC" }));
        euis.push({
            id: 1,
            exercise,
            user: student1,
            status: 0,
            updateDateTime: new Date(new Date(now.setDate(now.getDate() - 1)).toISOString()).toISOString(),
            modifiedFiles: ["/index.html"],
        });
        now = new Date(new Date().toLocaleString("en-US", { timeZone: "UTC" }));
        euis.push({
            id: 2,
            exercise,
            user: student2,
            status: 1,
            updateDateTime: new Date(new Date(now.setMinutes(now.getMinutes() - 13)).toISOString()).toISOString(),
            modifiedFiles: ["/readme.md"],
        });
        now = new Date(new Date().toLocaleString("en-US", { timeZone: "UTC" }));
        euis.push({
            id: 3,
            exercise,
            user: student3,
            status: 2,
            updateDateTime: new Date(new Date(now.setSeconds(now.getSeconds() - 35)).toISOString()).toISOString(),
            modifiedFiles: undefined,
        });
        DashboardWebview.show(euis, course, exercise, true);
        if (DashboardWebview.currentPanel) {
            expect(global.setInterval).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createWebviewPanel.mock.calls[0][0]).toBe("v4tdashboard");
            expect(mockedVscode.window.createWebviewPanel.mock.calls[0][1]).toBe("V4T Dashboard: Exercise 1");
            expect(mockedVscode.window.createWebviewPanel.mock.calls[0][2]).toBe(mockedVscode.ViewColumn.One);
            if (mockedVscode.window.createWebviewPanel.mock.calls[0][3]) {
                expect(mockedVscode.window.createWebviewPanel.mock.calls[0][3].enableScripts).toBe(true);
                expect(mockedVscode.window.createWebviewPanel.mock.calls[0][3].localResourceRoots).toStrictEqual([mockedVscode.Uri.file(DashboardWebview.resourcesPath)]);
            } else {
                fail("Webview options argument missing");
            }
            const $ = cheerio.load(DashboardWebview.currentPanel.panel.webview.html);
            // Title is correct
            const title = $("title");
            expect(title.text()).toBe("V4T Dashboard: Exercise 1");
            // Hide student's names button exists and is checked on
            const hideStudentsNames = $("#hideStudentNames");
            expect(hideStudentsNames).toBeTruthy();
            expect(hideStudentsNames.val).toBeTruthy();
            // Table headers are correct
            const tableHeaders = $("th").toArray();
            expect(tableHeaders[0].firstChild.data?.trim()).toBe("Exercise folder");
            expect(tableHeaders[1].firstChild.data?.trim()).toBe("Exercise status");
            expect(tableHeaders[2].firstChild.data?.trim()).toBe("Last modified file");
            expect(tableHeaders[3].firstChild.data?.trim()).toBe("Last modification");
            // Table data is correct
            const tableData = $("td").toArray();
            expect(tableData[0].firstChild.data).toBe("student_1");
            expect(tableData[1].firstChild.data).toBe("Not started");
            expect(tableData[1].attribs.class).toBe("not-started-cell");
            expect(tableData[2].childNodes[0].name).toBe("button");
            expect(tableData[2].childNodes[0].firstChild.data).toBe("Open");
            expect(tableData[2].childNodes[1].name).toBe("button");
            expect(tableData[2].childNodes[1].firstChild.data).toBe("Diff");
            expect(tableData[4].firstChild.data).toBe("student_2");
            expect(tableData[5].firstChild.data).toBe("Finished");
            expect(tableData[5].attribs.class).toBe("finished-cell");
            expect(tableData[6].childNodes[0].name).toBe("button");
            expect(tableData[6].childNodes[0].firstChild.data).toBe("Open");
            expect(tableData[6].childNodes[1].name).toBe("button");
            expect(tableData[6].childNodes[1].firstChild.data).toBe("Diff");
            expect(tableData[8].firstChild.data).toBe("student_3");
            expect(tableData[9].firstChild.data).toBe("On progress");
            expect(tableData[9].attribs.class).toBe("onprogress-cell");
        } else {
            fail("Current panel wasn't created");
        }
    });
});
