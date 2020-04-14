import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { V4TStatusBarItem } from "../../src/components/statusBarItems/V4TStatusBarItem";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

describe("V4TStatusBarItem", () => {
    it("should create correctly", () => {
        const text = "Test";
        const icon = "test";
        const command = "vscode4teaching.finishexercise";
        const item = new V4TStatusBarItem(text, icon, command);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
        expect(item.item.text).toBe("$(test) Test");
        expect(item.item.tooltip).toBe(text);
        expect(item.item.command).toBe(command);
    });

    it("should show correctly", () => {
        const text = "Test";
        const icon = "test";
        const command = "vscode4teaching.finishexercise";
        const item = new V4TStatusBarItem(text, icon, command);
        item.show();
        expect(item.item.show).toHaveBeenCalledTimes(1);
    });

    it("should hide correctly", () => {
        const text = "Test";
        const icon = "test";
        const command = "vscode4teaching.finishexercise";
        const item = new V4TStatusBarItem(text, icon, command);
        item.hide();
        expect(item.item.hide).toHaveBeenCalledTimes(1);
    });

    it("should dispose correctly", () => {
        const text = "Test";
        const icon = "test";
        const command = "vscode4teaching.finishexercise";
        const item = new V4TStatusBarItem(text, icon, command);
        item.dispose();
        expect(item.item.dispose).toHaveBeenCalledTimes(1);
    });
});
