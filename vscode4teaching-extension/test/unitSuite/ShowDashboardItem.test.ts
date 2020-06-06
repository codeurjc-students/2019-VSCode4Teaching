import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { ShowDashboardItem } from "../../src/components/statusBarItems/dashboard/ShowDashboardItem";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

describe("ShowDashboardItem", () => {
    it("should create correctly", () => {
        const dashboardItem = new ShowDashboardItem("Test name", 2);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
        expect(dashboardItem.item.text).toBe("$(dashboard) Dashboard");
        expect(dashboardItem.item.tooltip).toBe("Dashboard");
        expect(dashboardItem.item.command).toBe("vscode4teaching.showdashboard");
        expect(dashboardItem.dashboardName).toBe("Test name");
        expect(dashboardItem.exerciseId).toBe(2);
    });

    it("should show correctly", () => {
        const item = new ShowDashboardItem("Test name", 1);
        item.show();
        expect(item.item.show).toHaveBeenCalledTimes(1);
    });

    it("should hide correctly", () => {
        const item = new ShowDashboardItem("Test name", 1);
        item.hide();
        expect(item.item.hide).toHaveBeenCalledTimes(1);
    });

    it("should dispose correctly", () => {
        const item = new ShowDashboardItem("Test name", 1);
        item.dispose();
        expect(item.item.dispose).toHaveBeenCalledTimes(1);
    });
});
