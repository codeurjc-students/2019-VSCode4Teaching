import * as cheerio from "cheerio";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { DashboardWebview } from "../../src/components/statusBarItems/dashboard/DashboardWebview";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { User } from "../../src/model/serverModel/user/User";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

describe("Dashboard webview", () => {
    it("should be created if it doesn't exist", () => {
        const exercise: Exercise = {
            id: 1,
            name: "Exercise 1",
        };
        const student1: User = {
            id: 2,
            username: "student1",
            name: "Student",
            lastName: "1",
            roles: [
                { roleName: "ROLE_STUDENT" },
            ],
        };
        const student2: User = {
            id: 3,
            username: "student2",
            name: "Student",
            lastName: "2",
            roles: [
                { roleName: "ROLE_STUDENT" },
            ],
        };
        const euis: ExerciseUserInfo[] = [];
        euis.push({
            exercise,
            user: student1,
            finished: false,
        });
        euis.push({
            exercise,
            user: student2,
            finished: true,
        });
        DashboardWebview.show(euis);
        if (DashboardWebview.currentPanel) {
            expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createWebviewPanel).toHaveBeenLastCalledWith(
                "v4tdashboard", "V4T Dashboard: Exercise 1", mockedVscode.ViewColumn.One,
            );
            const $ = cheerio.load(DashboardWebview.currentPanel.panel.webview.html);
            // Title is correct
            const title = $("title");
            expect(title.text()).toBe("V4T Dashboard: Exercise 1");
            // Table headers are correct
            const tableHeaders = $("th");
            expect(tableHeaders[0].firstChild.data).toBe("Full name");
            expect(tableHeaders[1].firstChild.data).toBe("Username");
            expect(tableHeaders[2].firstChild.data).toBe("Exercise status");
            // Table data is correct
            const tableData = $("td");
            expect(tableData[0].firstChild.data).toBe("Student 1");
            expect(tableData[1].firstChild.data).toBe("student1");
            expect(tableData[2].firstChild.data).toBe("On progress");
            expect(tableData[2].attribs.style).toBe("background-color: #c66900;");
            expect(tableData[3].firstChild.data).toBe("Student 2");
            expect(tableData[4].firstChild.data).toBe("student2");
            expect(tableData[5].firstChild.data).toBe("Finished");
            expect(tableData[5].attribs.style).toBe("background-color: #087f23;");
        } else {
            fail("Current panel wasn't created");
        }
    });
});
