import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { FinishItem } from "../../src/components/exercises/FinishItem";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

describe("FinishItem", () => {
    it("should create correctly", () => {
        const finishItem = new FinishItem(1);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
        expect(finishItem.finishItem.text).toBe("$(checklist) Finish exercise");
        expect(finishItem.finishItem.tooltip).toBe("Finish exercise");
        expect(finishItem.finishItem.command).toBe("vscode4teaching.finishexercise");
        expect(finishItem.getExerciseId()).toBe(1);
    });

    it("should show correctly", () => {
        const finishItem = new FinishItem(1);
        finishItem.show();
        expect(finishItem.finishItem.show).toHaveBeenCalledTimes(1);
    });

    it("should hide correctly", () => {
        const finishItem = new FinishItem(1);
        finishItem.hide();
        expect(finishItem.finishItem.hide).toHaveBeenCalledTimes(1);
    });

    it("should dispose correctly", () => {
        const finishItem = new FinishItem(1);
        finishItem.dispose();
        expect(finishItem.finishItem.dispose).toHaveBeenCalledTimes(1);
    });
});
