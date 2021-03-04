
import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import * as FormData from "form-data";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { APIClientSession } from "../../src/client/APIClientSession";
import { ServerCommentThread } from "../../src/model/serverModel/comment/ServerCommentThread";
import { Course } from "../../src/model/serverModel/course/Course";
import { CourseEdit } from "../../src/model/serverModel/course/CourseEdit";
import { ManageCourseUsers } from "../../src/model/serverModel/course/ManageCourseUsers";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseEdit } from "../../src/model/serverModel/exercise/ExerciseEdit";

jest.mock("axios");
const mockedAxios = mocked(axios, false);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

// This tests don't bother with the response of the calls, only the request parameters
describe("client API calls", () => {

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

    afterEach(() => {
        mockedAxios.mockClear();
        mockedVscode.window.setStatusBarMessage.mockClear();
        APIClientSession.baseUrl = undefined;
        APIClientSession.xsrfToken = undefined;
        APIClientSession.jwtToken = undefined;
    });

    beforeEach(() => {
        setLoggedIn();
    });

    it("should request get user info correctly", () => {
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

    it("should request get all users correctly", () => {
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
            url: "/api/users",
        };

        const thenable = APIClient.getAllUsers();

        expectCorrectRequest(expectedOptions, "Fetching user data...", thenable);
    });

    it("should request get users in course correctly", () => {
        const courseId = 1;
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
            url: "/api/courses/" + courseId + "/users",
        };

        const thenable = APIClient.getUsersInCourse(courseId);

        expectCorrectRequest(expectedOptions, "Fetching user data...", thenable);
    });

    it("should request add users to course correctly", () => {
        const courseId = 1;
        const data: ManageCourseUsers = {
            ids: [1, 2, 3],
        };
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "POST",
            responseType: "json",
            url: "/api/courses/" + courseId + "/users",
        };

        const thenable = APIClient.addUsersToCourse(courseId, data);

        expectCorrectRequest(expectedOptions, "Adding users to course...", thenable);
    });

    it("should request remove users from course correctly", () => {
        const courseId = 1;
        const data: ManageCourseUsers = {
            ids: [1, 2, 3],
        };
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "DELETE",
            responseType: "json",
            url: "/api/courses/" + courseId + "/users",
        };

        const thenable = APIClient.removeUsersFromCourse(courseId, data);

        expectCorrectRequest(expectedOptions, "Removing users from course...", thenable);
    });

    it("should request get creator correctly", () => {
        const courseId = 1;
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
            url: "/api/courses/" + courseId + "/creator",
        };

        const thenable = APIClient.getCreator(courseId);

        expectCorrectRequest(expectedOptions, "Getting course info...", thenable);
    });

    it("should request upload files correctly", () => {
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
            url: "/api/exercises/" + exerciseId + "/files",
        };

        const thenable = APIClient.uploadFiles(exerciseId, data);

        expectCorrectRequest(expectedOptions, "Uploading files...", thenable);
    });

    it("should request get all student files correctly", () => {
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
            method: "GET",
            responseType: "arraybuffer",
            url: "/api/exercises/" + exerciseId + "/teachers/files",
        };

        const thenable = APIClient.getAllStudentFiles(exerciseId);

        expectCorrectRequest(expectedOptions, "Downloading student files...", thenable);
    });

    it("should request get template correctly", () => {
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
            method: "GET",
            responseType: "arraybuffer",
            url: "/api/exercises/" + exerciseId + "/files/template",
        };

        const thenable = APIClient.getTemplate(exerciseId);

        expectCorrectRequest(expectedOptions, "Downloading exercise template...", thenable);
    });

    it("should request get files info correctly", () => {
        const exerciseId = 1;
        const username = "johndoejr";
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
            url: "/api/users/" + username + "/exercises/" + exerciseId + "/files",
        };

        const thenable = APIClient.getFilesInfo(username, exerciseId);

        expectCorrectRequest(expectedOptions, "Fetching file information...", thenable);
    });

    it("should request save comment correctly", () => {
        const fileId = 1;
        const serverThread: ServerCommentThread = {
            line: 3,
            lineText: "test",
        };
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: serverThread,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "POST",
            responseType: "json",
            url: "/api/files/" + fileId + "/comments",
        };

        const thenable = APIClient.saveComment(fileId, serverThread);

        expectCorrectRequest(expectedOptions, "Saving comments...", thenable);
    });

    it("should request get comment correctly", () => {
        const fileId = 1;
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
            url: "/api/files/" + fileId + "/comments",
        };

        const thenable = APIClient.getComments(fileId);

        expectCorrectRequest(expectedOptions, "Fetching comments...", thenable);
    });

    it("should request get all comment correctly", () => {
        const exerciseId = 1;
        const username = "johndoejr";
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
            url: "/api/users/" + username + "/exercises/" + exerciseId + "/comments",
        };

        const thenable = APIClient.getAllComments(username, exerciseId);

        expectCorrectRequest(expectedOptions, "Fetching comments...", thenable);
    });

    it("should request get sharing code for course correctly", () => {
        const course: Course = {
            name: "Course",
            id: 1,
            exercises: [],
        };
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
            url: "/api/courses/" + course.id + "/code",
        };

        const thenable = APIClient.getSharingCode(course);

        expectCorrectRequest(expectedOptions, "Fetching sharing code...", thenable);
    });

    it("should request get sharing code for exercise correctly", () => {
        const exercise: Exercise = {
            name: "Exercise",
            id: 1,
        };
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
            url: "/api/exercises/" + exercise.id + "/code",
        };

        const thenable = APIClient.getSharingCode(exercise);

        expectCorrectRequest(expectedOptions, "Fetching sharing code...", thenable);
    });

    it("should request update comment thread line correctly", () => {
        const fileId = 1;
        const lineInfo = {
            line: 3,
            lineText: "test",
        };
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: lineInfo,
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "PUT",
            responseType: "json",
            url: "/api/comments/" + fileId + "/lines",
        };

        const thenable = APIClient.updateCommentThreadLine(fileId, lineInfo.line, lineInfo.lineText);

        expectCorrectRequest(expectedOptions, "Saving comments...", thenable);
    });

    it("should request get sharing code for exercise correctly", () => {
        const code = "testcode";
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
            url: "/api/courses/code/" + code,
        };

        const thenable = APIClient.getCourseWithCode(code);

        expectCorrectRequest(expectedOptions, "Fetching course data...", thenable);
    });

    it("should request get exercise user info for exercise correctly", () => {
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
            method: "GET",
            responseType: "json",
            url: "/api/exercises/" + exerciseId + "/info",
        };

        const thenable = APIClient.getExerciseUserInfo(exerciseId);

        expectCorrectRequest(expectedOptions, "Fetching exercise info for current user...", thenable);
    });

    it("should request update exercise user info for exercise correctly", () => {
        const exerciseId = 1;
        const status = 1;
        const expectedOptions: AxiosRequestConfig = {
            baseURL: baseUrl,
            data: {
                status,
            },
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Cookie": "XSRF-TOKEN=" + xsrfToken,
                "X-XSRF-TOKEN": xsrfToken,
            },
            maxContentLength: Infinity,
            method: "PUT",
            responseType: "json",
            url: "/api/exercises/" + exerciseId + "/info",
        };

        const thenable = APIClient.updateExerciseUserInfo(exerciseId, status);

        expectCorrectRequest(expectedOptions, "Updating exercise user info...", thenable);
    });

    it("should request update exercise user info for exercise correctly", () => {
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
            method: "GET",
            responseType: "json",
            url: "/api/exercises/" + exerciseId + "/info/teacher",
        };

        const thenable = APIClient.getAllStudentsExerciseUserInfo(exerciseId);

        expectCorrectRequest(expectedOptions, "Fetching students' exercise user info...", thenable);
    });
});
