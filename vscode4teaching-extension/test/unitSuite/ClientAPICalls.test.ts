
import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import * as FormData from "form-data";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { APIClientSession } from "../../src/client/APIClientSession";
import { CourseEdit } from "../../src/model/serverModel/course/CourseEdit";
import { ExerciseEdit } from "../../src/model/serverModel/exercise/ExerciseEdit";

jest.mock("axios");
const mockedAxios = mocked(axios, false);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

describe("client", () => {
    afterEach(() => {
        mockedAxios.mockClear();
        mockedVscode.window.setStatusBarMessage.mockClear();
        APIClientSession.baseUrl = undefined;
        APIClientSession.xsrfToken = undefined;
        APIClientSession.jwtToken = undefined;
    });

    function expectCorrectRequest(options: AxiosRequestConfig, message: string, thenable: AxiosPromise<any>) {
        expect(mockedAxios).toHaveBeenCalledTimes(1);
        if (options.data instanceof FormData) {
            // if formdata content-type is generated randomly
            const config = (mockedAxios.mock.calls[0][0] as AxiosRequestConfig);
            options.headers = config.headers;
            options.data = config.data;
        }
        expect(mockedAxios).toHaveBeenNthCalledWith(1, options);
        expect(mockedVscode.window.setStatusBarMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.setStatusBarMessage).toHaveBeenNthCalledWith(1, message, thenable);
    }

    const baseUrl = "http://test.com";
    const xsrfToken = "test";
    const jwtToken = "test";

    function setLoggedIn() {
        APIClientSession.baseUrl = baseUrl;
        APIClientSession.xsrfToken = xsrfToken;
        APIClientSession.jwtToken = jwtToken;
    }

    it("should request get user info correctly", () => {
        setLoggedIn();
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: undefined,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "GET",
            responseType: "json",
            url: "/api/currentuser",
        };

        const thenable = APIClient.getServerUserInfo();

        expectCorrectRequest(expectedOptions, "Fetching user data...", thenable);
    });

    it("should request get exercises correctly", () => {
        const courseId = 1;
        setLoggedIn();
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: undefined,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "GET",
            responseType: "json",
            url: "/api/courses/" + courseId + "/exercises",
        };

        const thenable = APIClient.getExercises(courseId);

        expectCorrectRequest(expectedOptions, "Fetching exercises...", thenable);
    });

    it("should request get exercise files correctly", () => {
        const exerciseId = 1;
        setLoggedIn();
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: undefined,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "GET",
            responseType: "arraybuffer",
            url: "/api/exercises/" + exerciseId + "/files",
        };

        const thenable = APIClient.getExerciseFiles(exerciseId);

        expectCorrectRequest(expectedOptions, "Downloading exercise files...", thenable);
    });

    it("should request add course correctly", () => {
        setLoggedIn();

        const course: CourseEdit = {
            name: "New course",
        };

        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: course,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "POST",
            responseType: "json",
            url: "/api/courses",
        };

        const thenable = APIClient.addCourse(course);

        expectCorrectRequest(expectedOptions, "Creating course...", thenable);
    });

    it("should request edit course correctly", () => {
        setLoggedIn();
        const oldCourseId = 1;
        const course: CourseEdit = {
            name: "New course",
        };

        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: course,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "PUT",
            responseType: "json",
            url: "/api/courses/" + oldCourseId,
        };

        const thenable = APIClient.editCourse(oldCourseId, course);

        expectCorrectRequest(expectedOptions, "Editing course...", thenable);
    });

    it("should request delete course correctly", () => {
        setLoggedIn();
        const oldCourseId = 1;

        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: undefined,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "DELETE",
            responseType: "json",
            url: "/api/courses/" + oldCourseId,
        };

        const thenable = APIClient.deleteCourse(oldCourseId);

        expectCorrectRequest(expectedOptions, "Deleting course...", thenable);
    });

    it("should request add exercise correctly", () => {
        setLoggedIn();
        const courseId = 1;
        const exercise: ExerciseEdit = {
            name: "New exercise",
        };

        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: exercise,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "POST",
            responseType: "json",
            url: "/api/courses/" + courseId + "/exercises",
        };

        const thenable = APIClient.addExercise(courseId, exercise);

        expectCorrectRequest(expectedOptions, "Adding exercise...", thenable);
    });

    it("should request edit exercise correctly", () => {
        setLoggedIn();
        const exerciseId = 1;
        const exercise: ExerciseEdit = {
            name: "New exercise",
        };

        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: exercise,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "PUT",
            responseType: "json",
            url: "/api/exercises/" + exerciseId,
        };

        const thenable = APIClient.editExercise(exerciseId, exercise);

        expectCorrectRequest(expectedOptions, "Sending exercise info...", thenable);
    });

    it("should request upload exercise template correctly", () => {
        setLoggedIn();
        const exerciseId = 1;
        const data: Buffer = Buffer.from("Test");
        const dataForm = new FormData();
        dataForm.append("file", data, { filename: "template.zip" });
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: dataForm,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "POST",
            responseType: "json",
            url: "/api/exercises/" + exerciseId + "/files/template",
        };

        const thenable = APIClient.uploadExerciseTemplate(exerciseId, data);

        expectCorrectRequest(expectedOptions, "Uploading template...", thenable);
    });

    it("should request delete exercise template correctly", () => {
        setLoggedIn();
        const exerciseId = 1;
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: undefined,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "DELETE",
            responseType: "json",
            url: "/api/exercises/" + exerciseId,
        };

        const thenable = APIClient.deleteExercise(exerciseId);

        expectCorrectRequest(expectedOptions, "Deleting exercise...", thenable);
    });
});
