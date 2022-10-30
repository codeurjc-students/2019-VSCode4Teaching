import { parse } from 'node-html-parser';
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { DashboardWebview } from '../../src/components/dashboard/DashboardWebview';
import { Course } from "../../src/model/serverModel/course/Course";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseStatus } from '../../src/model/serverModel/exercise/ExerciseStatus';
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { User } from "../../src/model/serverModel/user/User";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

jest.useFakeTimers();

describe("Dashboard Webview", () => {
    beforeEach(() => {
        Date.now = jest.fn(() => new Date().valueOf());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be created if it doesn't exist", () => {
        const course: Course = {
            id: 1,
            name: "Course",
            exercises: [],
        };

        const exercise: Exercise = {
            id: 1,
            name: "Exercise 1",
            includesTeacherSolution: true,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: true
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
        const student4: User = {
            id: 5,
            username: "student4",
            name: "Student",
            lastName: "4",
            roles: [{ roleName: "ROLE_STUDENT" }],
        };

        const euis: ExerciseUserInfo[] = [];
        let now = new Date(new Date().toLocaleString("en-US"));
        euis.push({
            id: 1,
            exercise,
            user: student1,
            status: ExerciseStatus.StatusEnum.NOT_STARTED,
            updateDateTime: new Date(new Date(now.setHours(now.getHours() - 3)).toISOString()).toISOString(),
            modifiedFiles: ["/index.html"],
        });
        now = new Date(new Date().toLocaleString("en-US"));
        euis.push({
            id: 2,
            exercise,
            user: student2,
            status: ExerciseStatus.StatusEnum.FINISHED,
            updateDateTime: new Date(new Date(now.setMinutes(now.getMinutes() - 13)).toISOString()).toISOString(),
            modifiedFiles: ["/readme.md"],
        });
        now = new Date(new Date().toLocaleString("en-US"));
        euis.push({
            id: 3,
            exercise,
            user: student3,
            status: ExerciseStatus.StatusEnum.IN_PROGRESS,
            updateDateTime: new Date(new Date(now.setSeconds(now.getSeconds() - 35)).toISOString()).toISOString(),
            modifiedFiles: undefined,
        });
        euis.push({
            id: 4,
            exercise,
            user: student4,
            status: ExerciseStatus.StatusEnum.IN_PROGRESS,
            updateDateTime: new Date(new Date(now.setHours(now.getHours() - 1)).toISOString()).toISOString(),
            modifiedFiles: undefined,
        });

        DashboardWebview.show(euis, course, exercise, true);

        if (DashboardWebview.currentPanel) {
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

            expect(global.setInterval).toHaveBeenCalledTimes(2);

            const generatedHTML = parse(DashboardWebview.currentPanel.panel.webview.html);
            // HTML <title> is correct
            const tabTitle = generatedHTML.querySelector("title");
            expect(tabTitle?.innerHTML).toBe("V4T Dashboard: Exercise 1");
            // "Preview mode alert" and "No students registered" alertsshould not be shown
            const shownAlerts = generatedHTML.querySelector(".alert-info");
            expect(shownAlerts).toBeNull();
            // Headers (H1 and H2) are correct
            const h1 = generatedHTML.querySelector("h1");
            expect(h1?.innerText).toBe("Course");
            const h2 = generatedHTML.querySelector("h2");
            expect(h2?.innerText).toBe("Exercise 1");
            // General Statistics > Column 1 (chart) should receive proper values
            const canvas = generatedHTML.querySelectorAll("canvas");
            expect(canvas.length).toBe(1);
            expect(canvas[0].attributes["data-notstarted"]).toBe("1");
            expect(canvas[0].attributes["data-inprogress"]).toBe("2");
            expect(canvas[0].attributes["data-finished"]).toBe("1");
            // General Statistics > Column 2 contains proper values
            const rowTotals = generatedHTML.querySelectorAll(".rowTotals");
            expect(rowTotals.length).toBe(1);
            const rowTotalsValue = rowTotals[0].querySelectorAll(".value");
            expect(rowTotalsValue.length).toBe(1);
            expect(rowTotalsValue[0].innerText).toBe("4");
            const rowsStatusChildren = generatedHTML.querySelectorAll(".rowStatus > .status");
            expect(rowsStatusChildren.length).toBe(3);
            const rowStatusChildrenNotStarted = rowsStatusChildren[0].querySelectorAll(".value");
            expect(rowStatusChildrenNotStarted.length).toBe(1);
            expect(rowStatusChildrenNotStarted[0].innerText).toBe("1");
            const rowStatusChildrenInProgress = rowsStatusChildren[1].querySelectorAll(".value");
            expect(rowStatusChildrenInProgress.length).toBe(1);
            expect(rowStatusChildrenInProgress[0].innerText).toBe("2");
            const rowStatusChildrenFinished = rowsStatusChildren[2].querySelectorAll(".value");
            expect(rowStatusChildrenFinished.length).toBe(1);
            expect(rowStatusChildrenFinished[0].innerText).toBe("1");
            // General Statistics > Column 3 contains proper values
            const rowsTime = generatedHTML.querySelectorAll(".rowTime");
            expect(rowsTime.length).toBe(4);
            const rowsTimeValue5Min = rowsTime[0].querySelector("#timeValue5");
            expect(rowsTimeValue5Min?.innerText).toBe("1");
            const rowsTimeValue30Min = rowsTime[1].querySelector("#timeValue30");
            expect(rowsTimeValue30Min?.innerText).toBe("2");
            const rowsTimeValue60Min = rowsTime[2].querySelector("#timeValue60");
            expect(rowsTimeValue60Min?.innerText).toBe("2");
            const rowsTimeValue120Min = rowsTime[3].querySelector("#timeValue120");
            expect(rowsTimeValue120Min?.innerText).toBe("3");
            // Exercise Configuration contains proper checkboxes
            // For specified expected exercise, first checkbox should be unchecked and second should be checked
            const checkboxes = generatedHTML.querySelectorAll(".exerciseConfiguration .option");
            expect(checkboxes.length).toBe(2);
            const checkboxPublishSolution = checkboxes[0].querySelector("#publishSolution");
            expect(checkboxPublishSolution?.attributes["checked"]).toBeUndefined();
            expect(checkboxPublishSolution?.attributes["disabled"]).toBeUndefined();
            const checkboxAllowEditionAfterSolutionDownloaded = checkboxes[1].querySelector("#allowEditionAfterSolutionDownloaded");
            expect(checkboxAllowEditionAfterSolutionDownloaded?.attributes["checked"]).not.toBeUndefined();
            expect(checkboxAllowEditionAfterSolutionDownloaded?.attributes["disabled"]).toBeUndefined();
            // Student's progress table does not show student's names
            const hideStudentsNamesOption = generatedHTML.querySelectorAll(".studentsProgress .option");
            expect(hideStudentsNamesOption.length).toBe(1);
            const hideStudentsNamesInput = hideStudentsNamesOption[0].querySelector("input");
            expect(hideStudentsNamesInput?.attributes["checked"]).not.toBeUndefined();
            // Student's progress table contains proper values
            const tableHeaders = generatedHTML.querySelectorAll("th");
            expect(tableHeaders.length).toBe(4);
            expect(tableHeaders[0].innerText.trim()).toBe("Exercise folder");
            expect(tableHeaders[1].innerText.trim()).toBe("Exercise status");
            expect(tableHeaders[2].innerText.trim()).toBe("Last modification");
            expect(tableHeaders[3].innerText.trim()).toBe("Actions");
            // Table data is correct
            const tableData = generatedHTML.querySelectorAll("td");
            expect(tableData.length).toBe(4 * 4); // 4 columns * 4 students
            // Row 1: student 1
            // Cell 0: exercise folder
            expect(tableData[0].innerText).toBe("student_1");
            // Cell 1: exercise status
            expect(tableData[1].innerText).toBe("Not started");
            expect(tableData[1].classNames).toBe("not-started-cell");
            // Cell 2: last modification
            expect(tableData[2].innerText).toBe("3 h");
            // Cell 3: actions
            expect(tableData[3].childNodes.length).toBe(2);
            expect(tableData[3].childNodes[0].innerText).toBe("Open");
            expect(tableData[3].childNodes[1].innerText).toBe("Diff");
            // Row 2: student 2
            // Cell 4: exercise folder
            expect(tableData[4].innerText).toBe("student_2");
            // Cell 5: exercise status
            expect(tableData[5].innerText).toBe("Finished");
            expect(tableData[5].classNames).toBe("finished-cell");
            // Cell 6: last modification
            expect(tableData[6].innerText).toBe("13 min");
            // Cell 7: actions
            expect(tableData[7].childNodes.length).toBe(2);
            expect(tableData[7].childNodes[0].innerText).toBe("Open");
            expect(tableData[7].childNodes[1].innerText).toBe("Diff");
            // Row 3: student 3
            // Cell 8: exercise folder
            expect(tableData[8].innerText).toBe("student_3");
            // Cell 9: exercise status
            expect(tableData[9].innerText).toBe("In progress");
            expect(tableData[9].classNames).toBe("inprogress-cell");
            // Cell 10: last modification
            expect(tableData[10].innerText).toBe("35 s");
            // Cell 11: actions
            expect(tableData[11].childNodes.length).toBe(2);
            expect(tableData[11].childNodes[0].innerText).toBe("Open");
            expect(tableData[11].childNodes[1].innerText).toBe("Diff");
            // Row 3: student 3
            // Cell 12: exercise folder
            expect(tableData[12].innerText).toBe("student_4");
            // Cell 13: exercise status
            expect(tableData[13].innerText).toBe("In progress");
            expect(tableData[13].classNames).toBe("inprogress-cell");
            // Cell 14: last modification
            expect(tableData[14].innerText).toBe("1 h");
            // Cell 15: actions
            expect(tableData[15].childNodes.length).toBe(2);
            expect(tableData[15].childNodes[0].innerText).toBe("Open");
            expect(tableData[15].childNodes[1].innerText).toBe("Diff");
        } else {
            fail("Current panel wasn't created");
        }
    });
});
