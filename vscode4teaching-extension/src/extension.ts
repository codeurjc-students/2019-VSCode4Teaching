import { AxiosResponse } from "axios";
import * as fs from "fs";
import * as JSZip from "jszip";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "./client/APIClient";
import { CurrentUser } from "./client/CurrentUser";
import { CoursesProvider } from "./components/courses/CoursesTreeProvider";
import { V4TItem } from "./components/courses/V4TItem/V4TItem";
import { DashboardWebview } from "./components/dashboard/DashboardWebview";
import { ShowDashboardItem } from "./components/statusBarItems/dashboard/ShowDashboardItem";
import { FinishItem } from "./components/statusBarItems/exercises/FinishItem";
import { Dictionary } from "./model/Dictionary";
import { Exercise } from "./model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "./model/serverModel/exercise/ExerciseUserInfo";
import { FileInfo } from "./model/serverModel/file/FileInfo";
import { ModelUtils } from "./model/serverModel/ModelUtils";
import { V4TExerciseFile } from "./model/V4TExerciseFile";
import { NoteComment } from "./services/NoteComment";
import { TeacherCommentService } from "./services/TeacherCommentsService";
import { FileIgnoreUtil } from "./utils/FileIgnoreUtil";
import { FileZipUtil } from "./utils/FileZipUtil";

/**
 * Entrypoiny of the extension.
 * Activate is called at start.
 */
export let coursesProvider = new CoursesProvider();
const templates: Dictionary<string> = {};
export let commentProvider: TeacherCommentService | undefined;
export let currentCwds: ReadonlyArray<vscode.WorkspaceFolder> | undefined;
export let finishItem: FinishItem | undefined;
export let showDashboardItem: ShowDashboardItem | undefined;
export let changeEvent: vscode.Disposable;
export let createEvent: vscode.Disposable;
export let deleteEvent: vscode.Disposable;
export let commentInterval: NodeJS.Timeout;

export function activate(context: vscode.ExtensionContext) {
    vscode.window.registerTreeDataProvider("vscode4teachingview", coursesProvider);
    const sessionInitialized = APIClient.initializeSessionFromFile();
    if (sessionInitialized) {
        CurrentUser.updateUserInfo().catch((error) => {
            APIClient.handleAxiosError(error);
        }).finally(() => {
            currentCwds = vscode.workspace.workspaceFolders;
            if (currentCwds) {
                initializeExtension(currentCwds).then();
            }
        });
    }

    const loginDisposable = vscode.commands.registerCommand("vscode4teaching.login", () => {
        coursesProvider.login();
    });

    const logoutDisposable = vscode.commands.registerCommand("vscode4teaching.logout", () => {
        coursesProvider.logout();
        currentCwds = vscode.workspace.workspaceFolders;
        if (currentCwds) {
            initializeExtension(currentCwds).then();
        }
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
                commentProvider.addComment(reply, fileInfo.id).catch((e) => APIClient.handleAxiosError(e));
            } else {
                vscode.window.showErrorMessage("Error retrieving file id, please download the exercise again.");
            }
        }
    });

    const share = vscode.commands.registerCommand("vscode4teaching.share", (item: V4TItem) => {
        if (item.item) {
            const codeThenable = APIClient.getSharingCode(item.item);
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
            }).catch((error) => APIClient.handleAxiosError(error));
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

    const finishExercise = vscode.commands.registerCommand("vscode4teaching.finishexercise", () => {
        const warnMessage = "Finish exercise? Exercise will be marked as finished and you will not be able to upload any more updates";
        vscode.window.showWarningMessage(warnMessage, { modal: true }, "Accept").then((selectedOption) => {
            if (selectedOption === "Accept" && finishItem) {
                APIClient.updateExerciseUserInfo(finishItem.getExerciseId(), true).then((response: AxiosResponse<ExerciseUserInfo>) => {
                    if (response.data.finished && finishItem) {
                        finishItem.dispose();
                        if (changeEvent) {
                            changeEvent.dispose();
                        }
                        if (createEvent) {
                            createEvent.dispose();
                        }
                        if (deleteEvent) {
                            deleteEvent.dispose();
                        }
                    }
                });
            }
        });
    });

    const showDashboard = vscode.commands.registerCommand("vscode4teaching.showdashboard", () => {
        if (showDashboardItem) {
            APIClient.getAllStudentsExerciseUserInfo(showDashboardItem.exerciseId).then((response: AxiosResponse<ExerciseUserInfo[]>) => {
                if (showDashboardItem) {
                    DashboardWebview.show(response.data, showDashboardItem.exerciseId);
                }
            }).catch((error) => APIClient.handleAxiosError(error));
        }
    });

    context.subscriptions.push(loginDisposable, logoutDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable,
        deleteCourseDisposable, refreshView, refreshCourse, addExercise, editExercise, deleteExercise, addUsersToCourse,
        removeUsersFromCourse, getStudentFiles, diff, createComment, share, signup, signupTeacher, getWithCode, finishExercise, showDashboard);
}

export function deactivate() {
    disableFeatures();
}

export function disableFeatures() {
    if (commentProvider) {
        commentProvider.dispose();
        commentProvider = undefined;
    }
    if (finishItem) {
        finishItem.dispose();
        finishItem = undefined;
    }
    if (showDashboardItem) {
        showDashboardItem.dispose();
        showDashboardItem = undefined;
    }
    global.clearInterval(commentInterval);
}

export async function initializeExtension(cwds: ReadonlyArray<vscode.WorkspaceFolder>) {
    disableFeatures();
    const checkedUris: string[] = [];
    for (const cwd of cwds) {
        // Checks recursively from parent directory of cwd for v4texercise.v4t
        const parentDir = path.resolve(cwd.uri.fsPath, "..");
        if (!checkedUris.includes(parentDir)) {
            const uris = await vscode.workspace.findFiles(new vscode.RelativePattern(parentDir, "**/v4texercise.v4t"), null, 1);
            checkedUris.push(parentDir);
            if (uris.length > 0) {
                const v4tjson: V4TExerciseFile = JSON.parse(fs.readFileSync(path.resolve(uris[0].fsPath), { encoding: "utf8" }));
                // Zip Uri should be in the text file
                const zipUri = path.resolve(v4tjson.zipLocation);
                // Exercise id is in the name of the zip file
                const zipSplit = zipUri.split(path.sep);
                const exerciseId: number = +zipSplit[zipSplit.length - 1].split("\.")[0];
                if (CurrentUser.isLoggedIn()) {
                    if (!commentProvider) {
                        commentProvider = new TeacherCommentService(CurrentUser.getUserInfo().username);
                    }
                    commentProvider.addCwd(cwd);
                    const currentUser = CurrentUser.getUserInfo();
                    const currentUserIsTeacher = ModelUtils.isTeacher(currentUser);
                    // Download comments
                    if (cwd.name !== "template") {
                        const username: string = currentUserIsTeacher ? cwd.name : currentUser.username;
                        commentProvider.getThreads(exerciseId, username, cwd, APIClient.handleAxiosError);
                        commentInterval = global.setInterval(commentProvider.getThreads, 60000, exerciseId, username, cwd, APIClient.handleAxiosError);
                    }

                    // If user is student and exercise is not finished add finish button
                    if (!currentUserIsTeacher && !finishItem) {
                        try {
                            const eui = await APIClient.getExerciseUserInfo(exerciseId);
                            if (!eui.data.finished) {
                                const jszipFile = new JSZip();
                                if (fs.existsSync(zipUri)) {
                                    setStudentEvents(jszipFile, cwd, zipUri, exerciseId);
                                }
                                finishItem = new FinishItem(exerciseId);
                                finishItem.show();
                            }
                        } catch (error) {
                            APIClient.handleAxiosError(error);
                        }
                    }
                    // If user is teacher add show dashboard button
                    if (!showDashboardItem && currentUserIsTeacher) {
                        showDashboardItem = new ShowDashboardItem(cwd.name, exerciseId);
                        showDashboardItem.show();
                    }
                    // Set template location if exists
                    if (currentUserIsTeacher && v4tjson.template) {
                        // Template should be the same in the workspace
                        templates[cwd.name] = v4tjson.template;
                    }
                }
            }
        }
    }
}

// Set File System Watcher and comment events
function setStudentEvents(jszipFile: JSZip, cwd: vscode.WorkspaceFolder, zipUri: string, exerciseId: number) {
    const ignoredFiles: string[] = FileIgnoreUtil.recursiveReadGitIgnores(cwd.uri.fsPath);
    jszipFile.loadAsync(fs.readFileSync(zipUri));
    const pattern = new vscode.RelativePattern(cwd, "**/*");
    const fsw = vscode.workspace.createFileSystemWatcher(pattern);
    changeEvent = fsw.onDidChange((e: vscode.Uri) => {
        updateFile(ignoredFiles, e, exerciseId, jszipFile, cwd);
    });
    createEvent = fsw.onDidCreate((e: vscode.Uri) => {
        updateFile(ignoredFiles, e, exerciseId, jszipFile, cwd);
    });
    deleteEvent = fsw.onDidDelete((e: vscode.Uri) => {
        if (!ignoredFiles.includes(e.fsPath)) {
            let filePath = path.resolve(e.fsPath);
            filePath = path.relative(cwd.uri.fsPath, filePath);
            jszipFile.remove(filePath);
            const thenable = jszipFile.generateAsync({ type: "nodebuffer" });
            vscode.window.setStatusBarMessage("Compressing files...", thenable);
            thenable.then((zipData) => APIClient.uploadFiles(exerciseId, zipData))
                .catch((err) => APIClient.handleAxiosError(err));
        }
    });

    vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
        if (commentProvider && commentProvider.getFileCommentThreads(e.document.uri).length > 0) {
            vscode.window.showWarningMessage(
                "If you write over a line with comments, the comments could be deleted next time you open VS Code.",
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
                const thenable = jszipFile.generateAsync({ type: "nodebuffer" });
                vscode.window.setStatusBarMessage("Compressing files...", thenable);
                thenable.then((zipData) => APIClient.uploadFiles(exerciseId, zipData))
                    .catch((axiosError) => APIClient.handleAxiosError(axiosError));
            }
        });
    }
}

function checkCommentLineChanges(document: vscode.TextDocument) {
    if (commentProvider) {
        const fileThreads = commentProvider.getFileCommentThreads(document.uri);
        for (const thread of fileThreads) {
            const docText = document.getText();
            const docTextSeparatedByLines = docText.split(/\r?\n/);
            const threadLine = thread[1].range.start.line;
            const threadLineText = (thread[1].comments[0] as NoteComment).lineText;
            if (docTextSeparatedByLines[threadLine].trim() !== threadLineText.trim()) {
                for (let i = 0; i < docTextSeparatedByLines.length; i++) {
                    const line = docTextSeparatedByLines[i];
                    if (threadLineText.trim() === line.trim()) {
                        const threadId = thread[0];
                        commentProvider.updateThreadLine(threadId, i, line, APIClient.handleAxiosError);
                        break;
                    }
                }
            }
        }
    }
}

function getSingleStudentExerciseFiles(courseName: string, exercise: Exercise) {
    coursesProvider.getExerciseFiles(courseName, exercise).then(async (newWorkspaceURI) => {
        if (newWorkspaceURI) {
            const uri = vscode.Uri.file(newWorkspaceURI);
            // Get file info for id references
            if (coursesProvider && CurrentUser.isLoggedIn()) {
                const username = CurrentUser.getUserInfo().username;
                const fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, username, ".fileInfo", exercise.name);
                getFilesInfo(exercise, fileInfoPath, [username]).then(() => {
                    const newWorkspace = vscode.workspace.updateWorkspaceFolders(0,
                        vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
                        { uri, name: exercise.name });
                    currentCwds = vscode.workspace.workspaceFolders;
                    if (currentCwds && !newWorkspace) {
                        initializeExtension(currentCwds).then();
                    }
                });
            }
        }
    });
}

function getMultipleStudentExerciseFiles(courseName: string, exercise: Exercise) {
    coursesProvider.getStudentFiles(courseName, exercise).then(async (newWorkspaceURIs) => {
        if (newWorkspaceURIs && newWorkspaceURIs[1]) {
            const wsURI: string = newWorkspaceURIs[1];
            const directories = fs.readdirSync(newWorkspaceURIs[1], { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory());
            // Get file info for id references
            if (coursesProvider && CurrentUser.isLoggedIn()) {
                const usernames = directories.filter((dirent) => !dirent.name.includes("template")).map((dirent) => dirent.name);
                const fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, CurrentUser.getUserInfo().username, ".fileInfo", exercise.name);
                getFilesInfo(exercise, fileInfoPath, usernames).then(() => {
                    const subdirectoriesURIs = directories.map((dirent) => {
                        return {
                            uri: vscode.Uri.file(path.resolve(wsURI, dirent.name)),
                        };
                    });
                    // open all student files and template
                    const newWorkspaces = vscode.workspace.updateWorkspaceFolders(0,
                        vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
                        ...subdirectoriesURIs);
                    currentCwds = vscode.workspace.workspaceFolders;
                    if (currentCwds && !newWorkspaces) {
                        initializeExtension(currentCwds).then();
                    }
                });
            }
        }
    });
}

async function getFilesInfo(exercise: Exercise, fileInfoPath: string, usernames: string[]) {
    if (!fs.existsSync(fileInfoPath)) {
        mkdirp.sync(fileInfoPath);
    }
    for (const username of usernames) {
        try {
            const filesInfo = await APIClient.getFilesInfo(username, exercise.id);
            fs.writeFileSync(path.resolve(fileInfoPath, username + ".json"), JSON.stringify(filesInfo.data), { encoding: "utf8" });
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    }
}
