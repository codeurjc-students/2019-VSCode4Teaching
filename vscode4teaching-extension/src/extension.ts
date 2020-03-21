import * as vscode from 'vscode';
import { CoursesProvider } from './coursesTreeProvider/coursesTreeProvider';
import { Exercise, FileInfo, ModelUtils } from './model/serverModel';
import { V4TItem } from './coursesTreeProvider/v4titem';
import * as path from 'path';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import { V4TExerciseFile } from './model/v4texerciseFile';
import { FileIgnoreUtil } from './fileIgnoreUtil';
import { TeacherCommentProvider, NoteComment } from './teacherComments';
import { Dictionary } from './model/dictionary';
import { RestClient } from './restClient';
import * as mkdirp from 'mkdirp';
import { AxiosResponse } from 'axios';

export let coursesProvider = new CoursesProvider();
const templates: Dictionary<string> = {};
let commentProvider: TeacherCommentService | undefined;
let currentCwds: ReadonlyArray<vscode.WorkspaceFolder> | undefined;
const client = APIClient.getClient();
export function activate(context: vscode.ExtensionContext) {
    vscode.window.registerTreeDataProvider("vscode4teachingview", coursesProvider);
    const sessionInitialized = client.initializeSessionFromFile();
    if (sessionInitialized) {
        CurrentUser.updateUserInfo().catch((error) => client.handleAxiosError(error));
    }
    // If cwd is a v4t exercise run file system watcher
    currentCwds = vscode.workspace.workspaceFolders;
    if (currentCwds) {
        initializeExtension(currentCwds);
    }

    const loginDisposable = vscode.commands.registerCommand("vscode4teaching.login", () => {
        coursesProvider.login();
    });

    const logoutDisposable = vscode.commands.registerCommand("vscode4teaching.logout", () => {
        coursesProvider.logout();
    });

    const getFilesDisposable = vscode.commands.registerCommand("vscode4teaching.getexercisefiles", (courseName: string, exercise: Exercise) => {
        getSingleStudentExerciseFiles(courseName, exercise);
    });

    const getStudentFiles = vscode.commands.registerCommand("vscode4teaching.getstudentfiles", (courseName: string, exercise: Exercise) => {
        getMultipleStudentExerciseFiles(courseName, exercise);
    });

    const addCourseDisposable = vscode.commands.registerCommand("vscode4teaching.addcourse", () => {
        coursesProvider.addCourse();
    });

    const editCourseDisposable = vscode.commands.registerCommand("vscode4teaching.editcourse", (item: V4TItem) => {
        coursesProvider.editCourse(item);
    });

    const deleteCourseDisposable = vscode.commands.registerCommand("vscode4teaching.deletecourse", (item: V4TItem) => {
        coursesProvider.deleteCourse(item);
    });

    const refreshView = vscode.commands.registerCommand("vscode4teaching.refreshcourses", () => {
        coursesProvider.refreshCourses();
    });

    const refreshCourse = vscode.commands.registerCommand("vscode4teaching.refreshexercises", (item: V4TItem) => {
        coursesProvider.refreshExercises(item);
    });

    const addExercise = vscode.commands.registerCommand("vscode4teaching.addexercise", (item: V4TItem) => {
        coursesProvider.addExercise(item);
    });

    const editExercise = vscode.commands.registerCommand("vscode4teaching.editexercise", (item: V4TItem) => {
        coursesProvider.editExercise(item);
    });

    const deleteExercise = vscode.commands.registerCommand("vscode4teaching.deleteexercise", (item: V4TItem) => {
        coursesProvider.deleteExercise(item);
    });

    const addUsersToCourse = vscode.commands.registerCommand("vscode4teaching.adduserstocourse", (item: V4TItem) => {
        coursesProvider.addUsersToCourse(item);
    });

    const removeUsersFromCourse = vscode.commands.registerCommand("vscode4teaching.removeusersfromcourse", (item: V4TItem) => {
        coursesProvider.removeUsersFromCourse(item);
    });

    const diff = vscode.commands.registerCommand("vscode4teaching.diff", (file: vscode.Uri) => {
        const wf = vscode.workspace.getWorkspaceFolder(file);
        if (wf) {
            const relativePath = path.relative(wf.uri.fsPath, file.fsPath);
            const templateFile = path.resolve(templates[wf.name], relativePath);
            if (fs.existsSync(templateFile)) {
                const templateFileUri = vscode.Uri.file(templateFile);
                vscode.commands.executeCommand("vscode.diff", file, templateFileUri);
            } else {
                vscode.window.showErrorMessage("File doesn't exist in the template.");
            }
        }
    });

    const createComment = vscode.commands.registerCommand("vscode4teaching.createComment", (reply: vscode.CommentReply) => {
        if (commentProvider && coursesProvider && CurrentUser.isLoggedIn()) {
            const filePath = reply.thread.uri.fsPath;
            const separator = path.sep;
            const currentUser = CurrentUser.getUserInfo();
            const currentUsername = currentUser.username;
            const teacherRelativePath = filePath.split(separator + currentUsername + separator)[1];
            const teacherRelativePathSplit = teacherRelativePath.split(separator);
            const exerciseName = teacherRelativePathSplit[1];
            // If teacher use username from student, else use own
            const currentUserIsTeacher = ModelUtils.isTeacher(currentUser);
            const username = currentUserIsTeacher ? teacherRelativePathSplit[2] : currentUsername;

            const fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, currentUser.username, ".fileInfo", exerciseName, username + ".json");
            const fileInfoArray: FileInfo[] = JSON.parse(fs.readFileSync(fileInfoPath, { encoding: "utf8" }));
            const fileRelativePath = currentUserIsTeacher ? filePath.split(separator + username + separator)[1] : filePath.split(separator + exerciseName + separator)[1];
            const fileInfo = fileInfoArray.find((file: FileInfo) => file.path === fileRelativePath);
            if (fileInfo) {
                commentProvider.replyNote(reply, fileInfo.id, client.handleAxiosError);
            } else {
                vscode.window.showErrorMessage("Error retrieving file id, please download the exercise again.");
            }
        }
    });

    const share = vscode.commands.registerCommand("vscode4teaching.share", (item: V4TItem) => {
        if (item.item) {
            const codeThenable = client.getSharingCode(item.item);
            codeThenable.then((response) => {
                const code = response.data;
                vscode.window.showInformationMessage(
                    "Share this code with your students to give them access to this course:\n" + code,
                    "Copy to clipboard",
                ).then((clicked) => {
                    if (clicked) {
                        vscode.env.clipboard.writeText(code).then(() => {
                            vscode.window.showInformationMessage("Copied to clipboard");
                        });
                    }
                });
            }).catch((error) => client.handleAxiosError(error));
        }
    });

    const signup = vscode.commands.registerCommand("vscode4teaching.signup", () => {
        coursesProvider.signup();
    });

    const signupTeacher = vscode.commands.registerCommand("vscode4teaching.signupteacher", () => {
        coursesProvider.signup(true);
    });

    const getWithCode = vscode.commands.registerCommand("vscode4teaching.getwithcode", () => {
        coursesProvider.getCourseWithCode();
    });

    context.subscriptions.push(loginDisposable, logoutDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable,
        deleteCourseDisposable, refreshView, refreshCourse, addExercise, editExercise, deleteExercise, addUsersToCourse,
        removeUsersFromCourse, getStudentFiles, diff, createComment, share, signup, signupTeacher, getWithCode);
}

export function deactivate() {
    if (commentProvider) {
        commentProvider.dispose();
    }
}

// Meant to be used for tests
export function createNewCoursesProvider() {
    coursesProvider = new CoursesProvider();
}

export function initializeExtension(cwds: ReadonlyArray<vscode.WorkspaceFolder>) {
    let checkedUris: string[] = [];
    cwds.forEach((cwd: vscode.WorkspaceFolder) => {
        // Checks recursively from parent directory of cwd for v4texercise.v4t
        let parentDir = path.resolve(cwd.uri.fsPath, '..');
        if (!checkedUris.includes(parentDir)) {
            vscode.workspace.findFiles(new vscode.RelativePattern(parentDir, '**/v4texercise.v4t'), null, 1).then(uris => {
                checkedUris.push(parentDir);
                if (uris.length > 0) {
                    let v4tjson: V4TExerciseFile = JSON.parse(fs.readFileSync(path.resolve(uris[0].fsPath), { encoding: "utf8" }));
                    // Zip Uri should be in the text file
                    let zipUri = path.resolve(v4tjson.zipLocation);
                    // Exercise id is in the name of the zip file
                    let zipSplit = zipUri.split(path.sep);
                    let exerciseId: number = +zipSplit[zipSplit.length - 1].split("\.")[0];
                    if (!commentProvider && client.userinfo) {
                        commentProvider = new TeacherCommentProvider(client.userinfo.username);
                    }
                    if (commentProvider && client.userinfo) {
                        commentProvider.addCwd(cwd);
                        // Download comments
                        if (cwd.name !== "template") {
                            let currentUserIsTeacher = ModelUtils.isTeacher(client.userinfo);
                            let username: string = currentUserIsTeacher ? cwd.name : client.userinfo.username;
                            commentProvider.getThreads(exerciseId, username, cwd, client.handleAxiosError);
                            setInterval(commentProvider.getThreads, 60000, exerciseId, username, cwd, client.handleAxiosError);
                        }
                    }
                    // Set template location if exists
                    if (v4tjson.teacher && v4tjson.template) {
                        // Template should be the same in the workspace
                        templates[cwd.name] = v4tjson.template;
                    }
                    let jszipFile = new JSZip();
                    if (!v4tjson.teacher && fs.existsSync(zipUri)) {
                        setStudentEvents(jszipFile, cwd, zipUri, exerciseId);
                    }
                }
            });
        }
    });

}

// Set File System Watcher and comment events
function setStudentEvents(jszipFile: JSZip, cwd: vscode.WorkspaceFolder, zipUri: string, exerciseId: number) {
    let ignoredFiles: string[] = FileIgnoreUtil.recursiveReadGitIgnores(cwd.uri.fsPath);
    jszipFile.loadAsync(fs.readFileSync(zipUri));
    let pattern = new vscode.RelativePattern(cwd, "**/*");
    let fsw = vscode.workspace.createFileSystemWatcher(pattern);
    fsw.onDidChange((e: vscode.Uri) => {
        updateFile(ignoredFiles, e, exerciseId, jszipFile, cwd);
    });
    fsw.onDidCreate((e: vscode.Uri) => {
        updateFile(ignoredFiles, e, exerciseId, jszipFile, cwd);
    });
    fsw.onDidDelete((e: vscode.Uri) => {
        if (!ignoredFiles.includes(e.fsPath)) {
            let filePath = path.resolve(e.fsPath);
            filePath = path.relative(cwd.uri.fsPath, filePath);
            jszipFile.remove(filePath);
            let thenable = jszipFile.generateAsync({ type: "nodebuffer" });
            vscode.window.setStatusBarMessage("Uploading files...", thenable);
            thenable.then(zipData => client.uploadFiles(exerciseId, zipData))
                .catch(err => client.handleAxiosError(err));
        }
    });

    vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
        if (commentProvider && commentProvider.getFileCommentThreads(e.document.uri).length > 0) {
            vscode.window.showWarningMessage(
                "If you write over a line with comments, the comments could be deleted next time you open VS Code."
            );
        }
    });

    vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
        checkCommentLineChanges(e);
    });
}

function updateFile(ignoredFiles: string[], e: vscode.Uri, exerciseId: number, jszipFile: JSZip, cwd: vscode.WorkspaceFolder) {
    if (!ignoredFiles.includes(e.fsPath)) {
        let filePath = path.resolve(e.fsPath);
        fs.readFile(filePath, (err, data) => {
            filePath = path.relative(cwd.uri.fsPath, filePath);
            if (!filePath.includes("v4texercise.v4t")) {
                if (err) { throw (err); }
                jszipFile.file(filePath, data);
                let thenable = jszipFile.generateAsync({ type: "nodebuffer" });
                vscode.window.setStatusBarMessage("Uploading files...", thenable);
                thenable.then(zipData => client.uploadFiles(exerciseId, zipData))
                    .catch(axiosError => client.handleAxiosError(axiosError));
            }
        });
    }
}

function checkCommentLineChanges(document: vscode.TextDocument) {
    if (commentProvider) {
        let fileThreads = commentProvider.getFileCommentThreads(document.uri);
        for (let thread of fileThreads) {
            let docText = document.getText();
            let docTextSeparatedByLines = docText.split(/\r?\n/);
            let threadLine = thread[1].range.start.line;
            let threadLineText = (<NoteComment>thread[1].comments[0]).lineText;
            if (docTextSeparatedByLines[threadLine].trim() !== threadLineText.trim()) {
                for (let i = 0; i < docTextSeparatedByLines.length; i++) {
                    let line = docTextSeparatedByLines[i];
                    if (threadLineText.trim() === line.trim()) {
                        let threadId = thread[0];
                        commentProvider.updateThreadLine(threadId, i, line, client.handleAxiosError);
                        break;
                    }
                }
            }
        }
    }
}