import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

export class FileIgnoreUtil {
    static readGitIgnores (currentDir: string): string[] {
        const list = fs.readdirSync(currentDir);
        const gitignoreFile = list.find((f: string) => f.includes(".gitignore"));
        let files: string[] = [];
        let ig = ignore();
        if (gitignoreFile) {
            let gitignoreData = fs.readFileSync(path.resolve(currentDir, gitignoreFile));
            let gitignoreText = gitignoreData.toString();
            ig = ig.add(gitignoreText);
            files = FileIgnoreUtil.getIgnoredFiles(currentDir, currentDir, ig);
        }
        return files;
    }

    static getIgnoredFiles (dir: string, startingDir: string, ig: Ignore, files: string[] = []): string[] {
        const list = fs.readdirSync(dir);
        for (let file of list) {
            file = path.resolve(dir, file);
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                FileIgnoreUtil.getIgnoredFiles(file, startingDir, ig, files);
            }
            if (ig.ignores(path.relative(startingDir, file))) {
                files.push(file);
            }
        }
        return files;
    }

    static recursiveReadGitIgnores (dir: string, ignoredFiles: string[] = []) {
        let newIgnoredFiles = FileIgnoreUtil.readGitIgnores(dir);
        newIgnoredFiles.forEach((file: string) => {
            if (!ignoredFiles.includes(file)) {
                ignoredFiles.push(file);
            }
        });
        const list = fs.readdirSync(dir);
        for (let file of list) {
            file = path.resolve(dir, file);
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                FileIgnoreUtil.recursiveReadGitIgnores(file, ignoredFiles);
            }
        }
        return ignoredFiles;
    }
}
