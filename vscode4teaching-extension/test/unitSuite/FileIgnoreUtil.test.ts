import * as path from "path";
import { FileIgnoreUtil } from "../../src/utils/FileIgnoreUtil";

describe("File Ignore Utilities", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should get the ignored files of a single directory's .gitignore file", () => {
        const ignoredFiles = FileIgnoreUtil.readGitIgnores(path.resolve(__dirname, "..", "files", "exs"));
        const expectedIgnoredFiles: string[] = [
            path.resolve(__dirname, "..", "files", "exs", "ignoredex.html"),
            path.resolve(__dirname, "..", "files", "exs", "ignoredexs", "exignored.html"),
        ];
        expect(ignoredFiles).toContain(expectedIgnoredFiles[0]);
        expect(ignoredFiles).toContain(expectedIgnoredFiles[1]);
    });

    it("should get the ignored files of a all the directory's .gitignore files, including subdirectories", () => {
        const ignoredFiles = FileIgnoreUtil.recursiveReadGitIgnores(path.resolve(__dirname, "..", "files"));
        const expectedIgnoredFiles: string[] = [
            path.resolve(__dirname, "..", "files", "exs", "ignoredex.html"),
            path.resolve(__dirname, "..", "files", "exs", "ignoredexs", "exignored.html"),
            path.resolve(__dirname, "..", "files", "exs.zip"),
        ];
        expect(ignoredFiles).toContain(expectedIgnoredFiles[0]);
        expect(ignoredFiles).toContain(expectedIgnoredFiles[1]);
        expect(ignoredFiles).toContain(expectedIgnoredFiles[2]);
    });
});
