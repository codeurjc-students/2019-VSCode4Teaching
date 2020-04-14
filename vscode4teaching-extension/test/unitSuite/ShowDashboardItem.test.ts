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

});
