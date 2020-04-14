import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { FinishItem } from "../../src/components/statusBarItems/exercises/FinishItem";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

describe("FinishItem", () => {
    it("should create correctly", () => {
        const finishItem = new FinishItem(1);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.createStatusBarItem).toHaveBeenLastCalledWith(mockedVscode.StatusBarAlignment.Left);
        expect(finishItem.item.text).toBe("$(checklist) Finish exercise");
        expect(finishItem.item.tooltip).toBe("Finish exercise");
        expect(finishItem.item.command).toBe("vscode4teaching.finishexercise");
        expect(finishItem.getExerciseId()).toBe(1);
    });

});
