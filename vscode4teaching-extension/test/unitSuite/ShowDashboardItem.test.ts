import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { ShowDashboardItem } from "../../src/components/statusBarItems/dashboard/ShowDashboardItem";
import { Course } from "../../src/model/serverModel/course/Course";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

const course: Course = {
    id: 1,
    name: "Test course",
    exercises: [],
};
const exercise: Exercise = {
    id: 2,
    name: "Test exercise",
    course,
};
course.exercises.push(exercise);

describe("ShowDashboardItem", () => {
    it("should create correctly", () => {
        const dashboardItem = new ShowDashboardItem("Test name", course, exercise);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
        expect(dashboardItem.item.text).toBe("$(dashboard) Dashboard");
        expect(dashboardItem.item.tooltip).toBe("Dashboard");
        expect(dashboardItem.item.command).toBe("vscode4teaching.showdashboard");
        expect(dashboardItem.dashboardName).toBe("Test name");
        expect(dashboardItem.exercise).toBe(exercise);
        expect(dashboardItem.course).toBe(course);
    });

    it("should show correctly", () => {
        const item = new ShowDashboardItem("Test name", course, exercise);
        item.show();
        expect(item.item.show).toHaveBeenCalledTimes(1);
    });

    it("should hide correctly", () => {
        const item = new ShowDashboardItem("Test name", course, exercise);
        item.hide();
        expect(item.item.hide).toHaveBeenCalledTimes(1);
    });

    it("should dispose correctly", () => {
        const item = new ShowDashboardItem("Test name", course, exercise);
        item.dispose();
        expect(item.item.dispose).toHaveBeenCalledTimes(1);
    });
});
