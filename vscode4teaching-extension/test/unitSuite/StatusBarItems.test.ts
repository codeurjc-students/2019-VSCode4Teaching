import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { ShowDashboardItem } from "../../src/components/statusBarItems/dashboard/ShowDashboardItem";
import { DiffWithSolutionItem } from "../../src/components/statusBarItems/exercises/DiffWithSolution";
import { DownloadTeacherSolutionItem } from "../../src/components/statusBarItems/exercises/DownloadTeacherSolution";
import { FinishItem } from "../../src/components/statusBarItems/exercises/FinishItem";
import { ShowLiveshareBoardItem } from "../../src/components/statusBarItems/liveshare/ShowLiveshareBoardItem";
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
    includesTeacherSolution: true,
    solutionIsPublic: true,
    allowEditionAfterSolutionDownloaded: false
};
course.exercises.push(exercise);

describe("Status Bar items", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Finish exercise (student)", () => {
        it("should create correctly", () => {
            const finishItem = new FinishItem(1);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
            expect(finishItem.item.text).toBe("$(checklist) Finish exercise");
            expect(finishItem.item.tooltip).toBe("Finish exercise");
            expect(finishItem.item.command).toBe("vscode4teaching.finishexercise");
            expect(finishItem.getExerciseId()).toBe(1);
        });

        it("should show correctly", () => {
            const item = new FinishItem(1);
            item.show();
            expect(item.item.show).toHaveBeenCalledTimes(1);
        });

        it("should hide correctly", () => {
            const item = new FinishItem(1);
            item.hide();
            expect(item.item.hide).toHaveBeenCalledTimes(1);
        });

        it("should dispose correctly", () => {
            const item = new FinishItem(1);
            item.dispose();
            expect(item.item.dispose).toHaveBeenCalledTimes(1);
        });
    });


    describe("Show dashboard (teacher)", () => {
        it("should create correctly", () => {
            const dashboardItem = new ShowDashboardItem("Test name", course, exercise);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
            expect(dashboardItem.item.text).toBe("$(dashboard) Dashboard");
            expect(dashboardItem.item.tooltip).toBe("Dashboard");
            expect(dashboardItem.item.command).toBe("vscode4teaching.showcurrentexercisedashboard");
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

    describe("Download teacher's solution (student)", () => {
        it("should create correctly", () => {
            const exerciseItem = new DownloadTeacherSolutionItem(exercise);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
            expect(exerciseItem.item.text).toBe("$(cloud-download) Download teacher's solution");
            expect(exerciseItem.item.tooltip).toBe("Download teacher's solution");
            expect(exerciseItem.item.command).toBe("vscode4teaching.downloadteachersolution");
            expect(exerciseItem.getExerciseInfo()).toBe(exercise);
        });

        it("should show correctly", () => {
            const item = new DownloadTeacherSolutionItem(exercise);
            item.show();
            expect(item.item.show).toHaveBeenCalledTimes(1);
        });

        it("should hide correctly", () => {
            const item = new DownloadTeacherSolutionItem(exercise);
            item.hide();
            expect(item.item.hide).toHaveBeenCalledTimes(1);
        });

        it("should dispose correctly", () => {
            const item = new DownloadTeacherSolutionItem(exercise);
            item.dispose();
            expect(item.item.dispose).toHaveBeenCalledTimes(1);
        });
    });

    describe("Diff with solution (student)", () => {
        it("should create correctly", () => {
            const diffWithSolutionItem = new DiffWithSolutionItem();
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
            expect(diffWithSolutionItem.item.text).toBe("$(diff) Diff with teacher's solution");
            expect(diffWithSolutionItem.item.tooltip).toBe("Diff with teacher's solution");
            expect(diffWithSolutionItem.item.command).toBe("vscode4teaching.diffwithsolution");
        });

        it("should show correctly", () => {
            const item = new DiffWithSolutionItem();
            item.show();
            expect(item.item.show).toHaveBeenCalledTimes(1);
        });

        it("should hide correctly", () => {
            const item = new DiffWithSolutionItem();
            item.hide();
            expect(item.item.hide).toHaveBeenCalledTimes(1);
        });

        it("should dispose correctly", () => {
            const item = new DiffWithSolutionItem();
            item.dispose();
            expect(item.item.dispose).toHaveBeenCalledTimes(1);
        });
    });

    describe("Show LiveShare board (student, teacher)", () => {
        const dashboardName = "Course's Dashboard";

        it("should create correctly", () => {
            const diffWithSolutionItem = new ShowLiveshareBoardItem(dashboardName, [course]);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
            expect(diffWithSolutionItem.item.text).toBe("$(live-share) Liveshare Board");
            expect(diffWithSolutionItem.item.tooltip).toBe("Liveshare Board");
            expect(diffWithSolutionItem.item.command).toBe("vscode4teaching.showliveshareboard");
        });

        it("should show correctly", () => {
            const item = new ShowLiveshareBoardItem(dashboardName, [course]);
            item.show();
            expect(item.item.show).toHaveBeenCalledTimes(1);
        });

        it("should return item's attributes correctly", () => {
            const item = new ShowLiveshareBoardItem(dashboardName, [course]);
            expect(item.dashboardName).toStrictEqual(dashboardName);
            expect(item.getCourses).toStrictEqual([course]);
        });

        it("should hide correctly", () => {
            const item = new ShowLiveshareBoardItem(dashboardName, [course]);
            item.hide();
            expect(item.item.hide).toHaveBeenCalledTimes(1);
        });

        it("should dispose correctly", () => {
            const item = new ShowLiveshareBoardItem(dashboardName, [course]);
            item.dispose();
            expect(item.item.dispose).toHaveBeenCalledTimes(1);
        });
    });
});