import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../client/APIClient";
import { CurrentUser } from "../../client/CurrentUser";
import { Course, instanceOfCourse } from "../../model/serverModel/course/Course";
import { instanceOfExercise } from "../../model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../model/serverModel/exercise/ExerciseUserInfo";
import { ModelUtils } from "../../model/serverModel/ModelUtils";
import { User } from "../../model/serverModel/user/User";
import { UserSignup } from "../../model/serverModel/user/UserSignup";
import { v4tLogger } from "../../services/LoggerService";
import { FileZipUtil } from "../../utils/FileZipUtil";
import { UserPick } from "./UserPick";
import { V4TBuildItems } from "./V4TItem/V4TBuiltItems";
import { V4TItem } from "./V4TItem/V4TItem";
import { V4TItemType } from "./V4TItem/V4TItemType";
import { Validators } from "./Validators";

/**
 * Tree view that lists extension's basic options like:
 * - Log in
 * - Sign up
 * - Courses actions
 * - Exercises actions
 */
export class CoursesProvider implements vscode.TreeDataProvider<V4TItem> {
    /**
     * Update tree view. Use when there are changes that should be reflected on the view.
     * Calls getChildren() and displays returned elements onto the view
     * @param item Item passed to getChildren()
     */
    public static triggerTreeReload(item?: V4TItem) {
        CoursesProvider.onDidChangeTreeDataEventEmitter.fire(item);
    }

    private static onDidChangeTreeDataEventEmitter: vscode.EventEmitter<V4TItem | undefined> = new vscode.EventEmitter<V4TItem | undefined>();
    public readonly onDidChangeTreeData?: vscode.Event<V4TItem | null | undefined> = CoursesProvider.onDidChangeTreeDataEventEmitter.event;
    private loading = false;

    /**
     * Get parent of element
     * @param element element
     */
    public getParent(element: V4TItem) {
        return element.parent;
    }

    /**
     * Get tree item of element
     * @param element element
     */
    public getTreeItem(element: V4TItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    /**
     * Get elements of the view.
     * If element is undefined and user is not logged in it will show login and signup (student).
     * If element is undefined and user is logged in it will show the user's course buttons and, if the user is a student, it will show "get course with code".
     * If element is a course it will show its exercises below it.
     * These buttons have commands attached to them that will be handled in extension.ts.
     * Check also the package.json for other contributed actions on these buttons (like edit, delete, etc.).
     * @param element
     */
    public getChildren(element?: V4TItem | undefined): vscode.ProviderResult<V4TItem[]> {
        let treeElements: V4TItem[] = [];
        if (!this.loading) {
            if (element) {
                // Only collapsable items are courses
                return this.getExerciseButtons(element);
            } else {
                // If not logged add login button, else show courses
                if (!CurrentUser.isLoggedIn()) {
                    try {
                        const sessionInitialized = APIClient.initializeSessionFromFile();
                        if (sessionInitialized) {
                            treeElements = this.updateUserInfo();
                        } else {
                            treeElements = [V4TBuildItems.LOGIN_ITEM, V4TBuildItems.SIGNUP_ITEM];
                        }
                    } catch (error) {
                        return [V4TBuildItems.LOGIN_ITEM, V4TBuildItems.SIGNUP_ITEM];
                    }
                } else {
                    treeElements = this.getCourseButtonsWithUserinfo();
                }
            }
        }
        return treeElements;
    }

    /**
     * Show form to get user data for logging in, then call client to log in.
     */
    public async login() {
        const username: string | undefined = await this.getInput("Username", Validators.validateUsername);
        if (username) {
            const password: string | undefined = await this.getInput("Password", Validators.validatePasswordLogin, { password: true });
            if (password) {
                try {
                    await APIClient.loginV4T(username, password);
                } catch (error) {
                    APIClient.handleAxiosError(error);
                }
            }
        }
    }

    /**
     * Show form for signing up then call client.
     */
    public async signup() {
        let userCredentials: UserSignup = {
            username: "",
            password: "",
            email: "",
            name: "",
            lastName: "",
        };
        const username = await this.getInput("Username", Validators.validateUsername);
        if (username) {
            userCredentials = Object.assign(userCredentials, { username });
            const password = await this.getInput("Password", Validators.validatePasswordSignup, { password: true });
            if (password) {
                userCredentials = Object.assign(userCredentials, { password });
                Validators.valueToCompare = password;
                const confirmPassword = await this.getInput("Confirm password", Validators.validateEqualPassword, { password: true });
                if (confirmPassword) {
                    const email = await this.getInput("Email", Validators.validateEmail);
                    if (email) {
                        userCredentials = Object.assign(userCredentials, { email });
                        const name = await this.getInput("Name", Validators.validateName);
                        if (name) {
                            userCredentials = Object.assign(userCredentials, { name });
                            const lastName = await this.getInput("Last name", Validators.validateLastName);
                            if (lastName) {
                                userCredentials = Object.assign(userCredentials, { lastName });
                                await APIClient.signUpStudent(userCredentials);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Show form for inviting a new teacher (must be performed by other teacher).
     */
    public async inviteTeacher() {
        let userCredentials: UserSignup = {
            username: "",
            email: "",
            name: "",
            lastName: "",
        };
        const firstname = await this.getInput("First name", Validators.validateName);
        if (firstname) {
            userCredentials.name = firstname;
            const lastname = await this.getInput("Last name", Validators.validateLastName);
            if (lastname) {
                userCredentials.lastName = lastname;
                const username = await this.getInput("Username", Validators.validateUsername);
                if (username) {
                    userCredentials.username = username;
                    const email = await this.getInput("E-mail", Validators.validateEmail);
                    if (email) {
                        userCredentials.email = email;
                        await APIClient.signUpTeacher(userCredentials);
                    }
                }
            }
        }
    }

    /**
     * Log out current user.
     */
    public logout() {
        APIClient.invalidateSession();
        CoursesProvider.triggerTreeReload();
    }

    /**
     * Show form for adding course then call client.
     */
    public async addCourse() {
        try {
            const courseName = await this.getInput("Course name", Validators.validateCourseName);
            if (courseName) {
                await APIClient.addCourse({ name: courseName });
                await CurrentUser.updateUserInfo();
                CoursesProvider.triggerTreeReload();
            }
        } catch (error) {
            // Only axios requests throw error
            APIClient.handleAxiosError(error);
        }
    }

    /**
     * Show form for editing course then call client.
     * @param item course to edit.
     */
    public async editCourse(item: V4TItem) {
        if (item.item && "exercises" in item.item) {
            try {
                const newCourseName = await this.getInput("Course name", Validators.validateCourseName);
                if (newCourseName && CurrentUser.isLoggedIn() && CurrentUser.getUserInfo().courses) {
                    await APIClient.editCourse(item.item.id, { name: newCourseName });
                    await CurrentUser.updateUserInfo();
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                APIClient.handleAxiosError(error);
            }
        }
    }

    /**
     * Show warning prompt to delete course, then call client.
     * @param item course to delete
     */
    public async deleteCourse(item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            try {
                const selectedOption = await vscode.window.showWarningMessage("Are you sure you want to delete " + item.item.name + "?", { modal: true }, "Accept");
                if (selectedOption === "Accept" && CurrentUser.isLoggedIn() && CurrentUser.getUserInfo().courses) {
                    await APIClient.deleteCourse(item.item.id);
                    await CurrentUser.updateUserInfo();
                    CoursesProvider.triggerTreeReload();
                }
            } catch (error) {
                // Only axios requests throw error
                APIClient.handleAxiosError(error);
            }
        }
    }

    /**
     * Refreshes current available courses.
     */
    public refreshCourses() {
        if (CurrentUser.isLoggedIn()) {
            // If not logged refresh shouldn't do anything
            CurrentUser.updateUserInfo()
                       .then(() => {
                           CoursesProvider.triggerTreeReload();
                       })
                       .catch((error) => {
                           APIClient.handleAxiosError(error);
                       });
        }
    }

    /**
     * Refreshes current available exercises of course
     * @param item course
     */
    public refreshExercises(item: V4TItem) {
        CoursesProvider.triggerTreeReload(item);
    }

    /**
     * Shows a folder picker and sends to the server the new exercises, including their DB information, the template and, if available, the proposed solution (whose existence is detected by an auxiliary function getTemplateSolutionPaths).
     *
     * This method handles both the case of uploading a single exercise and the case of uploading multiple exercises.
     *
     * @param item course
     * @param multiple true if multiple exercises are being added to course, false otherwise
     */
    public async addExercises(item: V4TItem, multiple: boolean) {
        if (item.item && instanceOfCourse(item.item)) {
            // Stage 1: interaction with user
            // User picks a folder using the displayed folder picker.
            // This operation returns a vscode Uri object (fileUris) that points to selected directory.

            // A message explaining the folder structure required to execute the multiple upload is displayed.
            let ans;
            if (multiple) ans = await vscode.window.showInformationMessage("To upload multiple exercises, prepare a directory with a folder for each exercise, each folder including the exercise's corresponding template and solution if wanted. When ready, click 'Accept'.", { title: "Accept" });
            if (!((!multiple) || (multiple && ans && ans.title === "Accept"))) return;

            const fileUris = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: "Select a directory"
            });
            if (!fileUris) return;

            // Stage 2: interpretation of contents of selected folder
            // At the end of this stage, a list of exercises to be added in the next phase is obtained.
            // Each exercise in that list is defined by its name and the paths to its template and, if exists, to its proposed solution.
            const fsUri = fileUris[0].fsPath;
            const course: Course = item.item;
            this.loading = true;
            CoursesProvider.triggerTreeReload();
            // URLs of locations of both templates and solutions of exercises (one or more) are retrieved.
            let uri: vscode.Uri[] = multiple
                ? fs.readdirSync(fsUri, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => vscode.Uri.parse(path.join(fsUri, dirent.name)))
                : [fileUris[0]];
            // Names of the exercises are extracted from the names of the directories, as well as the template and solution paths (if exists).
            let exercisesDirectories: { name: string, paths: { template: vscode.Uri; solution?: vscode.Uri } }[] =
                uri.map((uri) => ({
                    name: uri.fsPath.split(path.sep).slice(-1)[0],
                    paths: this.getTemplateSolutionPaths(vscode.Uri.parse(uri.fsPath))
                }));
            // Unsuccessful responses' control (true if there were any during upload process)
            let errorCaught = false;

            // Stage 3: uploading of exercises to server
            if (exercisesDirectories.length > 0) {
                try {
                    // 3.1: basic information (name, whether they include a solution or not...) of each exercise is sent to server to be persisted.
                    const exerciseData = await APIClient.addExercises(course.id, exercisesDirectories.map(ex => ({
                        name: ex.name,
                        includesTeacherSolution: (ex.paths.solution !== undefined),
                        solutionIsPublic: false,
                        allowEditionAfterSolutionDownloaded: false
                    })));

                    // 3.2: an array containing promises for sending ZIP compressed files including all the templates and solutions extracted during the previous phases is generated.
                    const uploadFilesPromises = await Promise.all(exerciseData.data.map(async (ex, index) =>
                        [
                            APIClient.uploadExerciseTemplate(ex.id, await FileZipUtil.getZipFromUris([exercisesDirectories[index].paths.template]), false),
                            (exercisesDirectories[index].paths.solution) ? APIClient.uploadExerciseSolution(ex.id, await FileZipUtil.getZipFromUris([exercisesDirectories[index].paths.solution!]), false) : undefined
                        ]));

                    // 3.3: all registered requests (as promises in previous step) are sent and, once completed, the received results are processed.
                    Promise.all(uploadFilesPromises.flat())
                           .catch(async (uploadError) => {
                               // If any upload process fails, all exercises are deleted from database and error is handled (via errorCaught)
                               errorCaught = true;
                               v4tLogger.error(uploadError);
                               try {
                                   exerciseData.data.forEach(async ex => await APIClient.deleteExercise(ex.id));
                                   APIClient.handleAxiosError(uploadError);
                               } catch (deleteError) {
                                   APIClient.handleAxiosError(deleteError);
                               }
                           }).finally(() => {
                        // The user is informed of the result of this process, whether it was successful or not.
                        this.loading = false;
                        if (errorCaught) {
                            vscode.window.showErrorMessage("One or more exercises were not properly uploaded.");
                        } else {
                            vscode.window.showInformationMessage(multiple
                                ? exercisesDirectories.length + " exercises were added successfully."
                                : "The new exercise was added successfully."
                            );
                        }
                        CoursesProvider.triggerTreeReload();
                    });
                } catch (_) {
                    errorCaught = true;
                }
            }
        }
    }

    /**
     * Given a folder associated with an exercise, this auxiliary method determines whether it contains a solution or only a template.
     *
     * @param exerciseRoute Uri of the mentioned folder.
     * @returns An object including specific template path and, if exists, also the specific solution path.
     */
    private getTemplateSolutionPaths(exerciseRoute: vscode.Uri): { template: vscode.Uri; solution?: vscode.Uri } {
        // To determine if the provided path of an exercise includes its solution, it is required that the directory provided includes only two folders inside: template and solution.
        // Otherwise, all the contents of the directory will be entered as the template of the exercise and it will be saved without solution.

        // Check if provided path corresponds to an existing directory
        if (fs.lstatSync(exerciseRoute.fsPath).isDirectory()) {
            // Read directory contents and check if it contains "template" and "solution" folders
            const directoryEntries = fs.readdirSync(exerciseRoute.fsPath, { withFileTypes: true });
            if (directoryEntries.length === 2
                && directoryEntries.every(dirent => dirent.isDirectory())
                && directoryEntries.flatMap(dirent => dirent.name).every(name => name === "template" || name === "solution")
            ) {
                const templateDir = path.join(exerciseRoute.fsPath, "template");
                const solutionDir = path.join(exerciseRoute.fsPath, "solution");
                // If these directories both contain any file, exercise is saved with its solution
                if (fs.readdirSync(templateDir).length > 0 && fs.readdirSync(solutionDir).length > 0) {
                    return {
                        template: vscode.Uri.parse(templateDir),
                        solution: vscode.Uri.parse(solutionDir)
                    }
                }
            }
        }
        return { template: exerciseRoute };
    }

    /**
     * Show form for editing an exercise then call client.
     * @param item exercise
     */
    public async editExercise(item: V4TItem) {
        if (item.item && instanceOfExercise(item.item)) {
            const name = await this.getInput("Exercise name", Validators.validateExerciseName);
            if (name) {
                try {
                    await APIClient.editExercise(item.item.id, {
                        name,
                        includesTeacherSolution: item.item.includesTeacherSolution,
                        solutionIsPublic: item.item.solutionIsPublic,
                        allowEditionAfterSolutionDownloaded: item.item.allowEditionAfterSolutionDownloaded
                    });
                    CoursesProvider.triggerTreeReload(item.parent);
                    vscode.window.showInformationMessage("Exercise edited successfully");
                } catch (error) {
                    APIClient.handleAxiosError(error);
                }
            }
        }
    }

    /**
     * Show warning prompt for deleting exercise then call client.
     * @param item exercise
     */
    public async deleteExercise(item: V4TItem) {
        if (item.item && instanceOfExercise(item.item)) {
            try {
                const selectedOption = await vscode.window.showWarningMessage("Are you sure you want to delete " + item.item.name + "?", { modal: true }, "Accept");
                if (selectedOption === "Accept") {
                    const response = await APIClient.deleteExercise(item.item.id);
                    CoursesProvider.triggerTreeReload(item.parent);
                    vscode.window.showInformationMessage("Exercise deleted successfully");
                }
            } catch (error) {
                // Only axios requests throw error
                APIClient.handleAxiosError(error);
            }
        }
    }

    /**
     * Show list of users to add to course
     * @param item course
     */
    public async addUsersToCourse(item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            try {
                // Get all users available
                const usersResponse = await APIClient.getAllUsers();
                const users: User[] = usersResponse.data;
                // Get users currently in course
                const courseUsersResponse = await APIClient.getUsersInCourse(item.item.id);
                const courseUsers = courseUsersResponse.data;
                // Remove from the list the users that are already in the course
                const showArray = users
                    .filter((user: User) => courseUsers.filter((courseUser: User) => courseUser.id === user.id).length === 0)
                    .map((user: User) => {
                        // Get pickable items from users
                        return this.userPickFromUser(user);
                    });
                const ids = await this.manageUsersFromCourse(showArray, item);
                if (ids) {
                    await APIClient.addUsersToCourse(item.item.id, { ids });
                }
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
    }

    /**
     * Show list of users to remove from course
     * @param item course
     */
    public async removeUsersFromCourse(item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            try {
                // Get users in course
                const courseUsersResponse = await APIClient.getUsersInCourse(item.item.id);
                const creatorResponse = await APIClient.getCreator(item.item.id);
                const creator: User = creatorResponse.data;
                const courseUsers = courseUsersResponse.data;
                // Remove creator of course from list
                const showArray = courseUsers
                    .filter((user: User) => user.id !== creator.id)
                    .map((user: User) => {
                        // Get pickable items from users
                        return this.userPickFromUser(user);
                    });
                const ids = await this.manageUsersFromCourse(showArray, item);
                if (ids) {
                    await APIClient.removeUsersFromCourse(item.item.id, { ids });
                }
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
    }

    /**
     * Shows code input box, calls client and adds new course to the list
     */
    public async getCourseWithCode() {
        const code = await this.getInput("Introduce sharing code", Validators.validateSharingCode);
        if (code) {
            try {
                const response = await APIClient.getCourseWithCode(code.trim());
                const course: Course = response.data;
                CurrentUser.addNewCourse(course);
                CoursesProvider.triggerTreeReload();
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
    }

    public changeLoading(loading: boolean) {
        this.loading = loading;
        CoursesProvider.triggerTreeReload();
    }

    /**
     * Create exercise buttons from exercises.
     * @param element course
     */
    private async getExerciseButtons(element: V4TItem): Promise<V4TItem[]> {
        const course = element.item;
        await this.getExercises(element);
        if (course && instanceOfCourse(course)) {
            // If exercises were downloaded previously show them, else get them from server
            if (course.exercises.length > 0) {
                // Map exercises to TreeItems
                let type: V4TItemType;
                let commandName: string;
                if (CurrentUser.isLoggedIn() && ModelUtils.isTeacher(CurrentUser.getUserInfo())) {
                    type = V4TItemType.ExerciseTeacher;
                    commandName = "vscode4teaching.getstudentfiles";
                } else {
                    type = V4TItemType.ExerciseStudent;
                    commandName = "vscode4teaching.getexercisefiles";
                }
                if (course.exercises.length > 0) {
                    if (ModelUtils.isStudent(CurrentUser.getUserInfo())) {
                        return await Promise.all(course.exercises.map(
                            async (exercise) => {
                                const eui: ExerciseUserInfo = (await APIClient.getExerciseUserInfo(exercise.id)).data;
                                return new V4TItem(exercise.name, type, vscode.TreeItemCollapsibleState.None, element, exercise, {
                                    command: commandName,
                                    title: "Get exercise files",
                                    arguments: [course ? course.name : null, exercise],
                                }, eui.status);
                            }
                        ));
                    } else {
                        return course.exercises.map(
                            (exercise) =>
                                new V4TItem(exercise.name, type, vscode.TreeItemCollapsibleState.None, element, exercise, {
                                    command: commandName,
                                    title: "Get exercise files",
                                    arguments: [course ? course.name : null, exercise],
                                }, (Number(exercise.includesTeacherSolution) + Number(exercise.solutionIsPublic)))
                        );
                    }
                }
            }
        }
        return [V4TBuildItems.NO_EXERCISES_ITEM];
    }

    /**
     * Create course buttons from courses.
     */
    private updateUserInfo(): V4TItem[] {
        this.loading = true;
        CurrentUser.updateUserInfo()
                   .then(() => {
                       // Calls getChildren again, which will go through the else statement in this method (logged in and user info initialized)
                       CoursesProvider.triggerTreeReload();
                   })
                   .catch((error) => {
                       APIClient.handleAxiosError(error);
                       CoursesProvider.triggerTreeReload();
                   })
                   .finally(() => {
                       this.loading = false;
                   });
        return [];
    }

    /**
     * Create buttons from courses
     */
    private getCourseButtonsWithUserinfo() {
        const userinfo = CurrentUser.getUserInfo();
        if (userinfo.courses) {
            const isTeacher = ModelUtils.isTeacher(userinfo);
            let type: V4TItemType;
            type = isTeacher ? V4TItemType.CourseTeacher : V4TItemType.CourseStudent;
            // From courses create buttons
            const items = userinfo.courses.map((course) => new V4TItem(course.name, type, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
            // Add 'add course' button if user is teacher
            if (isTeacher) {
                items.unshift(V4TBuildItems.ADD_COURSES_ITEM);
                items.push(V4TBuildItems.SIGNUP_TEACHER_ITEM);
            }
            if (ModelUtils.isStudent(userinfo)) {
                items.unshift(V4TBuildItems.GET_WITH_CODE_ITEM);
            }
            items.push(V4TBuildItems.LOGOUT_ITEM);
            return items;
        }
        return [V4TBuildItems.NO_COURSES_ITEM];
    }

    /**
     * Creates input box with validation
     * @param prompt prompt
     * @param validator validator (check model/Validators.ts)
     * @param options available options for input box
     */
    private async getInput(prompt: string, validator: (value: string) => string | undefined | null | Thenable<string | undefined | null>, options?: { value?: string; password?: boolean }) {
        let inputOptions: vscode.InputBoxOptions = { prompt };
        if (options) {
            if (options.value) {
                inputOptions = Object.assign(inputOptions, { value: options.value });
            }
            if (options.password) {
                inputOptions = Object.assign(inputOptions, { password: options.password });
            }
        }
        inputOptions.validateInput = validator;
        return vscode.window.showInputBox(inputOptions);
    }

    /**
     * Gets exercise from server and add them to course
     * @param item course
     */
    private async getExercises(item: V4TItem) {
        const course = item.item;
        if (instanceOfCourse(course)) {
            const exercisesThenable = APIClient.getExercises(course.id);
            try {
                const response = await exercisesThenable;
                course.exercises = response.data;
            } catch (error) {
                APIClient.handleAxiosError(error);
            }
        }
    }

    /**
     * Creates selectable pick items from user
     * @param user user
     */
    private userPickFromUser(user: User) {
        let displayName = user.name && user.lastName ? user.name + " " + user.lastName : user.username;
        if (ModelUtils.isTeacher(user)) {
            displayName += " (Teacher)";
        }
        return new UserPick(displayName, user);
    }

    /**
     * Converts picked items to id array to call client with client call selected (thenable)
     * @param showArray picked items
     * @param item course
     */
    private async manageUsersFromCourse(showArray: UserPick[], item: V4TItem) {
        if (item.item && instanceOfCourse(item.item)) {
            // Show users that don't belong to the course already
            if (showArray.length > 0) {
                const picks: UserPick[] | undefined = await vscode.window.showQuickPick<UserPick>(showArray, { canPickMany: true });
                if (picks) {
                    const ids: number[] = [];
                    picks.forEach((pick) => ids.push(pick.user.id));
                    return ids;
                }
            } else {
                vscode.window.showInformationMessage("There are no users available.");
            }
        }
    }
}
