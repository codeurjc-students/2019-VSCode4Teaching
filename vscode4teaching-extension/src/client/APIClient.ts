import axios, { AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import * as serverModel from '../model/serverModel/ServerModel';
import * as FormData from 'form-data';
import { ServerCommentThread } from '../model/serverModel/CommentServerModel';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { CoursesProvider } from '../components/courses/CoursesTreeProvider';
import * as mkdirp from 'mkdirp';
import { CurrentUser } from './CurrentUser';

export namespace APIClient {

    let baseUrl: string | undefined;
    let jwtToken: string | undefined;
    let xsrfToken: string | undefined;
    export const sessionPath = path.resolve(__dirname, '..', 'v4t', 'v4tsession');
    let error401thrown = false;
    let error403thrown = false;

    // Session methods

    /**
     * Initialize session variables with file created when logging in
     */
    export function initializeSessionCredentials () {
        if (fs.existsSync(sessionPath)) {
            let readSession = fs.readFileSync(sessionPath).toString();
            let sessionParts = readSession.split('\n');
            jwtToken = sessionParts[0];
            xsrfToken = sessionParts[1];
            baseUrl = sessionParts[2];
        } else {
            throw Error('No session saved');
        }
    }

    /**
     * Gets XSRF Token from server
     */
    async function getXSRFToken () {
        let response = await createRequest('/api/csrf', 'GET', false, 'Fetching server info...');
        let cookiesString: string | undefined = response.headers['set-cookie'][0];
        if (cookiesString) {
            let cookies = cookiesString.split(';');
            let xsrfCookie = cookies.find(cookie => cookie.includes('XSRF-TOKEN'));
            if (xsrfCookie) {
                xsrfToken = xsrfCookie.split('=')[1];
            } else {
                throw Error('XSRF Token not received');
            }
        } else {
            throw Error('XSRF Token not received');
        }
    }

    /**
     * Helper method to handle errors provoked by calls to the server.
     * If status code is 401 warns about incorrect log in and invalidates session
     * If status code is 403 xsrf token expired so it gets it again
     * Else or if a previous error repeated itself it will output it in an error prompt and invalidate session
     * @param error Error
     */
    export function handleAxiosError (error: any) {
        if (error.response) {
            if (error.response.status === 401 && !error401thrown) {
                vscode.window.showWarningMessage("It seems that we couldn't log in, please log in.");
                error401thrown = true;
                invalidateSession();
            } else if (error.response.status === 403 && !error403thrown) {
                getXSRFToken();
                vscode.window.showWarningMessage('Something went wrong, please try again.');
                error403thrown = true;
            } else {
                let msg = error.response.data;
                if (error.response.data instanceof Object) {
                    msg = JSON.stringify(error.response.data);
                }
                vscode.window.showErrorMessage('Error ' + error.response.status + '. ' + msg);
                error401thrown = false;
                error403thrown = false;
                invalidateSession();
            }
        } else if (error.request) {
            vscode.window.showErrorMessage("Can't connect to the server. " + error.message);
            invalidateSession();
        } else {
            vscode.window.showErrorMessage(error.message);
            invalidateSession();
        }
    }

    /**
     * Invalidates current session and deletes session file
     */
    export function invalidateSession () {
        if (fs.existsSync(sessionPath)) {
            fs.unlinkSync(sessionPath);
        }
        jwtToken = undefined;
        xsrfToken = undefined;
        CurrentUser.resetUserInfo();
        baseUrl = undefined;
        CoursesProvider.triggerTreeReload();
    }

    /**
     * Logs in to V4T, using the username, password and optionally the server URL.
     * It will save the current session JWTToken, XSRF Token and server Url in a file
     * so it can be used to log in at a future (close in time) time.
     * @param username Username
     * @param password Password
     * @param url Server URL
     */
    export async function loginV4T (username: string, password: string, url?: string) {
        try {
            if (url) {
                invalidateSession();
                baseUrl = url;
            }
            await getXSRFToken();
            let response = await login(username, password);
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

    /**
     * Signs up in V4T server.
     * @param userCredentials User to sign up
     * @param url Server URL. Ignored if trying to sign up a teacher.
     * @param isTeacher Sign up as teacher (or not)
     */
    export async function signUpV4T (userCredentials: serverModel.UserSignup, url?: string, isTeacher?: boolean) {
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

    // Server calling methods (actions)

    function login (username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            'username': username,
            'password': password
        };
        return createRequest('/api/login', 'POST', false, 'Logging in to VS Code 4 Teaching...', data);
    }

    export function getServerUserInfo (): AxiosPromise<serverModel.User> {
        return createRequest('/api/currentuser', 'GET', false, 'Fetching user data...');
    }

    export function getExercises (courseId: number): AxiosPromise<serverModel.Exercise[]> {
        return createRequest('/api/courses/' + courseId + '/exercises', 'GET', false, 'Fetching exercises...');
    }

    export function getExerciseFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        return createRequest('/api/exercises/' + exerciseId + '/files', 'GET', true, 'Downloading exercise files...');
    }

    export function addCourse (data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        return createRequest('/api/courses', 'POST', false, 'Creating course...', data);
    }

    export function editCourse (id: number, data: serverModel.CourseEdit): AxiosPromise<serverModel.Course> {
        return createRequest('/api/courses/' + id, 'PUT', false, 'Editing course...', data);
    }

    export function deleteCourse (id: number): AxiosPromise<void> {
        return createRequest('/api/courses/' + id, 'DELETE', false, 'Deleting course...');
    }

    export function addExercise (id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        return createRequest('/api/courses/' + id + '/exercises', 'POST', false, 'Adding exercise...', data);
    }

    export function editExercise (id: number, data: serverModel.ExerciseEdit): AxiosPromise<serverModel.Exercise> {
        return createRequest('/api/exercises/' + id, 'PUT', false, 'Sending exercise info...', data);
    }

    export function uploadExerciseTemplate (id: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append('file', data, { filename: 'template.zip' });
        return createRequest('/api/exercises/' + id + '/files/template', 'POST', false, 'Uploading template...', dataForm);
    }

    export function deleteExercise (id: number): AxiosPromise<void> {
        return createRequest('/api/exercises/' + id, 'DELETE', false, 'Deleting exercise...');
    }

    export function getAllUsers (): AxiosPromise<serverModel.User[]> {
        return createRequest('/api/users', 'GET', false, 'Fetching user data...');
    }

    export function getUsersInCourse (courseId: number): AxiosPromise<serverModel.User[]> {
        return createRequest('/api/courses/' + courseId + '/users', 'GET', false, 'Fetching user data...');
    }

    export function addUsersToCourse (courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        return createRequest('/api/courses/' + courseId + '/users', 'POST', false, 'Adding users to course...', data);
    }

    export function removeUsersFromCourse (courseId: number, data: serverModel.ManageCourseUsers): AxiosPromise<serverModel.Course> {
        return createRequest('/api/courses/' + courseId + '/users', 'DELETE', false, 'Removing users from course...', data);
    }

    export function getCreator (courseId: number): AxiosPromise<serverModel.User> {
        return createRequest('/api/courses/' + courseId + '/creator', 'GET', false, 'Uploading files...');
    }

    export function uploadFiles (exerciseId: number, data: Buffer): AxiosPromise<any> {
        let dataForm = new FormData();
        dataForm.append('file', data, { filename: 'template.zip' });
        return createRequest('/api/exercises/' + exerciseId + '/files', 'POST', false, 'Uploading files...', dataForm);
    }

    export function getAllStudentFiles (exerciseId: number): AxiosPromise<ArrayBuffer> {
        return createRequest('/api/exercises/' + exerciseId + '/teachers/files', 'GET', true, 'Downloading student files...');
    }

    export function getTemplate (exerciseId: number): AxiosPromise<ArrayBuffer> {
        return createRequest('/api/exercises/' + exerciseId + '/files/template', 'GET', true, 'Downloading exercise template...');
    }

    export function getFilesInfo (username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[]> {
        return createRequest('/api/users/' + username + '/exercises/' + exerciseId + '/files', 'GET', false, 'Fetching file information...');
    }

    export function saveComment (fileId: number, commentThread: ServerCommentThread): AxiosPromise<ServerCommentThread> {
        return createRequest('/api/files/' + fileId + '/comments', 'POST', false, 'Fetching comments...', commentThread);
    }

    export function getComments (fileId: number): AxiosPromise<ServerCommentThread[] | void> {
        return createRequest('/api/files/' + fileId + '/comments', 'GET', false, 'Fetching comments...');
    }

    export function getAllComments (username: string, exerciseId: number): AxiosPromise<serverModel.FileInfo[] | void> {
        return createRequest('/api/users/' + username + '/exercises/' + exerciseId + '/comments', 'GET', false, 'Fetching comments...');
    }

    export function getSharingCode (element: serverModel.Course | serverModel.Exercise): AxiosPromise<string> {
        let typeOfUrl = serverModel.instanceOfCourse(element) ? 'courses/' : 'exercises/';
        return createRequest('/api/' + typeOfUrl + element.id + '/code', 'GET', false, 'Fetching sharing code...');
    }

    export function updateCommentThreadLine (id: number, line: number, lineText: string): AxiosPromise<ServerCommentThread> {
        let data = {
            line: line,
            lineText: lineText
        };
        return createRequest('/api/comments/' + id + '/lines', 'PUT', false, 'Saving comments...', data);
    }

    export function getCourseWithCode (code: string): AxiosPromise<serverModel.Course> {
        return createRequest('/api/courses/code/' + code, 'GET', false, 'Fetching course data...');
    }

    export function signUp (credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        return createRequest('/api/register', 'POST', false, 'Signing up to VS Code 4 Teaching...', credentials);
    }

    export function signUpTeacher (credentials: serverModel.UserSignup): AxiosPromise<serverModel.User> {
        return createRequest('/api/teachers/register', 'POST', false, 'Signing teacher up to VS Code 4 Teaching...', credentials);
    }

    function createRequest (url: string, method: Method, expectArrayBuffer: boolean, statusMessage: string, data?: FormData | any): AxiosPromise<any> {
        let thenable = axios(buildOptions(url, method, expectArrayBuffer, data));
        vscode.window.setStatusBarMessage(statusMessage, thenable);
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
            responseType: responseIsArrayBuffer ? 'arraybuffer' : 'json',
            maxContentLength: Infinity
        };
        if (jwtToken) {
            Object.assign(options.headers, { 'Authorization': 'Bearer ' + jwtToken });
        }
        if (xsrfToken) {
            Object.assign(options.headers, { 'X-XSRF-TOKEN': xsrfToken });
            Object.assign(options.headers, { 'Cookie': 'XSRF-TOKEN=' + xsrfToken });
        }
        if (data instanceof FormData) {
            Object.assign(options.headers, data.getHeaders());
        }
        return options;
    }

}