import { APIClient } from '../../src/client/APIClient';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as mkdirp from 'mkdirp';
import * as vscode from 'vscode';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CurrentUser } from '../../src/client/CurrentUser';
import { CoursesProvider } from '../../src/components/courses/CoursesTreeProvider';
import { mocked } from 'ts-jest/utils';

jest.mock('axios');
const mockedAxios = mocked(axios, false);
jest.mock('../../src/client/CurrentUser');
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock('../../src/components/courses/CoursesTreeProvider');
const mockedCoursesTreeProvider = mocked(CoursesProvider, true);
jest.mock('vscode');
const mockedVscode = mocked(vscode, true);
const baseURL = 'http://localhost:8080';
const xsrfToken = 'testToken';
const jwtToken = 'testToken';

// Helper method to initialize a session file
function createSessionFile (baseURL: string, xsrfToken: string, jwtToken: string) {
    let v4tPath = path.resolve(APIClient.sessionPath, '..');
    if (!fs.existsSync(v4tPath)) {
        mkdirp.sync(v4tPath);
    }
    fs.writeFileSync(APIClient.sessionPath, jwtToken + '\n' + xsrfToken + '\n' + baseURL);
}

function expectSessionInvalidated () {
    // Session is invalidated
    expect(mockedCurrentUser.resetUserInfo).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(APIClient.sessionPath)).toBeFalsy();
}

describe('API Client', () => {
    afterEach(() => {
        APIClient.invalidateSession();
        let v4tPath = path.resolve(__dirname, '..', '..', 'src', 'v4t');
        if (fs.existsSync(v4tPath)) {
            rimraf(v4tPath, ((error) => {
                // console.error(error);
            }));
        }
        mockedAxios.mockReset();
        mockedCoursesTreeProvider.mockClear();
        mockedCoursesTreeProvider.triggerTreeReload.mockClear();
        mockedCurrentUser.getUserInfo.mockClear();
        mockedCurrentUser.isLoggedIn.mockClear();
        mockedCurrentUser.resetUserInfo.mockClear();
        mockedCurrentUser.updateUserInfo.mockClear();
        mockedVscode.window.showWarningMessage.mockClear();
        mockedVscode.window.showErrorMessage.mockClear();
        mockedVscode.window.setStatusBarMessage.mockClear();
    });

    beforeEach(() => {
        createSessionFile(baseURL, xsrfToken, jwtToken);
        APIClient.initializeSessionCredentials();
    });

    it('should log in', async () => {
        const username = 'johndoe';
        const password = 'password';
        const url = 'http://localhost:8080';
        const xsrfToken = '29f6caf7-b522-4730-87c4-bfb1b3db0e66';
        const jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huZG9lIiwiZXhwIjoxNTg0NTc0MDI4LCJpYXQiOjE1ODQ1NTYwMjh9.xH_aiuU73NLfSamv-k7Le20XYL9Zr2VHaMtUQMPhBo5K7E_YUVlQ5WBJ4UkEcqYrB9Sqeh8OK-ShWDagDqVtNA";
        let expectedAxiosConfigXSRFRequest: AxiosRequestConfig = {
            baseURL: url,
            url: '/api/csrf',
            method: 'GET',
            headers: {
            },
            responseType: 'json',
            maxContentLength: Infinity
        };
        let expectedAxiosConfigLoginRequest: AxiosRequestConfig = {
            baseURL: url,
            url: '/api/login',
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': xsrfToken,
                'Cookie': 'XSRF-TOKEN=' + xsrfToken
            },
            data: {
                username: username,
                password: password
            },
            responseType: 'json',
            maxContentLength: Infinity
        };
        let expectedAxiosResponseXSRF: AxiosResponse<string> = { // XSRF Token call
            status: 200,
            statusText: 'OK',
            headers: {
                'set-cookie': ['XSRF-TOKEN=' + xsrfToken + '; Path=/']
            },
            data: '',
            config: expectedAxiosConfigXSRFRequest
        };
        let expectedAxiosResponseLogin: AxiosResponse<Object> = {
            status: 200,
            statusText: 'OK',
            headers: {
            },
            data: {
                "jwtToken": jwtToken
            },
            config: expectedAxiosConfigLoginRequest
        };
        mockedAxios
            .mockRejectedValue('Error in test') //default
            .mockResolvedValueOnce(expectedAxiosResponseXSRF)
            .mockResolvedValueOnce(expectedAxiosResponseLogin);
        await APIClient.loginV4T(username, password, url);

        // Fail if errors are thrown or a promise is rejected (call handleAxiosError)
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledTimes(0);
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledTimes(0);
        // Set status bar when fetching XSRF
        expect(mockedVscode.window.setStatusBarMessage).toHaveBeenCalledTimes(2);
        expect(mockedVscode.window.setStatusBarMessage).toHaveBeenNthCalledWith(1, 'Fetching server info...', expect.anything());
        // Set status bar when calling login
        expect(mockedVscode.window.setStatusBarMessage).toHaveBeenNthCalledWith(2, 'Logging in to VS Code 4 Teaching...', expect.anything());
        // Make a request for XSRF Token
        expect(mockedAxios).toHaveBeenCalledTimes(2);
        expect(mockedAxios).toHaveBeenNthCalledWith(1, expectedAxiosConfigXSRFRequest);
        // Make a request for logging in (fetching JWT Token)
        expect(mockedAxios).toHaveBeenNthCalledWith(2, expectedAxiosConfigLoginRequest);
        // Show user that he is logged in (jwtToken set up)
        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledWith('Logged in');
        // Save session file
        expect(fs.existsSync(APIClient.sessionPath)).toBeTruthy();
        let sessionFileText = fs.readFileSync(APIClient.sessionPath);
        expect(sessionFileText.toString()).toBe(jwtToken + '\n' + xsrfToken + '\n' + url);
        // Current user logged in should be updated
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalled();
        // Tree view should be refreshed
        expect(mockedCoursesTreeProvider.triggerTreeReload).toHaveBeenCalled();
    });

    it('should invalidate session', () => {
        APIClient.invalidateSession();
        expectSessionInvalidated();
    });

    it('should handle error 401', () => {
        const error = {
            response: {
                status: 401
            }
        };
        APIClient.handleAxiosError(error);
        // Warning message showed
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledWith("It seems that we couldn't log in, please log in.");
        // Refresh tree view
        expect(mockedCoursesTreeProvider.triggerTreeReload).toHaveBeenCalledTimes(1);
        expectSessionInvalidated();
    });

    it('should handle error 403', () => {
        const expectedAxiosConfigXSRFRequest: AxiosRequestConfig = {
            baseURL: baseURL,
            url: '/api/csrf',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'X-XSRF-TOKEN': xsrfToken,
                'Cookie': 'XSRF-TOKEN=' + xsrfToken
            },
            responseType: 'json',
            maxContentLength: Infinity
        };
        const expectedAxiosResponseXSRF: AxiosResponse<string> = { // XSRF Token call
            status: 200,
            statusText: 'OK',
            headers: {
                'set-cookie': ['XSRF-TOKEN=29f6caf7-b522-4730-87c4-bfb1b3db0e66; Path=/']
            },
            data: '',
            config: expectedAxiosConfigXSRFRequest
        };
        mockedAxios
            .mockRejectedValue('Error in test') //default
            .mockResolvedValueOnce(expectedAxiosResponseXSRF);
        const error = {
            response: {
                status: 403
            }
        };
        APIClient.handleAxiosError(error);
        // Warning message showed
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledWith("Something went wrong, please try again.");
        // Fetch XSRF Token
        expect(mockedVscode.window.setStatusBarMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.setStatusBarMessage).toHaveBeenNthCalledWith(1, 'Fetching server info...', expect.anything());
        expect(mockedAxios).toHaveBeenCalledTimes(1);
        expect(mockedAxios).toHaveBeenNthCalledWith(1, expectedAxiosConfigXSRFRequest);
    });

    it('should handle rest of http errors', () => {
        const dataError = {
            'error': 'Bad request',
            'url': '/api/error'
        };
        const error = {
            response: {
                status: 400,
                data: dataError
            }
        };
        APIClient.handleAxiosError(error);
        // Error message showed
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledWith('Error 400. ' + JSON.stringify(dataError));
        expectSessionInvalidated();
    });

    it('should handle cannot connect to server', () => {
        const error = {
            request: {
                data: 'Request error'
            },
            message: 'Request error'
        };
        APIClient.handleAxiosError(error);
        // Error message showed
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledWith("Can't connect to the server. " + error.message);
        expectSessionInvalidated();
    });

    it('should handle every error', () => {
        const error = {
            message: 'Request error'
        };
        APIClient.handleAxiosError(error);
        // Error message showed
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledWith(error.message);
        expectSessionInvalidated();
    });
});
