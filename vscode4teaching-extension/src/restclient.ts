import axios, { AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import { User, Exercise, FileInfo, Course, ExerciseEdit, CourseEdit, ManageCourseUsers } from './model/serverModel';
import FormData = require('form-data');
import { ServerCommentThread } from './model/commentServerModel';

export class RestClient {

    private static instance: RestClient;
    private _baseUrl: string | undefined;
    private _jwtToken: string | undefined;
    private _xsrfToken = "";

    private constructor() {
    }

    // Client is a singleton
    public static getClient(): RestClient {
        if (!RestClient.instance) {
            RestClient.instance = new RestClient();
        }

        return RestClient.instance;
    }

    login(username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            "username": username,
            "password": password
        };
        return axios(this.buildOptions("/api/login", "POST", false, data));
    }

    async getCsrfToken() {
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

    public getUserInfo(): AxiosPromise<User> {
        return axios(this.buildOptions("/api/currentuser", "GET", false));
    }

    public getExercises(courseId: number): AxiosPromise<Exercise[]> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/exercises", "GET", false));
    }

    public getExerciseFiles(exerciseId: number): AxiosPromise<ArrayBuffer> {
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/files", "GET", true));
    }

    public addCourse(data: CourseEdit): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses", "POST", false, data));
    }

    public editCourse(id: number, data: CourseEdit): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses/" + id, "PUT", false, data));
    }

    public deleteCourse(id: number): AxiosPromise<void> {
        return axios(this.buildOptions("/api/courses/" + id, "DELETE", false));
    }

    public addExercise(id: number, data: ExerciseEdit): AxiosPromise<Exercise> {
        return axios(this.buildOptions("/api/courses/" + id + "/exercises", "POST", false, data));
    }

    public editExercise(id: number, data: ExerciseEdit): AxiosPromise<Exercise> {
        return axios(this.buildOptions("/api/exercises/" + id, "PUT", false, data));
    }

    public uploadExerciseTemplate(id: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        return axios(this.buildOptions("/api/exercises/" + id + "/files/template", "POST", false, dataForm));
    }

    public deleteExercise(id: number): AxiosPromise<void> {
        return axios(this.buildOptions("/api/exercises/" + id, "DELETE", false));
    }

    public getAllUsers(): AxiosPromise<User[]> {
        return axios(this.buildOptions("/api/users", "GET", false));
    }

    public getUsersInCourse(courseId: number): AxiosPromise<User[]> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/users", "GET", false));
    }

    public addUsersToCourse(courseId: number, data: ManageCourseUsers): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/users", "POST", false, data));
    }

    public removeUsersFromCourse(courseId: number, data: ManageCourseUsers): AxiosPromise<Course> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/users", "DELETE", false, data));
    }

    public getCreator(courseId: number): AxiosPromise<User> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/creator", "GET", false));
    }

    public uploadFiles(exerciseId: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/files", "POST", false, dataForm));
    }

    public getAllStudentFiles(exerciseId: number): AxiosPromise<ArrayBuffer> {
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/teachers/files", "GET", true));
    }

    public getTemplate(exerciseId: number): AxiosPromise<ArrayBuffer> {
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/files/template", "GET", true));
    }

    public getFilesInfo(username: string, exerciseId: number): AxiosPromise<FileInfo[]> {
        return axios(this.buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/files", "GET", false));
    }

    public saveComment(fileId: number, commentThread: ServerCommentThread): AxiosPromise<ServerCommentThread> {
        return axios(this.buildOptions("/api/files/" + fileId + "/comments", "POST", false, commentThread));
    }

    public getComments(fileId: number): AxiosPromise<ServerCommentThread[] | void> {
        return axios(this.buildOptions("/api/files/" + fileId + "/comments", "GET", false));
    }

    public getAllComments(username: string, exerciseId: number): AxiosPromise<FileInfo[] | void> {
        return axios(this.buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/comments", "GET", false));
    }

    public updateCommentThreadLine(id: number, line: number, lineText: string): AxiosPromise<ServerCommentThread> {
        let data = {
            line: line,
            lineText: lineText
        };
        return axios(this.buildOptions("/api/comments/" + id + "/lines", "PUT", false, data));
    }

    private buildOptions(url: string, method: Method, responseIsArrayBuffer: boolean, data?: FormData | any): AxiosRequestConfig {
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

    set jwtToken(jwtToken: string | undefined) {
        this._jwtToken = jwtToken;
    }

    get jwtToken() {
        return this._jwtToken;
    }

    get baseUrl() {
        return this._baseUrl;
    }

    set baseUrl(url: string | undefined) {
        this._baseUrl = url;
    }

    get xsrfToken(): string {
        return this._xsrfToken;
    }

    set xsrfToken(xsrfToken: string) {
        this._xsrfToken = xsrfToken;
    }
}