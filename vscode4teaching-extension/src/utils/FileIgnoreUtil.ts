import * as fs from "fs";
import ignore, { Ignore } from "ignore";
import * as path from "path";

export class FileIgnoreUtil {
    public static readGitIgnores(currentDir: string): string[] {
        const list = fs.readdirSync(currentDir);
        const gitignoreFile = list.find((f: string) => f.includes(".gitignore"));
        let files: string[] = [];
        let ig = ignore();
        if (gitignoreFile) {
            const gitignoreData = fs.readFileSync(path.resolve(currentDir, gitignoreFile));
            const gitignoreText = gitignoreData.toString();
            ig = ig.add(gitignoreText);
            files = FileIgnoreUtil.getIgnoredFiles(currentDir, currentDir, ig);
        }
        return files;
    }

    public static getIgnoredFiles(dir: string, startingDir: string, ig: Ignore, files: string[] = []): string[] {
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
}
