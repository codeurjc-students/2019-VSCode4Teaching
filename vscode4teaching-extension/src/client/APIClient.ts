import axios, { AxiosPromise } from "axios";
import FormData from "form-data";
import * as vscode from "vscode";
import { CoursesProvider } from "../components/courses/CoursesTreeProvider";
import { ServerCommentThread } from "../model/serverModel/comment/ServerCommentThread";
import { Course, instanceOfCourse } from "../model/serverModel/course/Course";
import { CourseEdit } from "../model/serverModel/course/CourseEdit";
import { ManageCourseUsers } from "../model/serverModel/course/ManageCourseUsers";
import { Exercise } from "../model/serverModel/exercise/Exercise";
import { ExerciseEdit } from "../model/serverModel/exercise/ExerciseEdit";
import { ExerciseUserInfo } from "../model/serverModel/exercise/ExerciseUserInfo";
import { FileInfo } from "../model/serverModel/file/FileInfo";
import { User } from "../model/serverModel/user/User";
import { UserSignup } from "../model/serverModel/user/UserSignup";
import { APIClientSession } from "./APIClientSession";
import { AxiosBuildOptions } from "./AxiosBuildOptions";
import { CurrentUser } from "./CurrentUser";

class APIClientSingleton {

    private error401thrown = false;
    private error403thrown = false;

    /**
     * Initialize session from file.
     */
    public initializeSessionFromFile(): boolean {
        return APIClientSession.initializeSessionCredentials();
    }

    /**
     * Invalidates current session.
     */
    public invalidateSession() {
        APIClientSession.invalidateSession();
    }

    /**
     * Logs in to V4T, using the username, password and optionally the server URL.
     * It will save the current session JWTToken, XSRF Token and server Url in a file
     * so it can be used to log in at a future (close in time) time.
     * @param username Username
     * @param password Password
     */
    public async loginV4T(username: string, password: string) {
        try {
            APIClientSession.invalidateSession();
            await APIClient.getXSRFToken();
            const response = await APIClient.login(username, password);
            console.debug(response);
            vscode.window.showInformationMessage("Logged in");
            APIClientSession.jwtToken = response.data.jwtToken;
            APIClientSession.createSessionFile();
            await CurrentUser.updateUserInfo();
            CoursesProvider.triggerTreeReload();
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    }

    /**
     * Sign up in V4T server for students.
     * @param userCredentials User to sign up.
     */
    public async signUpStudent(userCredentials: UserSignup) {
        try {
            APIClientSession.invalidateSession();
            await APIClient.getXSRFToken();
            const response = await APIClient.signUp(userCredentials);
            console.debug(response);
            vscode.window.showInformationMessage("Signed up. Please log in.");
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    }

    /**
     * Invitation for new teachers in V4T Server.
     * @param userCredentials Invited teacher's credentials.
     */
    public async signUpTeacher(userCredentials: UserSignup) {
        try {
            const response = await APIClient.inviteTeacher(userCredentials);
            console.debug(response);
            const link = APIClientSession.baseUrl + "/app/teacher/sign-up/" + response.data.password;
            const windowMessage = vscode.window.showInformationMessage(
                "The new teacher has been successfully invited! Copy the link and share it with they to finish the process:\n" + link,
                "Copy link"
            ).then((clicked) => {
                if (clicked) {
                    vscode.env.clipboard.writeText(link).then(() => {
                        vscode.window.showInformationMessage("Copied to clipboard.");
                    });
                }
            });
        } catch (error) {
            APIClient.handleAxiosError(error);
        }
    }

    /**
     * Helper method to handle errors provoked by calls to the server.
     * If status code is 401 warns about incorrect log in and invalidates session
     * If status code is 403 xsrf token expired so it gets it again
     * Else or if a previous error repeated itself it will output it in an error prompt and invalidate session
     * @param error Error
     */
    public handleAxiosError(error: any) {
        console.error(error);
        if (axios.isCancel(error)) {
            vscode.window.showErrorMessage("Request timeout.");
            // APIClientSession.invalidateSession();
        } else if (error.response) {
            console.log(error.response);
            console.log(error.request);
            if (error.response.status === 401 && !APIClient.error401thrown) {
                vscode.window.showWarningMessage("It seems that we couldn't log in, please log in.");
                APIClient.error401thrown = true;
                APIClientSession.invalidateSession();
                CoursesProvider.triggerTreeReload();
            } else if (error.response.status === 403 && !APIClient.error403thrown) {
                vscode.window.showWarningMessage("Something went wrong, please try again.");
                APIClient.error403thrown = true;
                APIClient.getXSRFToken();
            } else {
                let msg = error.response.data;
                if (error.response.data instanceof Object) {
                    msg = JSON.stringify(error.response.data);
                }
                vscode.window.showErrorMessage("Error " + error.response.status + ". " + msg);
                APIClient.error401thrown = false;
                APIClient.error403thrown = false;
                // APIClientSession.invalidateSession();
            }
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server. " + error.message);
            APIClientSession.invalidateSession();
        } else {
            vscode.window.showErrorMessage(error.message);
        }
    }

    /*
     * The following methods query the public API of the V4T backend (actions).
     * See specification at:
     * https://github.com/codeurjc-students/2019-VSCode4Teaching/blob/master/vscode4teaching-server/API.md
     */

    public getServerUserInfo(): AxiosPromise<User> {
        const options: AxiosBuildOptions = {
            url: "/api/currentuser",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching user data...");
    }

    public getExercises(courseId: number): AxiosPromise<Exercise[]> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/" + courseId + "/exercises",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching exercises...");
    }

    public getExerciseFiles(exerciseId: number): AxiosPromise<ArrayBuffer> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + exerciseId + "/files",
            method: "GET",
            responseType: "arraybuffer",
        };
        return APIClient.createRequest(options, "Downloading exercise files...", true);
    }

    public addCourse(data: CourseEdit): AxiosPromise<Course> {
        const options: AxiosBuildOptions = {
            url: "/api/courses",
            method: "POST",
            responseType: "json",
            data,
        };
        return APIClient.createRequest(options, "Creating course...");
    }

    public getCourses(): AxiosPromise<Course[]> {
        const options: AxiosBuildOptions = {
            url: "/api/courses",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Getting courses...");
    }

    public editCourse(id: number, data: CourseEdit): AxiosPromise<Course> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/" + id,
            method: "PUT",
            responseType: "json",
            data,
        };
        return APIClient.createRequest(options, "Editing course...");
    }

    public deleteCourse(id: number): AxiosPromise<void> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/" + id,
            method: "DELETE",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Deleting course...");
    }

    public addExercises(courseId: number, exercisesData: ExerciseEdit[]): AxiosPromise<Exercise[]> {
        const options: AxiosBuildOptions = {
            url: "/api/v2/courses/" + courseId + "/exercises",
            method: "POST",
            responseType: "json",
            data: exercisesData,
        };
        return APIClient.createRequest(options, "Adding new exercises...");
    }

    public editExercise(id: number, data: ExerciseEdit): AxiosPromise<Exercise> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + id,
            method: "PUT",
            responseType: "json",
            data,
        };
        return APIClient.createRequest(options, "Sending exercise info...");
    }

    public uploadExerciseTemplate(id: number, data: Buffer, showNotification?: boolean): AxiosPromise<any> {
        const dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + id + "/files/template",
            method: "POST",
            responseType: "json",
            data: dataForm,
        };
        return APIClient.createRequest(options, "Uploading template...", showNotification ?? true);
    }

    public deleteExercise(id: number): AxiosPromise<void> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + id,
            method: "DELETE",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Deleting exercise...");
    }

    public getAllUsers(): AxiosPromise<User[]> {
        const options: AxiosBuildOptions = {
            url: "/api/users",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching user data...");
    }

    public getUsersInCourse(courseId: number): AxiosPromise<User[]> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/" + courseId + "/users",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching user data...");
    }

    public addUsersToCourse(courseId: number, data: ManageCourseUsers): AxiosPromise<Course> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/" + courseId + "/users",
            method: "POST",
            responseType: "json",
            data,
        };
        return APIClient.createRequest(options, "Adding users to course...");
    }

    public removeUsersFromCourse(courseId: number, data: ManageCourseUsers): AxiosPromise<Course> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/" + courseId + "/users",
            method: "DELETE",
            responseType: "json",
            data,
        };
        return APIClient.createRequest(options, "Removing users from course...");
    }

    public getCreator(courseId: number): AxiosPromise<User> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/" + courseId + "/creator",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Getting course info...");
    }

    public uploadFiles(exerciseId: number, data: Buffer): AxiosPromise<any> {
        const dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + exerciseId + "/files",
            method: "POST",
            responseType: "json",
            data: dataForm,
        };
        return APIClient.createRequest(options, "Uploading files...", true);
    }

    public getAllStudentFiles(exerciseId: number): AxiosPromise<ArrayBuffer> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + exerciseId + "/teachers/files",
            method: "GET",
            responseType: "arraybuffer",
        };
        return APIClient.createRequest(options, "Downloading student files...", true);
    }

    public getTemplate(exerciseId: number): AxiosPromise<ArrayBuffer> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + exerciseId + "/files/template",
            method: "GET",
            responseType: "arraybuffer",
        };
        return APIClient.createRequest(options, "Downloading exercise template...", true);
    }

    public getFilesInfo(username: string, exerciseId: number): AxiosPromise<FileInfo[]> {
        const options: AxiosBuildOptions = {
            url: "/api/users/" + username + "/exercises/" + exerciseId + "/files",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching file information...");
    }

    public saveComment(fileId: number, commentThread: ServerCommentThread): AxiosPromise<ServerCommentThread> {
        const options: AxiosBuildOptions = {
            url: "/api/files/" + fileId + "/comments",
            method: "POST",
            responseType: "json",
            data: commentThread,
        };
        return APIClient.createRequest(options, "Saving comments...");
    }

    public getComments(fileId: number): AxiosPromise<ServerCommentThread[] | void> {
        const options: AxiosBuildOptions = {
            url: "/api/files/" + fileId + "/comments",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching comments...");
    }

    public getAllComments(username: string, exerciseId: number): AxiosPromise<FileInfo[] | void> {
        const options: AxiosBuildOptions = {
            url: "/api/users/" + username + "/exercises/" + exerciseId + "/comments",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching comments...");
    }

    public getSharingCode(element: Course | Exercise): AxiosPromise<string> {
        const typeOfUrl = instanceOfCourse(element) ? "courses/" : "exercises/";
        const options: AxiosBuildOptions = {
            url: "/api/" + typeOfUrl + element.id + "/code",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching sharing code...");
    }

    public updateCommentThreadLine(id: number, line: number, lineText: string): AxiosPromise<ServerCommentThread> {
        const data = {
            line,
            lineText,
        };
        const options: AxiosBuildOptions = {
            url: "/api/comments/" + id + "/lines",
            method: "PUT",
            responseType: "json",
            data,
        };
        return APIClient.createRequest(options, "Saving comments...");
    }

    public getCourseWithCode(code: string): AxiosPromise<Course> {
        const options: AxiosBuildOptions = {
            url: "/api/courses/code/" + code,
            method: "PUT",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching course data...");
    }

    public getExerciseUserInfo(exerciseId: number): AxiosPromise<ExerciseUserInfo> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + exerciseId + "/info",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching exercise info for current user...");
    }

    public updateExerciseUserInfo(exerciseId: number, status: number, modifiedFiles?: string[]): AxiosPromise<ExerciseUserInfo> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + exerciseId + "/info",
            method: "PUT",
            responseType: "json",
            data: {
                status,
                modifiedFiles,
            },
        };
        return APIClient.createRequest(options, "Updating exercise user info...");
    }

    public getAllStudentsExerciseUserInfo(exerciseId: number): AxiosPromise<ExerciseUserInfo[]> {
        const options: AxiosBuildOptions = {
            url: "/api/exercises/" + exerciseId + "/info/teacher",
            method: "GET",
            responseType: "json",
        };
        return APIClient.createRequest(options, "Fetching students' exercise user info...", true);
    }

    private signUp(credentials: UserSignup): AxiosPromise<User> {
        const options: AxiosBuildOptions = {
            url: "/api/register",
            method: "POST",
            responseType: "json",
            data: credentials,
        };
        return APIClient.createRequest(options, "Signing up to VS Code 4 Teaching...");
    }

    private inviteTeacher(credentials: UserSignup): AxiosPromise<UserSignup> {
        const options: AxiosBuildOptions = {
            url: "/api/teachers/invitation",
            method: "POST",
            responseType: "json",
            data: credentials,
        };
        return APIClient.createRequest(options, "Inviting teacher to VS Code 4 Teaching...");
    }

    /**
     * Sets vscode status bar and returns axios promise for given options.
     * @param options Options from to build axios request
     * @param statusMessage message to add to the vscode status bar
     */
    private createRequest(options: AxiosBuildOptions, statusMessage: string, notification: boolean = false): AxiosPromise<any> {
        const axiosOptions = APIClientSession.buildOptions(options);
        const thenable = axios(axiosOptions.axiosOptions);
        if (notification) {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
                title: statusMessage,
            }, (progress, token) => thenable);
        } else {
            vscode.window.setStatusBarMessage("$(sync~spin) " + statusMessage, thenable);
        }
        return thenable.then((result) => {
            if (axiosOptions.timeout) {
                clearTimeout(axiosOptions.timeout);
            }
            return result;
        });
    }

    /**
     * Gets XSRF Token from server and sets session's xsrf token
     */
    private async getXSRFToken() {
        const options: AxiosBuildOptions = {
            url: "/api/csrf",
            method: "GET",
            responseType: "json",
        };
        const response = await APIClient.createRequest(options, "Fetching server info...");
        console.debug(response);
        const cookiesString: string | undefined = response.headers["set-cookie"]?.[0];
        if (cookiesString) {
            const cookies = cookiesString.split(";");
            const xsrfCookie = cookies.find((cookie) => cookie.includes("XSRF-TOKEN"));
            if (xsrfCookie) {
                APIClientSession.xsrfToken = xsrfCookie.split("=")[1];
            } else {
                throw Error("XSRF Token not received");
            }
        } else {
            throw Error("XSRF Token not received");
        }
    }

    private login(username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            username,
            password,
        };
        const options: AxiosBuildOptions = {
            url: "/api/login",
            method: "POST",
            responseType: "json",
            data,
        };
        return APIClient.createRequest(options, "Logging in to VS Code 4 Teaching...");
    }
}
// API Client is a singleton
export let APIClient = new APIClientSingleton();
