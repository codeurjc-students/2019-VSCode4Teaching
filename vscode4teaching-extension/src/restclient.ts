import axios, { AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import { User, Exercise, FileInfo, Course, ExerciseEdit, CourseEdit, ManageCourseUsers, instanceOfCourse, UserSignup } from './model/serverModel';
import FormData = require('form-data');
import { ServerCommentThread } from './model/commentServerModel';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { CoursesProvider } from './coursesTreeProvider/coursesTreeProvider';
import mkdirp = require('mkdirp');

export class RestClient {

    private static instance: RestClient;
    public baseUrl: string | undefined;
    public jwtToken: string | undefined;
    public xsrfToken = "";
    public userinfo: User | undefined;
    readonly sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
    private error401thrown = false;
    private error403thrown = false;

    private constructor() {
    }

    // Client is a singleton
    public static getClient (): RestClient {
        if (!RestClient.instance) {
            RestClient.instance = new RestClient();
        }

        return RestClient.instance;
    }

    // Session methods

    login (username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            "username": username,
            "password": password
        };
        return axios(this.buildOptions("/api/login", "POST", false, data));
    }

    isLoggedIn () {
        return this.userinfo !== undefined;
    }

    initializeSessionCredentials () {
        let readSession = fs.readFileSync(this.sessionPath).toString();
        let sessionParts = readSession.split('\n');
        this.jwtToken = sessionParts[0];
        this.xsrfToken = sessionParts[1];
        this.baseUrl = sessionParts[2];
    }

    async getCsrfToken () {
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
                this.getCsrfToken();
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
        this.userinfo = undefined;
        this.baseUrl = undefined;
    }

    async callLogin (username: string, password: string, url?: string) {
        try {
            if (url) {
                this.invalidateSession();
                this.baseUrl = url;
            }
            await this.getCsrfToken();
            let loginThenable = this.login(username, password);
            vscode.window.setStatusBarMessage('Logging in to VS Code 4 Teaching...', loginThenable);
            let response = await loginThenable;
            vscode.window.showInformationMessage('Logged in');
            this.jwtToken = response.data['jwtToken'];
            let v4tPath = path.resolve(__dirname, 'v4t');
            if (!fs.existsSync(v4tPath)) {
                mkdirp.sync(v4tPath);
            }
            let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
            fs.writeFileSync(sessionPath, this.jwtToken + '\n' + this.xsrfToken + '\n' + this.baseUrl);
            await this.getUserInfo();
            CoursesProvider.triggerTreeReload();
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    async callSignup (userCredentials: UserSignup, url?: string) {
        try {
            if (url) {
                this.invalidateSession();
                this.baseUrl = url;
            }
            await this.getCsrfToken();
            let signupThenable = this.signUp(userCredentials);
            vscode.window.setStatusBarMessage('Signing up to VS Code 4 Teaching...', signupThenable);
            let response = await signupThenable;
            vscode.window.showInformationMessage('Signed up. Please log in.');
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    async getUserInfo () {
        let coursesThenable = this.getServerUserInfo();
        vscode.window.setStatusBarMessage('Getting user courses...', coursesThenable);
        // Errors have to be controlled in the caller function
        let userResponse = await coursesThenable;
        if (userResponse.data.courses && userResponse.data.courses.length > 0) {
            userResponse.data.courses.forEach(course => {
                if (!course.exercises) {
                    course.exercises = [];
                }
            });
        }
        this.userinfo = userResponse.data;
    }

    newUserInfo () {
        this.userinfo = {
            id: -1,
            username: "",
            roles: [{ roleName: "ROLE_STUDENT" }]
        };
        return this.userinfo;
    }

    isBaseUrlInitialized () {
        return this.baseUrl !== undefined;
    }

    setBaseUrl (url: string) {
        this.baseUrl = url;
    }

    // Server calling methods

    public getServerUserInfo (): AxiosPromise<User> {
        return axios(this.buildOptions("/api/currentuser", "GET", false));
    }

    public getExercises (courseId: number): AxiosPromise<Exercise[]> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/exercises", "GET", false));
    }

    public getExerciseFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/files", "GET", true));
    }

    public addCourse (data: CourseEdit): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses", "POST", false, data));
    }

    public editCourse (id: number, data: CourseEdit): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses/" + id, "PUT", false, data));
    }

    public deleteCourse (id: number): AxiosPromise<void> {
        return axios(this.buildOptions("/api/courses/" + id, "DELETE", false));
    }

    public addExercise (id: number, data: ExerciseEdit): AxiosPromise<Exercise> {
        return axios(this.buildOptions("/api/courses/" + id + "/exercises", "POST", false, data));
    }

    public editExercise (id: number, data: ExerciseEdit): AxiosPromise<Exercise> {
        return axios(this.buildOptions("/api/exercises/" + id, "PUT", false, data));
    }

    public uploadExerciseTemplate (id: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        return axios(this.buildOptions("/api/exercises/" + id + "/files/template", "POST", false, dataForm));
    }

    public deleteExercise (id: number): AxiosPromise<void> {
        return axios(this.buildOptions("/api/exercises/" + id, "DELETE", false));
    }

    public getAllUsers (): AxiosPromise<User[]> {
        return axios(this.buildOptions("/api/users", "GET", false));
    }

    public getUsersInCourse (courseId: number): AxiosPromise<User[]> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/users", "GET", false));
    }

    public addUsersToCourse (courseId: number, data: ManageCourseUsers): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/users", "POST", false, data));
    }

    public removeUsersFromCourse (courseId: number, data: ManageCourseUsers): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/users", "DELETE", false, data));
    }

    public getCreator (courseId: number): AxiosPromise<User> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/creator", "GET", false));
    }

    public uploadFiles (exerciseId: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/files", "POST", false, dataForm));
    }

    public getAllStudentFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/teachers/files", "GET", true));
    }

    public getTemplate (exerciseId: number): AxiosPromise<ArrayBuffer> {
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/files/template", "GET", true));
    }

    public getFilesInfo (username: string, exerciseId: number): AxiosPromise<FileInfo[]> {
        return axios(this.buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/files", "GET", false));
    }

    public saveComment (fileId: number, commentThread: ServerCommentThread): AxiosPromise<ServerCommentThread> {
        return axios(this.buildOptions("/api/files/" + fileId + "/comments", "POST", false, commentThread));
    }

    public getComments (fileId: number): AxiosPromise<ServerCommentThread[] | void> {
        return axios(this.buildOptions("/api/files/" + fileId + "/comments", "GET", false));
    }

    public getAllComments (username: string, exerciseId: number): AxiosPromise<FileInfo[] | void> {
        return axios(this.buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/comments", "GET", false));
    }

    public getSharingCode (element: Course | Exercise): AxiosPromise<string> {
        let typeOfUrl = instanceOfCourse(element) ? "courses/" : "exercises/";
        return axios(this.buildOptions("/api/" + typeOfUrl + element.id + "/code", "GET", false));
    }

    public updateCommentThreadLine (id: number, line: number, lineText: string): AxiosPromise<ServerCommentThread> {
        let data = {
            line: line,
            lineText: lineText
        };
        return axios(this.buildOptions("/api/comments/" + id + "/lines", "PUT", false, data));
    }

    public getCourseWithCode (code: string): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses/code/" + code, "GET", false));
    }

    public signUp (credentials: UserSignup): AxiosPromise<User> {
        return axios(this.buildOptions("/api/register", "POST", false, credentials));
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