import * as fs from "fs";
import ignore, { Ignore } from "ignore";
import * as path from "path";

/**
 * Util class for reading gitignore files and ignoring files
 */
export class FileIgnoreUtil {

    /**
     * Get all ignored files in a directory according to the .gitignore files
     * @param currentDir directory to search for files
     */
    public static readGitIgnores(currentDir: string): string[] {
        const list = fs.readdirSync(currentDir);
        const gitignoreFile = list.find((f: string) => f.includes(".gitignore"));
        let files: string[] = [];
        if (gitignoreFile) {
            let ig = ignore();
            const gitignoreData = fs.readFileSync(path.resolve(currentDir, gitignoreFile));
            const gitignoreText = gitignoreData.toString();
            ig = ig.add(gitignoreText);
            ig = ig.add([".git"]);
            files = FileIgnoreUtil.getIgnoredFiles(currentDir, currentDir, ig);
        }
        return files;
    }

    /**
     * Recursive read git ignores while saving ignored files in argument
     * @param dir directory
     * @param ignoredFiles ignored files
     */
    public static recursiveReadGitIgnores(dir: string, ignoredFiles: string[] = []) {
        const newIgnoredFiles = FileIgnoreUtil.readGitIgnores(dir);
        newIgnoredFiles.forEach((file: string) => {
            if (!ignoredFiles.includes(file)) {
                ignoredFiles.push(file);
            }
        });
        const list = fs.readdirSync(dir);
        for (let file of list) {
            file = path.resolve(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                FileIgnoreUtil.recursiveReadGitIgnores(file, ignoredFiles);
            }
        }
        return ignoredFiles;
    }

    /**
     * Return files ignored by a given Ignored instance in a directory (recursive)
     * @param dir current directory
     * @param startingDir starting directory
     * @param ig Ignore instance
     * @param files files ignored in current iteration
     */
    private static getIgnoredFiles(dir: string, startingDir: string, ig: Ignore, files: string[] = []): string[] {
        const list = fs.readdirSync(dir);
        for (let file of list) {
            file = path.resolve(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                FileIgnoreUtil.getIgnoredFiles(file, startingDir, ig, files);
            }
            if (ig.ignores(path.relative(startingDir, file))) {
                files.push(file);
            }
        }
        return files;
    }
}
