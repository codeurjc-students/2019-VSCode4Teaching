import { APIClient } from '../../src/client/APIClient';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as mkdirp from 'mkdirp';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CurrentUser } from '../../src/client/CurrentUser';
import { CoursesProvider } from '../../src/components/courses/CoursesTreeProvider';
import { mocked } from 'ts-jest/utils';
//const CurrentUser = require('./__mocks__/CurrentUser');
const vscode = require('./__mocks__/vscode');

jest.mock('axios');
const mockedAxios = mocked(axios, false);
jest.mock('../../src/client/CurrentUser');
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock('../../src/components/courses/CoursesTreeProvider');
const mockedCoursesTreeProvider = mocked(CoursesProvider, true);

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
        mockedCoursesTreeProvider.mockReset();
    });

    it('should log in', async () => {
        let username = 'johndoe';
        let password = 'password';
        let url = 'http://localhost:8080';
        let xsrfToken = '29f6caf7-b522-4730-87c4-bfb1b3db0e66';
        let jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huZG9lIiwiZXhwIjoxNTg0NTc0MDI4LCJpYXQiOjE1ODQ1NTYwMjh9.xH_aiuU73NLfSamv-k7Le20XYL9Zr2VHaMtUQMPhBo5K7E_YUVlQ5WBJ4UkEcqYrB9Sqeh8OK-ShWDagDqVtNA";
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

        // Fail if errors are thrown
        let warningCall = vscode.window.showWarningMessage.mock.calls;
        let errorCall = vscode.window.showErrorMessage.mock.calls;
        if (warningCall) {
            console.error(warningCall);
        }
        if (errorCall) {
            console.error(errorCall);
        }
        expect(vscode.window.showWarningMessage).toHaveBeenCalledTimes(0);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(0);
        expect(vscode.window.setStatusBarMessage).toHaveBeenCalledTimes(2);
        expect(vscode.window.setStatusBarMessage).toHaveBeenNthCalledWith(1, 'Fetching server info...', expect.anything());
        expect(vscode.window.setStatusBarMessage).toHaveBeenNthCalledWith(2, 'Logging in to VS Code 4 Teaching...', expect.anything());
        expect(mockedAxios).toHaveBeenCalledTimes(2);
        expect(mockedAxios).toHaveBeenNthCalledWith(1, expectedAxiosConfigXSRFRequest);
        expect(mockedAxios).toHaveBeenNthCalledWith(2, expectedAxiosConfigLoginRequest);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Logged in');
        expect(APIClient.jwtToken).toBe(jwtToken);
        // Save session file
        expect(fs.existsSync(APIClient.sessionPath)).toBeTruthy();
        let sessionFileText = fs.readFileSync(APIClient.sessionPath);
        expect(sessionFileText.toString()).toBe(jwtToken + '\n' + xsrfToken + '\n' + url);
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalled();
        expect(mockedCoursesTreeProvider.triggerTreeReload).toHaveBeenCalled();

        // Clean up
        mockedCurrentUser.updateUserInfo.mockReset();
    });

    it('should invalidate session', () => {
        APIClient.baseUrl = 'http://wrongurl.com:8080';
        APIClient.jwtToken = 'testToken';
        APIClient.xsrfToken = 'testToken';
        // Create test session file
        if (!fs.existsSync(APIClient.sessionPath)) {
            let sessionDir = path.resolve(APIClient.sessionPath, '..');
            if (!fs.existsSync(sessionDir)) {
                mkdirp.sync(sessionDir);
            }
            fs.writeFileSync(APIClient.sessionPath, 'testToken\ntestToken\nhttp://wrongurl.com:8080');
        }
        APIClient.invalidateSession();
        expect(APIClient.baseUrl).toBeUndefined();
        expect(APIClient.jwtToken).toBeUndefined();
        expect(APIClient.xsrfToken).toBeUndefined();
        expect(fs.existsSync(APIClient.sessionPath)).toBeFalsy();
    });
});
