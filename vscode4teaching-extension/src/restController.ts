import axios, { AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import * as serverModel from './model/serverModel';
import * as FormData from 'form-data';
import { ServerCommentThread } from './model/commentServerModel';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { CoursesProvider } from './coursesTreeProvider/coursesTreeProvider';
import * as mkdirp from 'mkdirp';
import { CurrentUser } from './currentUser';

export class RestController {

    private static instance: RestController;
    private _baseUrl: string | undefined;
    private _jwtToken: string | undefined;
    private _xsrfToken: string = "";
    readonly sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
    private error401thrown = false;
    private error403thrown = false;

    private constructor() {
    }

    // Controller is a singleton
    static getController (): RestController {
        if (!RestController.instance) {
            RestController.instance = new RestController();
        }

        return RestController.instance;
    }


    get baseUrl (): string | undefined {
        return this._baseUrl;
    }

    set baseUrl (value: string | undefined) {
        this._baseUrl = value;
    }

    get jwtToken (): string | undefined {
        return this._jwtToken;
    }

    set jwtToken (value: string | undefined) {
        this._jwtToken = value;
    }

    get xsrfToken (): string {
        return this._xsrfToken;
    }

    set xsrfToken (value: string) {
        this._xsrfToken = value;
    }

    // Session methods

    isLoggedIn () {
        return CurrentUser.userinfo !== undefined;
    }

    initializeSessionCredentials () {
        let readSession = fs.readFileSync(this.sessionPath).toString();
        let sessionParts = readSession.split('\n');
        this.jwtToken = sessionParts[0];
        this.xsrfToken = sessionParts[1];
        this.baseUrl = sessionParts[2];
    }

    async getXSRFToken () {
        let response = await axios(this.buildOptions("/api/csrf", "GET", false));
        let cookiesString: string | undefined = response.headers['set-cookie'][0];
        if (cookiesString) {
            let cookies = cookiesString.split(";");
            let xsrfCookie = cookies.find(cookie => cookie.includes("XSRF-TOKEN"));
            if (xsrfCookie) {
                this.xsrfToken = xsrfCookie.split("=")[1];
            }
        }
    }

    handleAxiosError (error: any) {
        if (error.response) {
            if (error.response.status === 401 && !this.error401thrown) {
                vscode.window.showWarningMessage("It seems that we couldn't log in, please log in.");
                this.error401thrown = true;
                this.invalidateSession();
                if (fs.existsSync(this.sessionPath)) {
                    fs.unlinkSync(this.sessionPath);
                }
                CoursesProvider.triggerTreeReload();
            } else if (error.response.status === 403 && !this.error403thrown) {
                vscode.window.showWarningMessage('Something went wrong, please try again.');
                this.error403thrown = true;
                this.getXSRFToken();
            } else {
                let msg = error.response.data;
                if (error.response.data instanceof Object) {
                    msg = JSON.stringify(error.response.data);
                }
                vscode.window.showErrorMessage('Error ' + error.response.status + '. ' + msg);
                this.error401thrown = false;
                this.error403thrown = false;
            }
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server. " + error.message);
            this.invalidateSession();
        } else {
            vscode.window.showErrorMessage(error.message);
            this.invalidateSession();
        }
    }

    invalidateSession () {
        let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
        if (fs.existsSync(sessionPath)) {
            fs.unlinkSync(sessionPath);
        }
        this.jwtToken = undefined;
        this.xsrfToken = '';
        CurrentUser.userinfo = undefined;
        this.baseUrl = undefined;
    }

    async callLogin (username: string, password: string, url?: string) {
        try {
            if (url) {
                this.invalidateSession();
                this.baseUrl = url;
            }
            await this.getXSRFToken();
            let loginThenable = this.login(username, password);
            let response = await loginThenable;
            vscode.window.showInformationMessage('Logged in');
            this.jwtToken = response.data['jwtToken'];
            let v4tPath = path.resolve(__dirname, 'v4t');
            if (!fs.existsSync(v4tPath)) {
                mkdirp.sync(v4tPath);
            }
            let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
            fs.writeFileSync(sessionPath, this.jwtToken + '\n' + this.xsrfToken + '\n' + this.baseUrl);
            await CurrentUser.updateUserInfo();
            CoursesProvider.triggerTreeReload();
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    async callSignup (userCredentials: serverModel.UserSignup, url?: string, isTeacher?: boolean) {
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
                vscode.window.showInformationMessage('Teacher signed up successfully.');
            } else {
                vscode.window.showInformationMessage('Signed up. Please log in.');
            }
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    isBaseUrlInitialized () {
        return this.baseUrl !== undefined;
    }

    setBaseUrl (url: string) {
        this.baseUrl = url;
    }

    // Server calling methods

    login (username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            "username": username,
            "password": password
        };
        let thenable = axios(this.buildOptions("/api/login", "POST", false, data));
        vscode.window.setStatusBarMessage('Logging in to VS Code 4 Teaching...', thenable);
        return thenable;
    }

    getServerUserInfo (): AxiosPromise<serverModel.User> {
        let thenable = axios(this.buildOptions("/api/currentuser", "GET", false));
        vscode.window.setStatusBarMessage('Fetching user data...', thenable);
        return thenable;
    }

    getExercises (courseId: number): AxiosPromise<serverModel.Exercise[]> {
        let thenable = axios(this.buildOptions("/api/courses/" + courseId + "/exercises", "GET", false));
        vscode.window.setStatusBarMessage('Fetching exercises...', thenable);
        return thenable;
    }

    getExerciseFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        let thenable = axios(this.buildOptions("/api/exercises/" + exerciseId + "/files", "GET", true));
        vscode.window.setStatusBarMessage('Downloading exercise files...', thenable);
        return thenable;
    }

    addCourse (data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        let thenable = axios(this.buildOptions("/api/courses", "POST", false, data));
        vscode.window.setStatusBarMessage('Creating course...', thenable);
        return thenable;
    }

    editCourse (id: number, data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        let thenable = axios(this.buildOptions("/api/courses/" + id, "PUT", false, data));
        vscode.window.setStatusBarMessage('Editing course...', thenable);
        return thenable;
    }

    deleteCourse (id: number): AxiosPromise<void> {
        let thenable = axios(this.buildOptions("/api/courses/" + id, "DELETE", false));
        vscode.window.setStatusBarMessage('Deleting course...', thenable);
        return thenable;
    }

    addExercise (id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        let thenable = axios(this.buildOptions("/api/courses/" + id + "/exercises", "POST", false, data));
        vscode.window.setStatusBarMessage('Adding exercise...', thenable);
        return thenable;
    }

    editExercise (id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        let thenable = axios(this.buildOptions("/api/exercises/" + id, "PUT", false, data));
        vscode.window.setStatusBarMessage("Sending exercise info...", thenable);
        return thenable;
    }

    uploadExerciseTemplate (id: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        let thenable = axios(this.buildOptions("/api/exercises/" + id + "/files/template", "POST", false, dataForm));
        vscode.window.setStatusBarMessage('Uploading template...', thenable);
        return thenable;
    }

    deleteExercise (id: number): AxiosPromise<void> {
        let thenable = axios(this.buildOptions("/api/exercises/" + id, "DELETE", false));
        vscode.window.setStatusBarMessage('Deleting exercise...', thenable);
        return thenable;
    }

    getAllUsers (): AxiosPromise<serverModel.User[]> {
        let thenable = axios(this.buildOptions("/api/users", "GET", false));
        vscode.window.setStatusBarMessage("Fetching user data...", thenable);
        return thenable;

    }

    getUsersInCourse (courseId: number): AxiosPromise<serverModel.User[]> {
        let thenable = axios(this.buildOptions("/api/courses/" + courseId + "/users", "GET", false));
        vscode.window.setStatusBarMessage("Fetching user data...", thenable);
        return thenable;
    }

    addUsersToCourse (courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        let thenable = axios(this.buildOptions("/api/courses/" + courseId + "/users", "POST", false, data));
        vscode.window.setStatusBarMessage("Adding users to course...", thenable);
        return thenable;
    }

    removeUsersFromCourse (courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        let thenable = axios(this.buildOptions("/api/courses/" + courseId + "/users", "DELETE", false, data));
        vscode.window.setStatusBarMessage("Removing users from course...", thenable);
        return thenable;
    }

    getCreator (courseId: number): AxiosPromise<serverModel.User> {
        let thenable = axios(this.buildOptions("/api/courses/" + courseId + "/creator", "GET", false));
        vscode.window.setStatusBarMessage("Uploading files...", thenable);
        return thenable;
    }

    uploadFiles (exerciseId: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        let thenable = axios(this.buildOptions("/api/exercises/" + exerciseId + "/files", "POST", false, dataForm));
        vscode.window.setStatusBarMessage("Uploading files...", thenable);
        return thenable;
    }

    getAllStudentFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        let thenable = axios(this.buildOptions("/api/exercises/" + exerciseId + "/teachers/files", "GET", true));
        vscode.window.setStatusBarMessage("Downloading student files...", thenable);
        return thenable;
    }

    getTemplate (exerciseId: number): AxiosPromise<ArrayBuffer> {
        let thenable = axios(this.buildOptions("/api/exercises/" + exerciseId + "/files/template", "GET", true));
        vscode.window.setStatusBarMessage('Downloading exercise template...', thenable);
        return thenable;
    }

    getFilesInfo (username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[]> {
        let thenable = axios(this.buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/files", "GET", false));
        vscode.window.setStatusBarMessage('Fetching file information...', thenable);
        return thenable;
    }

    saveComment (fileId: number, commentThread: ServerCommentThread): AxiosPromise<ServerCommentThread> {
        let thenable = axios(this.buildOptions("/api/files/" + fileId + "/comments", "POST", false, commentThread));
        vscode.window.setStatusBarMessage('Fetching comments...', thenable);
        return thenable;
    }

    getComments (fileId: number): AxiosPromise<ServerCommentThread[] | void> {
        let thenable = axios(this.buildOptions("/api/files/" + fileId + "/comments", "GET", false));
        vscode.window.setStatusBarMessage('Fetching comments...', thenable);
        return thenable;
    }

    getAllComments (username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[] | void> {
        let thenable = axios(this.buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/comments", "GET", false));
        vscode.window.setStatusBarMessage('Fetching comments...', thenable);
        return thenable;
    }

    getSharingCode (element: serverModel.Course | serverModel.Exercise): AxiosPromise<string> {
        let typeOfUrl = serverModel.instanceOfCourse(element) ? "courses/" : "exercises/";
        let thenable = axios(this.buildOptions("/api/" + typeOfUrl + element.id + "/code", "GET", false));
        vscode.window.setStatusBarMessage("Fetching sharing code...", thenable);
        return thenable;
    }

    updateCommentThreadLine (id: number, line: number, lineText: string): AxiosPromise<ServerCommentThread> {
        let data = {
            line: line,
            lineText: lineText
        };
        let thenable = axios(this.buildOptions("/api/comments/" + id + "/lines", "PUT", false, data));
        vscode.window.setStatusBarMessage('Saving comments...', thenable);
        return thenable;
    }

    getCourseWithCode (code: string): AxiosPromise<serverModel.Course> {
        let thenable = axios(this.buildOptions("/api/courses/code/" + code, "GET", false));
        vscode.window.setStatusBarMessage('Fetching course data...', thenable);
        return thenable;
    }

    signUp (credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        let thenable = axios(this.buildOptions("/api/register", "POST", false, credentials));
        vscode.window.setStatusBarMessage('Signing up to VS Code 4 Teaching...', thenable);
        return thenable;
    }

    signUpTeacher (credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        let thenable = axios(this.buildOptions("/api/teachers/register", "POST", false, credentials));
        vscode.window.setStatusBarMessage('Signing teacher up to VS Code 4 Teaching...', thenable);
        return thenable;
    }

    private buildOptions (url: string, method: Method, responseIsArrayBuffer: boolean, data?: FormData | any): AxiosRequestConfig {
        let options: AxiosRequestConfig = {
            url: url,
            baseURL: this.baseUrl,
            method: method,
            data: data,
            headers: {
            },
            responseType: responseIsArrayBuffer ? "arraybuffer" : "json",
            maxContentLength: Infinity
        };
        if (this.jwtToken) {
            Object.assign(options.headers, { "Authorization": "Bearer " + this.jwtToken });
        }
        if (this.xsrfToken !== "") {
            Object.assign(options.headers, { "X-XSRF-TOKEN": this.xsrfToken });
            Object.assign(options.headers, { "Cookie": "XSRF-TOKEN=" + this.xsrfToken });
        }
        if (data instanceof FormData) {
            Object.assign(options.headers, data.getHeaders());
        }
        return options;
    }

}