import axios, { AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import * as serverModel from '../model/serverModel/ServerModel';
import * as FormData from 'form-data';
import { ServerCommentThread } from '../model/serverModel/CommentServerModel';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { CoursesProvider } from '../components/coursesTreeProvider/CoursesTreeProvider';
import * as mkdirp from 'mkdirp';
import { CurrentUser } from '../model/CurrentUser';

export namespace APIClient {

    export var baseUrl: string | undefined;
    export var jwtToken: string | undefined;
    export var xsrfToken: string = "";
    export const sessionPath = path.resolve(__dirname, '..', 'v4t', 'v4tsession');
    var error401thrown = false;
    var error403thrown = false;

    // Session methods

    export function isLoggedIn () {
        return CurrentUser.userinfo !== undefined;
    }

    export function initializeSessionCredentials () {
        let readSession = fs.readFileSync(sessionPath).toString();
        let sessionParts = readSession.split('\n');
        jwtToken = sessionParts[0];
        xsrfToken = sessionParts[1];
        baseUrl = sessionParts[2];
    }

    export async function getXSRFToken () {
        let response = await axios(buildOptions("/api/csrf", "GET", false));
        let cookiesString: string | undefined = response.headers['set-cookie'][0];
        if (cookiesString) {
            let cookies = cookiesString.split(";");
            let xsrfCookie = cookies.find(cookie => cookie.includes("XSRF-TOKEN"));
            if (xsrfCookie) {
                xsrfToken = xsrfCookie.split("=")[1];
            }
        }
    }

    export function handleAxiosError (error: any) {
        if (error.response) {
            if (error.response.status === 401 && !error401thrown) {
                vscode.window.showWarningMessage("It seems that we couldn't log in, please log in.");
                error401thrown = true;
                invalidateSession();
                if (fs.existsSync(sessionPath)) {
                    fs.unlinkSync(sessionPath);
                }
                CoursesProvider.triggerTreeReload();
            } else if (error.response.status === 403 && !error403thrown) {
                vscode.window.showWarningMessage('Something went wrong, please try again.');
                error403thrown = true;
                getXSRFToken();
            } else {
                let msg = error.response.data;
                if (error.response.data instanceof Object) {
                    msg = JSON.stringify(error.response.data);
                }
                vscode.window.showErrorMessage('Error ' + error.response.status + '. ' + msg);
                error401thrown = false;
                error403thrown = false;
            }
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server. " + error.message);
            invalidateSession();
        } else {
            vscode.window.showErrorMessage(error.message);
            invalidateSession();
        }
    }

    export function invalidateSession () {
        let sessionPath = path.resolve(__dirname, 'v4t', 'v4tsession');
        if (fs.existsSync(sessionPath)) {
            fs.unlinkSync(sessionPath);
        }
        jwtToken = undefined;
        xsrfToken = '';
        CurrentUser.userinfo = undefined;
        baseUrl = undefined;
    }

    export async function callLogin (username: string, password: string, url?: string) {
        try {
            if (url) {
                invalidateSession();
                baseUrl = url;
            }
            await getXSRFToken();
            let loginThenable = login(username, password);
            let response = await loginThenable;
            vscode.window.showInformationMessage('Logged in');
            jwtToken = response.data['jwtToken'];
            let v4tPath = path.resolve(sessionPath, '..');
            if (!fs.existsSync(v4tPath)) {
                mkdirp.sync(v4tPath);
            }
            fs.writeFileSync(sessionPath, jwtToken + '\n' + xsrfToken + '\n' + baseUrl);
            await CurrentUser.updateUserInfo();
            CoursesProvider.triggerTreeReload();
        } catch (error) {
            handleAxiosError(error);
        }
    }

    export async function callSignup (userCredentials: serverModel.UserSignup, url?: string, isTeacher?: boolean) {
        try {
            if (url && !isTeacher) {
                invalidateSession();
                baseUrl = url;
                await getXSRFToken();
            }
            let signupThenable;
            if (isTeacher) {
                signupThenable = signUpTeacher(userCredentials);
            } else {
                signupThenable = signUp(userCredentials);
            }
            await signupThenable;
            if (isTeacher) {
                vscode.window.showInformationMessage('Teacher signed up successfully.');
            } else {
                vscode.window.showInformationMessage('Signed up. Please log in.');
            }
        } catch (error) {
            handleAxiosError(error);
        }
    }

    export function isBaseUrlInitialized () {
        return baseUrl !== undefined;
    }

    export function setBaseUrl (url: string) {
        baseUrl = url;
    }

    // Server calling methods

    export function login (username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            "username": username,
            "password": password
        };
        let thenable = axios(buildOptions("/api/login", "POST", false, data));
        vscode.window.setStatusBarMessage('Logging in to VS Code 4 Teaching...', thenable);
        return thenable;
    }

    export function getServerUserInfo (): AxiosPromise<serverModel.User> {
        let thenable = axios(buildOptions("/api/currentuser", "GET", false));
        vscode.window.setStatusBarMessage('Fetching user data...', thenable);
        return thenable;
    }

    export function getExercises (courseId: number): AxiosPromise<serverModel.Exercise[]> {
        let thenable = axios(buildOptions("/api/courses/" + courseId + "/exercises", "GET", false));
        vscode.window.setStatusBarMessage('Fetching exercises...', thenable);
        return thenable;
    }

    export function getExerciseFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        let thenable = axios(buildOptions("/api/exercises/" + exerciseId + "/files", "GET", true));
        vscode.window.setStatusBarMessage('Downloading exercise files...', thenable);
        return thenable;
    }

    export function addCourse (data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        let thenable = axios(buildOptions("/api/courses", "POST", false, data));
        vscode.window.setStatusBarMessage('Creating course...', thenable);
        return thenable;
    }

    export function editCourse (id: number, data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        let thenable = axios(buildOptions("/api/courses/" + id, "PUT", false, data));
        vscode.window.setStatusBarMessage('Editing course...', thenable);
        return thenable;
    }

    export function deleteCourse (id: number): AxiosPromise<void> {
        let thenable = axios(buildOptions("/api/courses/" + id, "DELETE", false));
        vscode.window.setStatusBarMessage('Deleting course...', thenable);
        return thenable;
    }

    export function addExercise (id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        let thenable = axios(buildOptions("/api/courses/" + id + "/exercises", "POST", false, data));
        vscode.window.setStatusBarMessage('Adding exercise...', thenable);
        return thenable;
    }

    export function editExercise (id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        let thenable = axios(buildOptions("/api/exercises/" + id, "PUT", false, data));
        vscode.window.setStatusBarMessage("Sending exercise info...", thenable);
        return thenable;
    }

    export function uploadExerciseTemplate (id: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        let thenable = axios(buildOptions("/api/exercises/" + id + "/files/template", "POST", false, dataForm));
        vscode.window.setStatusBarMessage('Uploading template...', thenable);
        return thenable;
    }

    export function deleteExercise (id: number): AxiosPromise<void> {
        let thenable = axios(buildOptions("/api/exercises/" + id, "DELETE", false));
        vscode.window.setStatusBarMessage('Deleting exercise...', thenable);
        return thenable;
    }

    export function getAllUsers (): AxiosPromise<serverModel.User[]> {
        let thenable = axios(buildOptions("/api/users", "GET", false));
        vscode.window.setStatusBarMessage("Fetching user data...", thenable);
        return thenable;

    }

    export function getUsersInCourse (courseId: number): AxiosPromise<serverModel.User[]> {
        let thenable = axios(buildOptions("/api/courses/" + courseId + "/users", "GET", false));
        vscode.window.setStatusBarMessage("Fetching user data...", thenable);
        return thenable;
    }

    export function addUsersToCourse (courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        let thenable = axios(buildOptions("/api/courses/" + courseId + "/users", "POST", false, data));
        vscode.window.setStatusBarMessage("Adding users to course...", thenable);
        return thenable;
    }

    export function removeUsersFromCourse (courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        let thenable = axios(buildOptions("/api/courses/" + courseId + "/users", "DELETE", false, data));
        vscode.window.setStatusBarMessage("Removing users from course...", thenable);
        return thenable;
    }

    export function getCreator (courseId: number): AxiosPromise<serverModel.User> {
        let thenable = axios(buildOptions("/api/courses/" + courseId + "/creator", "GET", false));
        vscode.window.setStatusBarMessage("Uploading files...", thenable);
        return thenable;
    }

    export function uploadFiles (exerciseId: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        let thenable = axios(buildOptions("/api/exercises/" + exerciseId + "/files", "POST", false, dataForm));
        vscode.window.setStatusBarMessage("Uploading files...", thenable);
        return thenable;
    }

    export function getAllStudentFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        let thenable = axios(buildOptions("/api/exercises/" + exerciseId + "/teachers/files", "GET", true));
        vscode.window.setStatusBarMessage("Downloading student files...", thenable);
        return thenable;
    }

    export function getTemplate (exerciseId: number): AxiosPromise<ArrayBuffer> {
        let thenable = axios(buildOptions("/api/exercises/" + exerciseId + "/files/template", "GET", true));
        vscode.window.setStatusBarMessage('Downloading exercise template...', thenable);
        return thenable;
    }

    export function getFilesInfo (username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[]> {
        let thenable = axios(buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/files", "GET", false));
        vscode.window.setStatusBarMessage('Fetching file information...', thenable);
        return thenable;
    }

    export function saveComment (fileId: number, commentThread: ServerCommentThread): AxiosPromise<ServerCommentThread> {
        let thenable = axios(buildOptions("/api/files/" + fileId + "/comments", "POST", false, commentThread));
        vscode.window.setStatusBarMessage('Fetching comments...', thenable);
        return thenable;
    }

    export function getComments (fileId: number): AxiosPromise<ServerCommentThread[] | void> {
        let thenable = axios(buildOptions("/api/files/" + fileId + "/comments", "GET", false));
        vscode.window.setStatusBarMessage('Fetching comments...', thenable);
        return thenable;
    }

    export function getAllComments (username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[] | void> {
        let thenable = axios(buildOptions("/api/users/" + username + "/exercises/" + exerciseId + "/comments", "GET", false));
        vscode.window.setStatusBarMessage('Fetching comments...', thenable);
        return thenable;
    }

    export function getSharingCode (element: serverModel.Course | serverModel.Exercise): AxiosPromise<string> {
        let typeOfUrl = serverModel.instanceOfCourse(element) ? "courses/" : "exercises/";
        let thenable = axios(buildOptions("/api/" + typeOfUrl + element.id + "/code", "GET", false));
        vscode.window.setStatusBarMessage("Fetching sharing code...", thenable);
        return thenable;
    }

    export function updateCommentThreadLine (id: number, line: number, lineText: string): AxiosPromise<ServerCommentThread> {
        let data = {
            line: line,
            lineText: lineText
        };
        let thenable = axios(buildOptions("/api/comments/" + id + "/lines", "PUT", false, data));
        vscode.window.setStatusBarMessage('Saving comments...', thenable);
        return thenable;
    }

    export function getCourseWithCode (code: string): AxiosPromise<serverModel.Course> {
        let thenable = axios(buildOptions("/api/courses/code/" + code, "GET", false));
        vscode.window.setStatusBarMessage('Fetching course data...', thenable);
        return thenable;
    }

    export function signUp (credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        let thenable = axios(buildOptions("/api/register", "POST", false, credentials));
        vscode.window.setStatusBarMessage('Signing up to VS Code 4 Teaching...', thenable);
        return thenable;
    }

    export function signUpTeacher (credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        let thenable = axios(buildOptions("/api/teachers/register", "POST", false, credentials));
        vscode.window.setStatusBarMessage('Signing teacher up to VS Code 4 Teaching...', thenable);
        return thenable;
    }

    function buildOptions (url: string, method: Method, responseIsArrayBuffer: boolean, data?: FormData | any): AxiosRequestConfig {
        let options: AxiosRequestConfig = {
            url: url,
            baseURL: baseUrl,
            method: method,
            data: data,
            headers: {
            },
            responseType: responseIsArrayBuffer ? "arraybuffer" : "json",
            maxContentLength: Infinity
        };
        if (jwtToken) {
            Object.assign(options.headers, { "Authorization": "Bearer " + jwtToken });
        }
        if (xsrfToken !== "") {
            Object.assign(options.headers, { "X-XSRF-TOKEN": xsrfToken });
            Object.assign(options.headers, { "Cookie": "XSRF-TOKEN=" + xsrfToken });
        }
        if (data instanceof FormData) {
            Object.assign(options.headers, data.getHeaders());
        }
        return options;
    }

}