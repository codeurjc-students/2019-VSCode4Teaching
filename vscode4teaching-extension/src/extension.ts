import { AxiosResponse } from "axios";
import * as fs from "fs";
import JSZip from "jszip";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "./client/APIClient";
import { CurrentUser } from "./client/CurrentUser";
import { WebSocketV4TConnection } from "./client/WebSocketV4TConnection";
import { CoursesProvider } from "./components/courses/CoursesTreeProvider";
import { V4TItem } from "./components/courses/V4TItem/V4TItem";
import { DashboardWebview } from "./components/dashboard/DashboardWebview";
import { LiveshareWebview } from "./components/liveshareBoard/LiveshareWebview";
import { ShowDashboardItem } from "./components/statusBarItems/dashboard/ShowDashboardItem";
import { FinishItem } from "./components/statusBarItems/exercises/FinishItem";
import { ShowLiveshareBoardItem } from "./components/statusBarItems/liveshare/ShowLiveshareBoardItem";
import { Dictionary } from "./model/Dictionary";
import { Exercise } from "./model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "./model/serverModel/exercise/ExerciseUserInfo";
import { FileInfo } from "./model/serverModel/file/FileInfo";
import { ModelUtils } from "./model/serverModel/ModelUtils";
import { V4TExerciseFile } from "./model/V4TExerciseFile";
import { EUIUpdateService } from "./services/EUIUpdateService";
import { LiveShareService } from "./services/LiveShareService";
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
export let showLiveshareBoardItem: ShowLiveshareBoardItem | undefined;
export let changeEvent: vscode.Disposable;
export let createEvent: vscode.Disposable;
export let deleteEvent: vscode.Disposable;
export let commentInterval: NodeJS.Timeout;
export let uploadTimeout: NodeJS.Timeout | undefined;
export let wsLiveshare: WebSocketV4TConnection | undefined;
export let liveshareService: LiveShareService | undefined;

export function activate(context: vscode.ExtensionContext) {
    vscode.window.registerTreeDataProvider("vscode4teachingview", coursesProvider);
    const sessionInitialized = APIClient.initializeSessionFromFile();
    if (sessionInitialized) {
        CurrentUser.updateUserInfo().then().catch((error) => {
            APIClient.handleAxiosError(error);
        }).finally(() => {
            currentCwds = vscode.workspace.workspaceFolders;
            if (currentCwds) {
                initializeExtension(currentCwds).then();
            } else {
                try {
                    const courses = CurrentUser.getUserInfo().courses;
                    if (courses && !showLiveshareBoardItem) {
                        showLiveshareBoardItem = new ShowLiveshareBoardItem("Liveshare Board", courses);
                        showLiveshareBoardItem.show();
                    }
                } catch (err) { console.error(err); }
            }
        });
    }

    const loginDisposable = vscode.commands.registerCommand("vscode4teaching.login", () => {
        coursesProvider.login().then(async () => {
            await initializeLiveShare();
            const courses = CurrentUser.getUserInfo().courses;
            if (courses && !showLiveshareBoardItem) {
                showLiveshareBoardItem = new ShowLiveshareBoardItem("Liveshare Board", courses);
                showLiveshareBoardItem.show();
            }
        });
    });

    const logoutDisposable = vscode.commands.registerCommand("vscode4teaching.logout", async () => {
        coursesProvider.logout();
        if (showLiveshareBoardItem) {
            showLiveshareBoardItem.dispose();
            showDashboardItem = undefined;
        }
        if (showDashboardItem) {
            showDashboardItem.dispose();
            showDashboardItem = undefined;
        }
        currentCwds = vscode.workspace.workspaceFolders;
        if (currentCwds) {
            await initializeExtension(currentCwds);
        }
    });

    const getFilesDisposable = vscode.commands.registerCommand("vscode4teaching.getexercisefiles", async (courseName: string, exercise: Exercise) => {
        coursesProvider.changeLoading(true);
        try {
            await getSingleStudentExerciseFiles(courseName, exercise);
        } finally {
            coursesProvider.changeLoading(false);
        }
    });

    const getStudentFiles = vscode.commands.registerCommand("vscode4teaching.getstudentfiles", async (courseName: string, exercise: Exercise) => {
        coursesProvider.changeLoading(true);
        try {
            await getMultipleStudentExerciseFiles(courseName, exercise);
        } finally {
            coursesProvider.changeLoading(false);
        }
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
            const parentDir = path.resolve(wf.uri.fsPath, "..");
            const relativePath = path.relative(wf.uri.fsPath, file.fsPath);
            const templateFile = path.resolve(templates[parentDir], relativePath);
            if (fs.existsSync(templateFile)) {
                const templateFileUri = vscode.Uri.file(templateFile);
                vscode.commands.executeCommand("vscode.diff", templateFileUri, file);
            } else {
                vscode.window.showErrorMessage("File doesn't exist in the template.");
            }
        }
    });

    const createComment = vscode.commands.registerCommand("vscode4teaching.createComment", async (reply: vscode.CommentReply) => {
        if (commentProvider && CurrentUser.isLoggedIn()) {
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
            let fileRelativePath = currentUserIsTeacher ? filePath.split(separator + username + separator)[1] : filePath.split(separator + exerciseName + separator)[1];
            fileRelativePath = fileRelativePath.replace(/\\/g, "/");
            const fileInfo = fileInfoArray.find((file: FileInfo) => file.path === fileRelativePath);
            if (fileInfo) {
                try {
                    await commentProvider.addComment(reply, fileInfo.id);
                } catch (e) {
                    APIClient.handleAxiosError(e);
                }
            } else {
                vscode.window.showErrorMessage("Error retrieving file id, please download the exercise again.");
            }
        }
    });

    const share = vscode.commands.registerCommand("vscode4teaching.share", (item: V4TItem) => {
        if (item.item) {
            const codeThenable = APIClient.getSharingCode(item.item);
            codeThenable.then((response) => {
                console.debug(response);
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
        coursesProvider.signup().catch((error) => APIClient.handleAxiosError(error));
    });

    const signupTeacher = vscode.commands.registerCommand("vscode4teaching.signupteacher", () => {
        coursesProvider.signup(true).catch((error) => APIClient.handleAxiosError(error));
    });

    const getWithCode = vscode.commands.registerCommand("vscode4teaching.getwithcode", async () => {
        await coursesProvider.getCourseWithCode();
    });

    const finishExercise = vscode.commands.registerCommand("vscode4teaching.finishexercise", async () => {
        const warnMessage = "Finish exercise? Exercise will be marked as finished and you will not be able to upload any more updates";
        const selectedOption = await vscode.window.showWarningMessage(warnMessage, { modal: true }, "Accept");
        if ((selectedOption === "Accept") && finishItem) {
            try {
                const response = await APIClient.updateExerciseUserInfo(finishItem.getExerciseId(), 1);
                console.debug(response);
                if ((response.data.status === 1) && finishItem) {
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
                } else {
                    vscode.window.showErrorMessage("An unexpected error has occurred. The exercise has not been marked as finished. Please try again.");
                }
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
    });

    const showDashboard = vscode.commands.registerCommand("vscode4teaching.showdashboard", () => {
        if (showDashboardItem && showDashboardItem.exercise && showDashboardItem.course) {
            APIClient.getAllStudentsExerciseUserInfo(showDashboardItem.exercise.id).then((response: AxiosResponse<ExerciseUserInfo[]>) => {
                console.debug(response);
                if (showDashboardItem && showDashboardItem.exercise && showDashboardItem.course) {
                    DashboardWebview.show(response.data, showDashboardItem.course, showDashboardItem.exercise);
                }
            }).catch((error) => APIClient.handleAxiosError(error));
        }
    });

    const showLiveshareBoard = vscode.commands.registerCommand("vscode4teaching.showliveshareboard", () => {
        if (CurrentUser.isLoggedIn()) {
            try {
                const courses = CurrentUser.getUserInfo().courses;
                if (courses) {
                    if (!showLiveshareBoardItem) {
                        showLiveshareBoardItem = new ShowLiveshareBoardItem("Liveshare Board", courses);
                        showLiveshareBoardItem.show();
                    }
                    LiveshareWebview.show(courses);
                }
            } catch (err) { console.error(err); }
        } else {
            vscode.window.showErrorMessage("You are not logged in.");
        }
    });

    context.subscriptions.push(loginDisposable, logoutDisposable, getFilesDisposable, addCourseDisposable, editCourseDisposable,
        deleteCourseDisposable, refreshView, refreshCourse, addExercise, editExercise, deleteExercise, addUsersToCourse,
        removeUsersFromCourse, getStudentFiles, diff, createComment, share, signup, signupTeacher, getWithCode, finishExercise, showDashboard, showLiveshareBoard);

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
    if (showLiveshareBoardItem) {
        showLiveshareBoardItem.dispose();
        showDashboardItem = undefined;
    }
    global.clearInterval(commentInterval);
}

export async function initializeExtension(cwds: ReadonlyArray<vscode.WorkspaceFolder>, hideWelcomeMessage?: boolean) {

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
                const exerciseId: number = +zipSplit[zipSplit.length - 1].split("\.")[0] || +zipSplit[zipSplit.length - 1].split("-")[0];
                if (CurrentUser.isLoggedIn()) {
                    initializeLiveShare().then(() => {
                        console.log("LiveShare initialized");
                        console.log(liveshareService);
                        console.log(wsLiveshare);
                    });
                    try {
                        const courses = CurrentUser.getUserInfo().courses;
                        if (courses && !showLiveshareBoardItem) {
                            showLiveshareBoardItem = new ShowLiveshareBoardItem("Liveshare Board", courses);
                            showLiveshareBoardItem.show();
                        }
                    } catch (err) { console.error(err); }

                    if (!commentProvider) {
                        commentProvider = new TeacherCommentService(CurrentUser.getUserInfo().username);
                    }
                    commentProvider.addCwd(cwd);
                    const currentUser = CurrentUser.getUserInfo();
                    const currentUserIsTeacher = ModelUtils.isTeacher(currentUser);
                    await vscode.commands.executeCommand("setContext", "vscode4teaching.isTeacher", currentUserIsTeacher);
                    // Download comments
                    if (cwd.name !== "template") {
                        const username: string = currentUserIsTeacher ? cwd.name : currentUser.username;
                        await commentProvider.getThreads(exerciseId, username, cwd, APIClient.handleAxiosError);
                        commentInterval = global.setInterval(commentProvider.getThreads.bind(commentProvider), 60000, exerciseId, username, cwd, APIClient.handleAxiosError);
                    }
                    const eui = await APIClient.getExerciseUserInfo(exerciseId);
                    console.debug(eui);
                    // If user is student and exercise is not finished add finish button
                    if (!currentUserIsTeacher && !finishItem) {
                        try {
                            if (eui.data.status !== 1) {
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
                        if (!exerciseId) {
                            vscode.window.showInformationMessage("Wrong exercise ID format");
                        } else {
                            showDashboardItem = new ShowDashboardItem(cwd.name, eui.data.exercise.course, eui.data.exercise);
                            showDashboardItem.show();
                        }
                    }
                    vscode.commands.executeCommand("workbench.view.explorer").then(() => {
                        if (!hideWelcomeMessage) {
                            if (currentUserIsTeacher) {
                                const message = `
                                    The exercise has been downloaded! You can start editing its files in the Explorer view.
                                    You can mark the exercise as finished using the 'Finish' button in the status bar below.
                                `;
                                vscode.window.showInformationMessage(message).then(() => console.debug("Message dismissed"));
                            } else {
                                const message = `
                                        The exercise has been downloaded! You can see the template files and your students' files in the Explorer view.
                                        You can also open the Dashboard to monitor their progress (you can also open it from the status bar's 'Dashboard' button.
                                    `;
                                const openDashboard = "Open dashboard";
                                vscode.window.showInformationMessage(message, openDashboard).then((value: string | undefined) => {
                                    console.debug(value);
                                    if (value === openDashboard) {
                                        console.debug("Opening dashboard");
                                        return vscode.commands.executeCommand("vscode4teaching.showdashboard");
                                    }
                                }).then(() => console.debug("Message dismissed"));
                            }
                        }
                    });
                    // Set template location if exists
                    if (currentUserIsTeacher && v4tjson.template) {
                        // Template should be the same in the workspace
                        templates[parentDir] = v4tjson.template;
                    }
                }
            }
        }
    }
}

export async function initializeLiveShare() {
    if (!liveshareService) {
        liveshareService = await LiveShareService.setup();
    }
    if (!wsLiveshare) {
        wsLiveshare = new WebSocketV4TConnection("liveshare", (data: any) => liveshareService?.handleLiveshareMessage(data?.data));
    }
}

// Set File System Watcher and comment events
function setStudentEvents(jszipFile: JSZip, cwd: vscode.WorkspaceFolder, zipUri: string, exerciseId: number) {
    const ignoredFiles: string[] = FileIgnoreUtil.recursiveReadGitIgnores(cwd.uri.fsPath);
    jszipFile.loadAsync(fs.readFileSync(zipUri));
    const pattern = new vscode.RelativePattern(cwd, "**/*");
    const fsw = vscode.workspace.createFileSystemWatcher(pattern);
    changeEvent = fsw.onDidChange((e: vscode.Uri) => {
        if (uploadTimeout) {
            global.clearTimeout(uploadTimeout);
        }
        uploadTimeout = global.setTimeout(() => {
            uploadTimeout = undefined;
            FileZipUtil.updateFile(jszipFile, e.fsPath, cwd.uri.fsPath, ignoredFiles, exerciseId).then(() => {
                console.debug("File edited: " + e.fsPath);
            });
            EUIUpdateService.updateExercise(e, exerciseId);
        }, 500);
    });
    createEvent = fsw.onDidCreate((e: vscode.Uri) => {
        if (uploadTimeout) {
            global.clearTimeout(uploadTimeout);
        }
        uploadTimeout = global.setTimeout(() => {
            uploadTimeout = undefined;
            FileZipUtil.updateFile(jszipFile, e.fsPath, cwd.uri.fsPath, ignoredFiles, exerciseId).then(() => {
                console.debug("File added: " + e.fsPath);
            });
            EUIUpdateService.updateExercise(e, exerciseId);
        }, 500);
    });
    deleteEvent = fsw.onDidDelete((e: vscode.Uri) => {
        if (uploadTimeout) {
            global.clearTimeout(uploadTimeout);
        }
        uploadTimeout = global.setTimeout(() => {
            uploadTimeout = undefined;
            FileZipUtil.deleteFile(jszipFile, e.fsPath, cwd.uri.fsPath, ignoredFiles, exerciseId).then(() => {
                console.debug("File deleted: " + e.fsPath);
            });
        }, 500);
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

async function checkCommentLineChanges(document: vscode.TextDocument) {
    if (commentProvider) {
        const fileThreads = commentProvider.getFileCommentThreads(document.uri);
        for (const thread of fileThreads) {
            const docTextSeparatedByLines = document.getText().split(/\r?\n/);
            const threadLine = thread[1].range.start.line;
            const threadLineText = (thread[1].comments[0] as NoteComment).lineText;
            if (docTextSeparatedByLines[threadLine].trim() !== threadLineText.trim()) {
                for (let i = 0; i < docTextSeparatedByLines.length; i++) {
                    const line = docTextSeparatedByLines[i];
                    if (threadLineText.trim() === line.trim()) {
                        const threadId = thread[0];
                        try {
                            await commentProvider.updateThreadLine(threadId, i, line);
                        } catch (error) {
                            APIClient.handleAxiosError(error);
                        }
                        break;
                    }
                }
            }
        }
    }
}

/**
 * Download exercise's files from server
 * @param courseName course name
 * @param exercise exercise
 */
async function getExerciseFiles(courseName: string, exercise: Exercise) {
    console.log(`Nos descargamos el ejercicio ${exercise.name} del curso ${courseName}`);
    const zipInfo = FileZipUtil.exerciseZipInfo(courseName, exercise);
    return FileZipUtil.filesFromZip(zipInfo, APIClient.getExerciseFiles(exercise.id));
}

async function getSingleStudentExerciseFiles(courseName: string, exercise: Exercise) {
    const newWorkspaceURI = await getExerciseFiles(courseName, exercise);
    if (newWorkspaceURI) {
        const uri = vscode.Uri.file(newWorkspaceURI);
        // Get file info for id references
        if (coursesProvider && CurrentUser.isLoggedIn()) {
            const username = CurrentUser.getUserInfo().username;
            const fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, username, ".fileInfo", exercise.name);
            await getFilesInfo(exercise, fileInfoPath, [username]);
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                currentCwds = vscode.workspace.workspaceFolders;
                if (currentCwds) {
                    initializeExtension(currentCwds, true);
                }
            });
            vscode.workspace.updateWorkspaceFolders(0,
                vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
                { uri, name: exercise.name });
        }
    }
}

/**
 * Download exercise's student's files and template from the server
 * @param courseName course name
 * @param exercise exercise
 */
async function getStudentExerciseFiles(courseName: string, exercise: Exercise) {
    const studentZipInfo = FileZipUtil.studentZipInfo(courseName, exercise);
    const templateZipInfo = FileZipUtil.templateZipInfo(courseName, exercise);
    return await Promise.all([
        FileZipUtil.filesFromZip(templateZipInfo, APIClient.getTemplate(exercise.id)),
        FileZipUtil.filesFromZip(studentZipInfo, APIClient.getAllStudentFiles(exercise.id), templateZipInfo.dir),
    ]);
}

async function getMultipleStudentExerciseFiles(courseName: string, exercise: Exercise) {
    const newWorkspaceURIs = await getStudentExerciseFiles(courseName, exercise);
    if (newWorkspaceURIs && newWorkspaceURIs[1]) {
        const wsURI: string = newWorkspaceURIs[1];
        let directories = fs.readdirSync(wsURI, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory());
        /*
            Move "template" directory to beginning of directory array
            As in the documentation for vscode.workspace.onDidChangeWorkspaceFolders:

            If the first workspace folder is added, removed or changed, the currently executing extensions
            (including the one that called this method) will be terminated and restarted so that the (deprecated)
            rootPath property is updated to point to the first workspace folder.

            The folder that never changes is the "template" one, so we move it to the beginning of the array to avoid
            reloading all extensions if the same workspace is opened and there are new students added.
        */
        const template = directories.filter((dirent) => dirent.name === "template")[0];
        directories = directories.filter((dirent) => dirent.name !== "template");
        directories.unshift(template);
        // Get file info for id references
        if (coursesProvider && CurrentUser.isLoggedIn()) {
            const usernames = directories.filter((dirent) => !dirent.name.includes("template")).map((dirent) => dirent.name);
            const fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, CurrentUser.getUserInfo().username, ".fileInfo", exercise.name);
            await getFilesInfo(exercise, fileInfoPath, usernames);
            const subdirectoriesURIs = directories.map((dirent) => {
                return {
                    uri: vscode.Uri.file(path.resolve(wsURI, dirent.name)),
                };
            });
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                currentCwds = vscode.workspace.workspaceFolders;
                if (currentCwds) {
                    initializeExtension(currentCwds, true);
                }
            });
            // open all student files and template
            vscode.workspace.updateWorkspaceFolders(0,
                vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
                ...subdirectoriesURIs);
        }
    }
}

async function getFilesInfo(exercise: Exercise, fileInfoPath: string, usernames: string[]) {
    if (!fs.existsSync(fileInfoPath)) {
        mkdirp.sync(fileInfoPath);
    }
    for (const username of usernames) {
        try {
            const filesInfo = await APIClient.getFilesInfo(username, exercise.id);
            console.debug(filesInfo);
            fs.writeFileSync(path.resolve(fileInfoPath, username + ".json"), JSON.stringify(filesInfo.data), { encoding: "utf8" });
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    }
}

export function setCommentProvider(username: string) {
    commentProvider = new TeacherCommentService(username);
}

export function setFinishItem(exerciseId: number) {
    finishItem = new FinishItem(exerciseId);
}

export function setTemplate(cwdName: string, templatePath: string) {
    templates[cwdName] = templatePath;
}
