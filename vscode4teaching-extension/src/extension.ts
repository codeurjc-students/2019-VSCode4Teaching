import axios, { AxiosResponse } from "axios";
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
import { DiffWithSolutionItem } from "./components/statusBarItems/exercises/DiffWithSolution";
import { DownloadTeacherSolutionItem } from "./components/statusBarItems/exercises/DownloadTeacherSolution";
import { FinishItem } from "./components/statusBarItems/exercises/FinishItem";
import { ShowLiveshareBoardItem } from "./components/statusBarItems/liveshare/ShowLiveshareBoardItem";
import { Dictionary } from "./model/Dictionary";
import { Course } from "./model/serverModel/course/Course";
import { Exercise, instanceOfExercise } from "./model/serverModel/exercise/Exercise";
import { ExerciseStatus } from "./model/serverModel/exercise/ExerciseStatus";
import { ExerciseUserInfo } from "./model/serverModel/exercise/ExerciseUserInfo";
import { FileInfo } from "./model/serverModel/file/FileInfo";
import { ModelUtils } from "./model/serverModel/ModelUtils";
import { V4TExerciseFile } from "./model/V4TExerciseFile";
import { EUIUpdateService } from "./services/EUIUpdateService";
import { LiveShareService } from "./services/LiveShareService";
import { v4tLogger } from "./services/LoggerService";
import { NoteComment } from "./services/NoteComment";
import { TeacherCommentService } from "./services/TeacherCommentsService";
import { DiffBetweenDirectories } from "./utils/DiffBetweenDirectories";
import { FileIgnoreUtil } from "./utils/FileIgnoreUtil";
import { FileZipUtil } from "./utils/FileZipUtil";

// Base URL of server
const getServerBaseUrl = () => vscode.workspace.getConfiguration("vscode4teaching").get("defaultServer");

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
export let downloadTeacherSolutionItem: DownloadTeacherSolutionItem | undefined;
export let diffWithSolutionItem: DiffWithSolutionItem | undefined;
export let changeEvent: vscode.Disposable;
export let createEvent: vscode.Disposable;
export let deleteEvent: vscode.Disposable;
export let commentInterval: NodeJS.Timeout;
export let uploadTimeout: NodeJS.Timeout | undefined;
export let wsLiveshare: WebSocketV4TConnection | undefined;
export let liveshareService: LiveShareService | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Set timezone
    process.env.TZ = "UTC";

    // Set Axios automatic logging
    axios.interceptors.request.use(req => {
        v4tLogger.info(`Axios request to ${req.url} with params '${req.params}' and timeout '${req.timeout}'.`);
        v4tLogger.debug(`Request info:\n${JSON.stringify(req)}`);
        return req;
    });
    axios.interceptors.response.use(res => {
        v4tLogger.info(`Axios response ${res.status} with headers\n${JSON.stringify(res.headers)}.`);
        v4tLogger.debug(`Response data:\n${JSON.stringify(res.data)}`);
        return res;
    });

    vscode.window.registerTreeDataProvider("vscode4teachingview", coursesProvider);
    const sessionInitialized = APIClient.initializeSessionFromFile();
    if (sessionInitialized) {
        CurrentUser.updateUserInfo()
            .then()
            .catch((error) => {
                APIClient.handleAxiosError(error);
            })
            .finally(() => {
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
                    } catch (err) {
                        v4tLogger.error(err);
                    }
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
        if (DashboardWebview.exists()) {
            DashboardWebview.currentPanel?.dispose();
        }
        if (showLiveshareBoardItem) {
            showLiveshareBoardItem.dispose();
            showLiveshareBoardItem = undefined;
        }
        if (showDashboardItem) {
            showDashboardItem.dispose();
            showDashboardItem = undefined;
        }
        if (downloadTeacherSolutionItem) {
            downloadTeacherSolutionItem.dispose();
            downloadTeacherSolutionItem = undefined;
        }
        if (diffWithSolutionItem) {
            diffWithSolutionItem.dispose();
            diffWithSolutionItem = undefined;
        }
        currentCwds = vscode.workspace.workspaceFolders;
        if (currentCwds) {
            await initializeExtension(currentCwds);
        }
    });

    const getFilesDisposable = vscode.commands.registerCommand("vscode4teaching.getexercisefiles", async (courseName: string, exercise: Exercise) => {
        coursesProvider.changeLoading(true);
        try {
            // Status has to be changed only if it was NOT_STARTED to IN_PROGRESS, otherwise it should not be changed
            const eui: ExerciseUserInfo = (await APIClient.getExerciseUserInfo(exercise.id)).data;
            if (eui.status === ExerciseStatus.StatusEnum.NOT_STARTED) {
                const response = await APIClient.updateExerciseUserInfo(exercise.id, ExerciseStatus.StatusEnum.IN_PROGRESS);
                if (response.data.status === ExerciseStatus.StatusEnum.IN_PROGRESS) {
                    await getSingleStudentExerciseFiles(courseName, exercise);
                }
            } else {
                await getSingleStudentExerciseFiles(courseName, exercise);
            }
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

    const refreshCoursesInTreeView = vscode.commands.registerCommand("vscode4teaching.refreshcourses", async () => {
        // Refreshes currently available courses
        coursesProvider.refreshCourses();
        // If there is a currently activated exercise, it will check if solution is public or not
        if (!downloadTeacherSolutionItem && finishItem && finishItem.getExerciseId() !== 0) {
            try {
                const exercise = (await APIClient.getExercise(finishItem.getExerciseId())).data;
                if (exercise.includesTeacherSolution && exercise.solutionIsPublic) {
                    // Solution is now public, so button can be showed to student
                    downloadTeacherSolutionItem = new DownloadTeacherSolutionItem(exercise);
                    downloadTeacherSolutionItem.show();
                    // Students gets a visual alert about this change
                    vscode.window.showInformationMessage("Solution provided by teacher is now available. You can download it using the corresponding button in toolbar.");
                }
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
    });

    const refreshExercisesInTreeView = vscode.commands.registerCommand("vscode4teaching.refreshexercises", (item: V4TItem) => {
        coursesProvider.refreshExercises(item);
    });

    const addExercise = vscode.commands.registerCommand("vscode4teaching.addexercise", (item: V4TItem) => {
        coursesProvider.addExercises(item, false);
    });

    const addMultipleExercises = vscode.commands.registerCommand("vscode4teaching.addmultipleexercises", (item: V4TItem) => {
        coursesProvider.addExercises(item, true);
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
            const templateFile = path.resolve(parentDir, "template", relativePath);
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
            codeThenable
                .then((response) => {
                    const link = `${getServerBaseUrl()}/app?code=${response.data}`;
                    vscode.window.showInformationMessage("Share this link with your students to give them access to this course:\n" + link, "Copy link").then((clicked) => {
                        if (clicked) {
                            vscode.env.clipboard.writeText(link).then(() => {
                                vscode.window.showInformationMessage("Copied to clipboard");
                            });
                        }
                    });
                })
                .catch((error) => APIClient.handleAxiosError(error));
        }
    });

    const signup = vscode.commands.registerCommand("vscode4teaching.signup", () => {
        coursesProvider.signup().catch((error) => APIClient.handleAxiosError(error));
    });

    const signupTeacher = vscode.commands.registerCommand("vscode4teaching.signupteacher", () => {
        coursesProvider.inviteTeacher().catch((error) => APIClient.handleAxiosError(error));
    });

    const getWithCode = vscode.commands.registerCommand("vscode4teaching.getwithcode", async () => {
        await coursesProvider.getCourseWithCode();
    });

    const setExerciseFinished = async (finishItem: FinishItem) => {
        try {
            const response = await APIClient.updateExerciseUserInfo(finishItem.getExerciseId(), ExerciseStatus.StatusEnum.FINISHED);
            if (response.data.status === ExerciseStatus.StatusEnum.FINISHED && finishItem) {
                finishItem.dispose();
                if (changeEvent)
                    changeEvent.dispose();
                if (createEvent)
                    createEvent.dispose();
                if (deleteEvent)
                    deleteEvent.dispose();
            } else {
                vscode.window.showErrorMessage("The exercise has not been marked as finished.");
            }
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    };

    const finishExercise = vscode.commands.registerCommand("vscode4teaching.finishexercise", async () => {
        const warnMessage = "Finish exercise? When the exercise is marked as completed, it will not be possible to send new updates.";
        const selectedOption = await vscode.window.showWarningMessage(warnMessage, { modal: true }, "Accept");
        if (selectedOption === "Accept" && finishItem) {
            await setExerciseFinished(finishItem);
            vscode.window.showInformationMessage("The exercise has been successfully finished.");
            CoursesProvider.triggerTreeReload();
        }
    });

    const showDashboardFunction = (exercise: Exercise, course: Course, fullMode: boolean) => {
        if (DashboardWebview.exists()) {
            vscode.window.showWarningMessage("Currently opened dashboard has to be closed before opening another one.");
        } else {
            if (exercise && course) {
                APIClient.getAllStudentsExerciseUserInfo(exercise.id)
                    .then((response: AxiosResponse<ExerciseUserInfo[]>) => {
                        if (exercise && course) {
                            DashboardWebview.show(response.data, course, exercise, fullMode);
                        }
                    })
                    .catch((error) => APIClient.handleAxiosError(error));
            }
        }
    };

    const showExerciseDashboard = vscode.commands.registerCommand("vscode4teaching.showexercisedashboard", (item: V4TItem) => {
        if (item.item && instanceOfExercise(item.item) && item.item.course) {
            showDashboardFunction(item.item, item.item.course, false);
        } else {
            vscode.window.showErrorMessage("Not performabble action. Please try downloading exercise and accessing Dashboard.");
        }
    });

    const showCurrentExerciseDashboard = vscode.commands.registerCommand("vscode4teaching.showcurrentexercisedashboard", () => {
        if (showDashboardItem && showDashboardItem.exercise && showDashboardItem.course) {
            showDashboardFunction(showDashboardItem.exercise, showDashboardItem.course, true);
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
            } catch (err) {
                v4tLogger.error(err);
            }
        } else {
            vscode.window.showErrorMessage("You are not logged in.");
        }
    });

    const downloadTeacherSolution = vscode.commands.registerCommand("vscode4teaching.downloadteachersolution", async () => {
        if (CurrentUser.isLoggedIn() && downloadTeacherSolutionItem) {
            // Get current exercise info
            const exercise = downloadTeacherSolutionItem.getExerciseInfo();
            // Interaction with the user: he or she is told of the changes to be made and confirmation is requested and command will only continue if user confirms
            let initialWarning = await vscode.window.showInformationMessage(
                exercise.allowEditionAfterSolutionDownloaded
                    ? "The solution will then be downloaded. Once downloaded, you can continue editing the exercise."
                    : "The solution will then be downloaded. Once downloaded, the exercise will be marked as finished and it will not be possible to continue editing it."
                , { modal: true }, { title: "Accept"});
            if (initialWarning && initialWarning.title !== "Accept")
                return;

            if (exercise.includesTeacherSolution && exercise.solutionIsPublic) {
                try {
                    // Exercise is marked as finished (and updating events are disabled) only if edition is allowed after downloading solution
                    if (!exercise.allowEditionAfterSolutionDownloaded && finishItem) {
                        await setExerciseFinished(finishItem);
                    }
                    // Solution is downloaded in a folder called "solution" located at root directory of exercise
                    const solutionZipInfo = FileZipUtil.studentSolutionZipInfo(exercise);
                    await FileZipUtil.filesFromZip(solutionZipInfo, APIClient.getExerciseResourceById(exercise.id, "solution"), solutionZipInfo.dir, true);
                    // Interaction with user: a notification is issued to the user to inform him or her of changes
                    vscode.window.showInformationMessage(
                        exercise.allowEditionAfterSolutionDownloaded
                            ? "The solution has been downloaded but the exercise has not been finished, so further editing is possible."
                            : "The solution has been downloaded and the exercise has been marked as finished, so subsequent editions will not be saved."
                    );
                    downloadTeacherSolutionItem.dispose();
                    // The user is allowed to initiate the functionality to visualize differences between his proposal and the teacher's solution
                    diffWithSolutionItem = new DiffWithSolutionItem();
                    diffWithSolutionItem.show();
                    const userResponse = await vscode.window.showInformationMessage("To visualize the differences between the submitted proposal and the solution, you can click on this button or access the function in the toolbar.", { title: "Show diff with solution" });
                    if (userResponse && userResponse.title === "Show diff with solution") {
                        await vscode.commands.executeCommand("vscode4teaching.diffwithsolution");
                    }
                } catch (err) {
                    v4tLogger.error(err);
                }
            }
        }
    });

    const diffWithSolution = vscode.commands.registerCommand("vscode4teaching.diffwithsolution", async () => {
        // Since this command can only be launched by students with an active exercise, the current workspace has to have only one active directory
        const wsDirectory = vscode.workspace.workspaceFolders;
        if (wsDirectory && wsDirectory.length === 1) {
            // In this directory, both the exercise proposal (root directory) and the proposed solution ("solution" directory) should be found
            const proposalPath = path.resolve(wsDirectory[0].uri.fsPath);
            const solutionPath = path.resolve(wsDirectory[0].uri.fsPath, "solution");

            // Trees of the directory structure of both paths are requested
            // When searching for information in the root directory, the "solution" directory that it is contained there is ignored
            const proposalTree = DiffBetweenDirectories.deepFilteredDirectoryTraversal(proposalPath, [/solution/, /^.*\.v4t$/]);
            const solutionTree = DiffBetweenDirectories.deepFilteredDirectoryTraversal(solutionPath, [/^.*\.v4t$/]);

            // The merging algorithm is executed (see documentation associated to this method)
            const mergedTree = DiffBetweenDirectories.mergeDirectoryTrees(proposalTree, solutionTree);

            // The user is shown the Quick Pick system designed to allow the user to choose a file from the tree resulting from the merge process
            const userSelection = await DiffBetweenDirectories.directorySelectionQuickPick(DiffBetweenDirectories.mergedTreeToQuickPickTree(mergedTree, ""));

            // In case the user has chosen a file, it will be displayed...
            if (userSelection) {
                const proposalFileUri = vscode.Uri.parse(path.join(proposalPath, userSelection.relativePath));
                const solutionFileUri = vscode.Uri.parse(path.join(solutionPath, userSelection.relativePath));

                // ... if it exists in both the proposal and the solution, the difference between both files
                if (userSelection.source === 0)
                    await vscode.commands.executeCommand("vscode.diff", proposalFileUri, solutionFileUri);
                // ... otherwise, the selected file is just opened (distinguishing whether it exists in the proposal or in the solution)
                else
                    await vscode.commands.executeCommand("vscode.open", (userSelection.source === -1) ? proposalFileUri : solutionFileUri);
            }
        }
    });

    context.subscriptions.push(
        loginDisposable,
        logoutDisposable,
        getFilesDisposable,
        getStudentFiles,
        addCourseDisposable,
        editCourseDisposable,
        deleteCourseDisposable,
        refreshCoursesInTreeView,
        refreshExercisesInTreeView,
        addExercise,
        addMultipleExercises,
        editExercise,
        deleteExercise,
        addUsersToCourse,
        removeUsersFromCourse,
        diff,
        createComment,
        share,
        signup,
        signupTeacher,
        getWithCode,
        finishExercise,
        showExerciseDashboard,
        showCurrentExerciseDashboard,
        showLiveshareBoard,
        downloadTeacherSolution,
        diffWithSolution
    );

    // Temp fix for this issue https://github.com/microsoft/vscode/issues/136787
    // TODO: Remove this when the issue is fixed
    const isWin = process.platform === "win32";
    if (isWin) {
        if (vscode.workspace.getConfiguration("http").get("systemCertificates")) {
            vscode.window.showWarningMessage("There may be issues connecting to the server unless you change your configuration settings.\nClicking the button will automatically make all configuration changes needed.", "Change configuration and restart").then((selected) => {
                if (selected) {
                    vscode.workspace
                        .getConfiguration("http")
                        .update("systemCertificates", false, true)
                        .then(
                            () => {
                                vscode.commands.executeCommand("workbench.action.reloadWindow");
                            },
                            (error) => {
                                v4tLogger.error(error);
                                vscode.window.showErrorMessage("There was an error updating your configuration: " + error);
                            }
                        );
                }
            });
        }
    }
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
    if (downloadTeacherSolutionItem) {
        downloadTeacherSolutionItem.dispose();
        downloadTeacherSolutionItem = undefined;
    }
    if (diffWithSolutionItem) {
        diffWithSolutionItem.dispose();
        diffWithSolutionItem = undefined;
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
            const uris = await vscode.workspace.findFiles(new vscode.RelativePattern(cwd.uri.fsPath, "**/v4texercise.v4t"), null, 1);
            checkedUris.push(parentDir);
            if (uris.length > 0) {
                const v4tjson: V4TExerciseFile = JSON.parse(fs.readFileSync(path.resolve(uris[0].fsPath), { encoding: "utf8" }));
                // Zip Uri should be in the text file
                const zipUri = path.resolve(v4tjson.zipLocation);
                // Exercise id is in the name of the zip file
                const zipSplit = zipUri.split(path.sep);
                const exerciseId: number = +zipSplit[zipSplit.length - 1].split(".")[0] || +zipSplit[zipSplit.length - 1].split("-")[0];
                if (CurrentUser.isLoggedIn()) {
                    initializeLiveShare().then(() => {
                        v4tLogger.debug("LiveShare initialized");
                    });
                    try {
                        const courses = CurrentUser.getUserInfo().courses;
                        if (courses && !showLiveshareBoardItem) {
                            showLiveshareBoardItem = new ShowLiveshareBoardItem("Liveshare Board", courses);
                            showLiveshareBoardItem.show();
                        }
                    } catch (err) {
                        v4tLogger.error(err);
                    }

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
                    const eui: ExerciseUserInfo = (await APIClient.getExerciseUserInfo(exerciseId)).data;
                    // If user is student and exercise is not finished add finish button
                    if (!currentUserIsTeacher && !finishItem) {
                        try {
                            if (eui.status !== ExerciseStatus.StatusEnum.FINISHED) {
                                const jszipFile = new JSZip();

                                // Student synchronization of files is only enabled when status is different to "finished"
                                if (fs.existsSync(zipUri)) {
                                    setStudentEvents(jszipFile, cwd, zipUri, exerciseId);
                                }

                                // Exercise can be finished if status is not finished
                                finishItem = new FinishItem(exerciseId);
                                finishItem.show();
                            }
                            // Solution can be downloaded regardless of the exercise status
                            // Requires that the exercise includes a solution and that it has been previously published by the teacher
                            if (eui.exercise.includesTeacherSolution && eui.exercise.solutionIsPublic) {
                                downloadTeacherSolutionItem = new DownloadTeacherSolutionItem(eui.exercise);
                                downloadTeacherSolutionItem.show();
                            } else {
                                downloadTeacherSolutionItem?.dispose();
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
                            showDashboardItem = new ShowDashboardItem(cwd.name, eui.exercise.course, eui.exercise);
                            showDashboardItem.show();
                        }
                    }
                    vscode.commands.executeCommand("workbench.view.explorer").then(() => {
                        if (!hideWelcomeMessage) {
                            if (!currentUserIsTeacher) {
                                const message = `The exercise has been downloaded! You can start editing its files in the Explorer view. You can mark the exercise as finished using the 'Finish' button in the status bar below.`;
                                vscode.window.showInformationMessage(message);
                            } else {
                                const message = `The exercise has been downloaded! You can see the template files and your students' files in the Explorer view. You can also open the Dashboard to monitor their progress (you can also open it from the status bar's 'Dashboard' button.`;
                                const openDashboard = "Open dashboard";
                                vscode.window
                                    .showInformationMessage(message, openDashboard)
                                    .then((value: string | undefined) => {
                                        if (value === openDashboard) {
                                            return vscode.commands.executeCommand("vscode4teaching.showcurrentexercisedashboard");
                                        }
                                    });
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
        EUIUpdateService.addModifiedPath(e);
        if (uploadTimeout) {
            global.clearTimeout(uploadTimeout);
        }
        uploadTimeout = global.setTimeout(() => {
            uploadTimeout = undefined;
            FileZipUtil.updateFile(jszipFile, e.fsPath, cwd.uri.fsPath, ignoredFiles, exerciseId).then(() => {
                EUIUpdateService.updateExercise(exerciseId);
            });
        }, 500);
    });
    createEvent = fsw.onDidCreate((e: vscode.Uri) => {
        EUIUpdateService.addModifiedPath(e);
        if (uploadTimeout) {
            global.clearTimeout(uploadTimeout);
        }
        uploadTimeout = global.setTimeout(() => {
            uploadTimeout = undefined;
            FileZipUtil.updateFile(jszipFile, e.fsPath, cwd.uri.fsPath, ignoredFiles, exerciseId).then(() => {
                EUIUpdateService.updateExercise(exerciseId);
            });
        }, 500);
    });
    deleteEvent = fsw.onDidDelete((e: vscode.Uri) => {
        if (uploadTimeout) {
            global.clearTimeout(uploadTimeout);
        }
        uploadTimeout = global.setTimeout(() => {
            uploadTimeout = undefined;
            FileZipUtil.deleteFile(jszipFile, e.fsPath, cwd.uri.fsPath, ignoredFiles, exerciseId).then(() => {
            });
        }, 500);
    });

    vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
        if (commentProvider && commentProvider.getFileCommentThreads(e.document.uri).length > 0) {
            vscode.window.showWarningMessage("If you write over a line with comments, the comments could be deleted next time you open VS Code.");
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
    const zipInfo = FileZipUtil.studentExerciseZipInfo(courseName, exercise);
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
            vscode.workspace.updateWorkspaceFolders(0, vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, { uri, name: exercise.name });
        }
    }
}

/**
 * Download and unzip the student files, the template and the solution (if exists) received from the server.
 * 
 * @param courseName course name
 * @param exercise exercise
 */
async function _getStudentExerciseFiles(courseName: string, exercise: Exercise) {
    const templateZipInfo = FileZipUtil.teacherExerciseZipInfo(courseName, exercise, "template");
    const studentZipInfo = FileZipUtil.teacherExerciseZipInfo(courseName, exercise);

    let templateStudentPromise = [
        FileZipUtil.filesFromZip(studentZipInfo, APIClient.getAllStudentFiles(exercise.id), templateZipInfo.dir),
        FileZipUtil.filesFromZip(templateZipInfo, APIClient.getExerciseResourceById(exercise.id, "template"))
    ];

    // Solution is requested only if it is known to exist (whether it is public or not)
    if (exercise.includesTeacherSolution) {
        const solutionZipInfo = FileZipUtil.teacherExerciseZipInfo(courseName, exercise, "solution");
        templateStudentPromise.push(
            FileZipUtil.filesFromZip(solutionZipInfo, APIClient.getExerciseResourceById(exercise.id, "solution"))
        );
    }

    return await Promise.all(templateStudentPromise);
}

/**
 * Auxiliary method for getMultipleStudentFiles() array sorting.
 * 
 * Read further at getMultipleStudentFiles() documentation.
 */
const _comparatorMethodOfDirectoryArray = (a: string, b: string): number => {
    // Either a or b can be "template", "solution" or "student_(number)"
    // "template" is always the first directory
    if (a === "template") return -1;
    if (b === "template") return 1;

    // "solution" is the second one if exists
    if (a === "solution") return -1;
    if (b === "solution") return 1;

    // Otherwise, numbers of "student_(number)" directories are compared
    return (parseInt(a.split("student_").splice(-1)[0]) < parseInt(b.split("student_").splice(-1)[0])) ? -1 : 1;
}

/**
 * Method executed when a teacher requests the download of an exercise.
 *
 * It downloads the template, the proposed solution (if any) and the updated files for all students who have started the exercise.
 * 
 * @param courseName Course name.
 * @param exercise Exercise information.
 */
async function getMultipleStudentExerciseFiles(courseName: string, exercise: Exercise) {
    const newWorkspaceURIs = await _getStudentExerciseFiles(courseName, exercise);
    if (newWorkspaceURIs && newWorkspaceURIs[0]) {
        const wsURI: string = newWorkspaceURIs[0];
        // Leer los contenidos del directorio padre del ejercicio
        let exerciseDirents = fs.readdirSync(wsURI, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());
        /*
            Documentation for vscode.workspace.onDidChangeWorkspaceFolders:

            If the first workspace folder is added, removed or changed, the currently executing extensions
            (including the one that called this method) will be terminated and restarted so that the (deprecated)
            rootPath property is updated to point to the first workspace folder.

            The folder that never changes is the "template" one, so we move it to the beginning of the array to avoid
            reloading all extensions if the same workspace is opened and there are new students added.

            Hence, array of dirents is always sorted so it looks like [template, solution?, ...students (sorted by ascending number)]
            In this way, "template" will always be the first entry of array, followed by solution (if exists) and by student's files.
        */
        let sortedStringExerciseDirs = exerciseDirents.map(dirent => dirent.name).sort(_comparatorMethodOfDirectoryArray);

        // Get file info for id references
        if (coursesProvider && CurrentUser.isLoggedIn()) {
            const usernames = sortedStringExerciseDirs.filter(exName => exName.startsWith("student_"));
            const fileInfoPath = path.resolve(FileZipUtil.INTERNAL_FILES_DIR, CurrentUser.getUserInfo().username, ".fileInfo", exercise.name);
            await getFilesInfo(exercise, fileInfoPath, usernames);
            const subdirectoriesURIs = sortedStringExerciseDirs.map(exName => ({ uri: vscode.Uri.file(path.resolve(wsURI, exName)) }));
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                currentCwds = vscode.workspace.workspaceFolders;
                if (currentCwds) {
                    initializeExtension(currentCwds, true);
                }
            });
            // Open all student files and template
            vscode.workspace.updateWorkspaceFolders(0, vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, ...subdirectoriesURIs);
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
            fs.writeFileSync(path.resolve(fileInfoPath, username + ".json"), JSON.stringify(filesInfo.data), { encoding: "utf8" });
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    }
}

// Syntactic sugar functions for command testing
export function setCommentProvider(username: string) {
    commentProvider = new TeacherCommentService(username);
}

export function setFinishItem(exerciseId: number) {
    finishItem = new FinishItem(exerciseId);
}

export function setDownloadTeacherSolutionItem(exercise: Exercise) {
    downloadTeacherSolutionItem = new DownloadTeacherSolutionItem(exercise);
}

export function setTemplate(cwdName: string, templatePath: string) {
    templates[cwdName] = templatePath;
}
