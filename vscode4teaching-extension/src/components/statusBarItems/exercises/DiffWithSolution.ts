import { V4TStatusBarItem } from "../V4TStatusBarItem";

export class DiffWithSolutionItem extends V4TStatusBarItem {
    constructor() {
        super("Diff with teacher's solution", "diff", "vscode4teaching.diffwithsolution");
    }
}
