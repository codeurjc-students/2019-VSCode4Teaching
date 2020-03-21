import axios, { AxiosPromise, AxiosRequestConfig, Method } from "axios";
import * as FormData from "form-data";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as vscode from "vscode";
import { CoursesProvider } from "../components/courses/CoursesTreeProvider";
import { ServerCommentThread } from "../model/serverModel/CommentServerModel";
import * as serverModel from "../model/serverModel/ServerModel";
import { CurrentUser } from "./CurrentUser";
interface BuildOptions {
    url: string;
    method: Method;
    responseType: "arraybuffer" | "json";
    data?: FormData | any;
}

export class APIClient {

    // APIClient is a singleton
    public static getClient() {
        if (!APIClient.instance) {
            APIClient.instance = new APIClient();
        }
        return APIClient.instance;
    }

    private static instance: APIClient | undefined;
    public readonly sessionPath = path.resolve(__dirname, "..", "v4t", "v4tsession");
    private baseUrl: string | undefined;
    private jwtToken: string | undefined;
    private xsrfToken: string | undefined;
    private error401thrown = false;
    private error403thrown = false;

    private constructor() { }
    // Session methods

    /**
     * Checks if user is logged in (User info exists)
     */
    public isLoggedIn() {
        return CurrentUser.isLoggedIn();
    }

    /**
     * Initialize session variables with file created when logging in
     */
    public initializeSessionCredentials() {
        const readSession = fs.readFileSync(this.sessionPath).toString();
        const sessionParts = readSession.split("\n");
        this.jwtToken = sessionParts[0];
        this.xsrfToken = sessionParts[1];
        this.baseUrl = sessionParts[2];
    }

    /**
     * Helper method to handle errors provoked by calls to the server.
     * If status code is 401 warns about incorrect log in and invalidates session
     * If status code is 403 xsrf token expired so it gets it again
     * Else or if a previous error repeated itself it will output it in an error prompt and invalidate session
     * @param error Error
     */
    public handleAxiosError(error: any) {
        if (error.response) {
            if (error.response.status === 401 && !this.error401thrown) {
                vscode.window.showWarningMessage("It seems that we couldn't log in, please log in.");
                this.error401thrown = true;
                this.invalidateSession();
                CoursesProvider.triggerTreeReload();
            } else if (error.response.status === 403 && !this.error403thrown) {
                vscode.window.showWarningMessage("Something went wrong, please try again.");
                this.error403thrown = true;
                this.getXSRFToken();
            } else {
                let msg = error.response.data;
                if (error.response.data instanceof Object) {
                    msg = JSON.stringify(error.response.data);
                }
                vscode.window.showErrorMessage("Error " + error.response.status + ". " + msg);
                this.error401thrown = false;
                this.error403thrown = false;
                this.invalidateSession();
            }
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server. " + error.message);
            this.invalidateSession();
        } else {
            vscode.window.showErrorMessage(error.message);
            this.invalidateSession();
        }
    }

    /**
     * Invalidates current session and deletes session file
     */
    public invalidateSession() {
        if (fs.existsSync(this.sessionPath)) {
            fs.unlinkSync(this.sessionPath);
        }
        this.jwtToken = undefined;
        this.xsrfToken = undefined;
        CurrentUser.resetUserInfo();
        this.baseUrl = undefined;
    }

    /**
     * Logs in to V4T, using the username, password and optionally the server URL.
     * It will save the current session JWTToken, XSRF Token and server Url in a file
     * so it can be used to log in at a future (close in time) time.
     * @param username Username
     * @param password Password
     * @param url Server URL
     */
    public async loginV4T(username: string, password: string, url?: string) {
        try {
            if (url) {
                this.invalidateSession();
                this.baseUrl = url;
            }
            await this.getXSRFToken();
            const response = await this.login(username, password);
            vscode.window.showInformationMessage("Logged in");
            this.jwtToken = response.data.jwtToken;
            const v4tPath = path.resolve(this.sessionPath, "..");
            if (!fs.existsSync(v4tPath)) {
                mkdirp.sync(v4tPath);
            }
            fs.writeFileSync(this.sessionPath, this.jwtToken + "\n" + this.xsrfToken + "\n" + this.baseUrl);
            await CurrentUser.updateUserInfo();
            CoursesProvider.triggerTreeReload();
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Signs up in V4T server.
     * @param userCredentials User to sign up
     * @param url Server URL. Ignored if trying to sign up a teacher.
     * @param isTeacher Sign up as teacher (or not)
     */
    public async signUpV4T(userCredentials: serverModel.UserSignup, url?: string, isTeacher?: boolean) {
        try {
            if (url && !isTeacher) {
                this.invalidateSession();
                this.baseUrl = url;
                await this.getXSRFToken();
            }
            let signupThenable;
            if (isTeacher) {
                signupThenable = this.signUpTeacher(userCredentials);
            } else {
                signupThenable = this.signUp(userCredentials);
            }
            await signupThenable;
            if (isTeacher) {
                vscode.window.showInformationMessage("Teacher signed up successfully.");
            } else {
                vscode.window.showInformationMessage("Signed up. Please log in.");
            }
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    public getServerUserInfo(): AxiosPromise<serverModel.User> {
        const options: BuildOptions = {
            url: "/api/currentuser",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching user data...");
    }

    public getExercises(courseId: number): AxiosPromise<serverModel.Exercise[]> {
        const options: BuildOptions = {
            url: "/api/courses/" + courseId + "/exercises",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching exercises...");
    }

    public getExerciseFiles(exerciseId: number): AxiosPromise<ArrayBuffer> {
        const options: BuildOptions = {
            url: "/api/exercises/" + exerciseId + "/files",
            method: "GET",
            responseType: "arraybuffer",
        };
        return this.createRequest(options, "Downloading exercise files...");
    }

    public addCourse(data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        const options: BuildOptions = {
            url: "/api/courses",
            method: "POST",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Creating course...");
    }

    public editCourse(id: number, data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        const options: BuildOptions = {
            url: "/api/courses" + id,
            method: "PUT",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Editing course...");
    }

    public deleteCourse(id: number): AxiosPromise<void> {
        const options: BuildOptions = {
            url: "/api/courses" + id,
            method: "DELETE",
            responseType: "json",
        };
        return this.createRequest(options, "Deleting course...");
    }

    public addExercise(id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        const options: BuildOptions = {
            url: "/api/courses/" + id + "/exercises",
            method: "POST",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Adding exercise...");
    }

    public editExercise(id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        const options: BuildOptions = {
            url: "/api/exercises/" + id,
            method: "PUT",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Sending exercise info...");
    }

    public uploadExerciseTemplate(id: number, data: Buffer): AxiosPromise<any> {
        const dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        const options: BuildOptions = {
            url: "/api/exercises/" + id + "/files/template",
            method: "POST",
            responseType: "json",
            data: dataForm,
        };
        return this.createRequest(options, "Uploading template...");
    }

    public deleteExercise(id: number): AxiosPromise<void> {
        const options: BuildOptions = {
            url: "/api/exercises/" + id,
            method: "DELETE",
            responseType: "json",
        };
        return this.createRequest(options, "Deleting exercise...");
    }

    public getAllUsers(): AxiosPromise<serverModel.User[]> {
        const options: BuildOptions = {
            url: "/api/users",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching user data...");
    }

    public getUsersInCourse(courseId: number): AxiosPromise<serverModel.User[]> {
        const options: BuildOptions = {
            url: "/api/courses/" + courseId + "/users",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching user data...");
    }

    public addUsersToCourse(courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        const options: BuildOptions = {
            url: "/api/courses/" + courseId + "/users",
            method: "POST",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Adding users to course...");
    }

    public removeUsersFromCourse(courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        const options: BuildOptions = {
            url: "/api/courses/" + courseId + "/users",
            method: "DELETE",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Removing users from course...");
    }

    public getCreator(courseId: number): AxiosPromise<serverModel.User> {
        const options: BuildOptions = {
            url: "/api/courses/" + courseId + "/creator",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Uploading files...");
    }

    public uploadFiles(exerciseId: number, data: Buffer): AxiosPromise<any> {
        const dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        const options: BuildOptions = {
            url: "/api/exercises/" + exerciseId + "/files",
            method: "POST",
            responseType: "json",
            data: dataForm,
        };
        return this.createRequest(options, "Uploading files...");
    }

    public getAllStudentFiles(exerciseId: number): AxiosPromise<ArrayBuffer> {
        const options: BuildOptions = {
            url: "/api/exercises/" + exerciseId + "/teachers/files",
            method: "GET",
            responseType: "arraybuffer",
        };
        return this.createRequest(options, "Downloading student files...");
    }

    public getTemplate(exerciseId: number): AxiosPromise<ArrayBuffer> {
        const options: BuildOptions = {
            url: "/api/exercises/" + exerciseId + "/files/template",
            method: "GET",
            responseType: "arraybuffer",
        };
        return this.createRequest(options, "Downloading exercise template...");
    }

    public getFilesInfo(username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[]> {
        const options: BuildOptions = {
            url: "/api/users/" + username + "/exercises/" + exerciseId + "/files",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching file information...");
    }

    public saveComment(fileId: number, commentThread: ServerCommentThread): AxiosPromise<ServerCommentThread> {
        const options: BuildOptions = {
            url: "/api/files/" + fileId + "/comments",
            method: "POST",
            responseType: "json",
            data: commentThread,
        };
        return this.createRequest(options, "Fetching comments...");
    }

    public getComments(fileId: number): AxiosPromise<ServerCommentThread[] | void> {
        const options: BuildOptions = {
            url: "/api/files/" + fileId + "/comments",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching comments...");
    }

    public getAllComments(username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[] | void> {
        const options: BuildOptions = {
            url: "/api/users/" + username + "/exercises/" + exerciseId + "/comments",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching comments...");
    }

    public getSharingCode(element: serverModel.Course | serverModel.Exercise): AxiosPromise<string> {
        const typeOfUrl = serverModel.instanceOfCourse(element) ? "courses/" : "exercises/";
        const options: BuildOptions = {
            url: "/api/" + typeOfUrl + element.id + "/code",
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching sharing code...");
    }

    public updateCommentThreadLine(id: number, line: number, lineText: string): AxiosPromise<ServerCommentThread> {
        const data = {
            line,
            lineText,
        };
        const options: BuildOptions = {
            url: "/api/comments/" + id + "/lines",
            method: "PUT",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Saving comments...");
    }

    public getCourseWithCode(code: string): AxiosPromise<serverModel.Course> {
        const options: BuildOptions = {
            url: "/api/courses/code/" + code,
            method: "GET",
            responseType: "json",
        };
        return this.createRequest(options, "Fetching course data...");
    }

    public signUp(credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        const options: BuildOptions = {
            url: "/api/register",
            method: "POST",
            responseType: "json",
            data: credentials,
        };
        return this.createRequest(options, "Signing up to VS Code 4 Teaching...");
    }

    public signUpTeacher(credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        const options: BuildOptions = {
            url: "/api/teachers/register",
            method: "POST",
            responseType: "json",
            data: credentials,
        };
        return this.createRequest(options, "Signing teacher up to VS Code 4 Teaching...");
    }

    /**
     * Gets XSRF Token from server
     */
    private async getXSRFToken() {
        const options: BuildOptions = {
            url: "/api/csrf",
            method: "GET",
            responseType: "json",
        };
        const response = await this.createRequest(options, "Fetching server info...");
        const cookiesString: string | undefined = response.headers["set-cookie"][0];
        if (cookiesString) {
            const cookies = cookiesString.split(";");
            const xsrfCookie = cookies.find((cookie) => cookie.includes("XSRF-TOKEN"));
            if (xsrfCookie) {
                this.xsrfToken = xsrfCookie.split("=")[1];
            } else {
                throw Error("XSRF Token not received");
            }
        } else {
            throw Error("XSRF Token not received");
        }
    }

    // Server calling methods

    private login(username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            username,
            password,
        };
        const options: BuildOptions = {
            url: "/api/login",
            method: "POST",
            responseType: "json",
            data,
        };
        return this.createRequest(options, "Logging in to VS Code 4 Teaching...");
    }

    private createRequest(options: BuildOptions, statusMessage: string): AxiosPromise<any> {
        const thenable = axios(this.buildOptions(options));
        vscode.window.setStatusBarMessage(statusMessage, thenable);
        return thenable;
    }

    private buildOptions(options: BuildOptions): AxiosRequestConfig {
        const axiosConfig: AxiosRequestConfig = {
            url: options.url,
            baseURL: this.baseUrl,
            method: options.method,
            data: options.data,
            headers: {
            },
            responseType: options.responseType,
            maxContentLength: Infinity,
        };
        if (this.jwtToken) {
            Object.assign(axiosConfig.headers, { Authorization: "Bearer " + this.jwtToken });
        }
        if (this.xsrfToken) {
            Object.assign(axiosConfig.headers, { "X-XSRF-TOKEN": this.xsrfToken });
            Object.assign(axiosConfig.headers, { Cookie: "XSRF-TOKEN=" + this.xsrfToken });
        }
        if (options.data instanceof FormData) {
            Object.assign(axiosConfig.headers, options.data.getHeaders());
        }
        return axiosConfig;
    }

}
