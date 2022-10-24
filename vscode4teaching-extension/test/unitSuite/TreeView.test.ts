import { AxiosResponse } from "axios";
import { mocked } from "ts-jest/utils";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { CoursesProvider } from "../../src/components/courses/CoursesTreeProvider";
import { UserPick } from "../../src/components/courses/UserPick";
import { V4TBuildItems } from "../../src/components/courses/V4TItem/V4TBuiltItems";
import { V4TItem } from "../../src/components/courses/V4TItem/V4TItem";
import { V4TItemType } from "../../src/components/courses/V4TItem/V4TItemType";
import { Validators } from "../../src/components/courses/Validators";
import { Course } from "../../src/model/serverModel/course/Course";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { User } from "../../src/model/serverModel/user/User";
import { FileZipUtil } from "../../src/utils/FileZipUtil";
import { ExerciseEdit } from "../../src/model/serverModel/exercise/ExerciseEdit";
import { mockFsDirent, mockFsStatus } from "./__mocks__/mockFsUtils";
import { mockedPathJoin } from "./__mocks__/mockPathUtils";
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { ExerciseStatus } from "../../src/model/serverModel/exercise/ExerciseStatus";

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("../../src/utils/FileZipUtil");
const mockedFileZipUtil = mocked(FileZipUtil, true);
jest.mock("fs");
const mockedFs = mocked(fs, true);
jest.mock("path");
const mockedPath = mocked(path, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

let coursesProvider = new CoursesProvider();

const mockedUserTeacherModel: User = {
    id: 1,
    username: "johndoe",
    roles: [
        {
            roleName: "ROLE_STUDENT",
        },
        {
            roleName: "ROLE_TEACHER",
        },
    ],
    courses: [],
};
const teacherCourses: Course[] = [
    {
        id: 2,
        name: "Test course 1",
        exercises: [
            {
                id: 4,
                name: "Exercise 1",
                includesTeacherSolution: false,
                solutionIsPublic: false,
                allowEditionAfterSolutionDownloaded: false
            },
            {
                id: 40,
                name: "Exercise 2",
                includesTeacherSolution: false,
                solutionIsPublic: false,
                allowEditionAfterSolutionDownloaded: false
            },
        ],
        creator: mockedUserTeacherModel,
    },
    {
        id: 3,
        name: "Test course 2",
        exercises: [
            {
                id: 5,
                name: "Exercise 1",
                includesTeacherSolution: false,
                solutionIsPublic: false,
                allowEditionAfterSolutionDownloaded: false
            },
        ],
    },
];
mockedUserTeacherModel.courses = teacherCourses;
const mockedUserStudentModel: User = {
    id: 9999999,
    username: "johndoejr",
    roles: [{
        roleName: "ROLE_STUDENT",
    }],
    courses: teacherCourses,
};
let mockedUser = mockedUserTeacherModel;

function mockGetInput(prompt: string, validateInput: (value: string) => string | undefined | null | Thenable<string | undefined | null>, resolvedValue: any, defaultValue?: string, password?: boolean) {
    mockedVscode.window.showInputBox
        .mockResolvedValueOnce(resolvedValue);
    const expectedInputOptions = {
        prompt,
        validateInput,
        value: defaultValue,
        password,
    };
    return expectedInputOptions;
}

describe("Tree View", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        coursesProvider = new CoursesProvider();
        mockedUser = mockedUserTeacherModel;

        mockedPath.join.mockImplementation(mockedPathJoin);
    });

    it("should show log in buttons when not logged in and session could not be initialized", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => false);
        mockedClient.initializeSessionFromFile.mockImplementation(() => false);

        const elements = coursesProvider.getChildren();

        if (elements) {
            expect(elements).toStrictEqual([V4TBuildItems.LOGIN_ITEM, V4TBuildItems.SIGNUP_ITEM]);
        } else {
            fail("No elements returned");
        }
    });

    it("should update user info when session is initialized", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => false);
        mockedClient.initializeSessionFromFile.mockImplementation(() => true);
        mockedCurrentUser.updateUserInfo.mockResolvedValueOnce(mockedUser);

        const elements = coursesProvider.getChildren();

        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
        expect(elements).toStrictEqual([]); // Don't return anything while updating
    });

    it("should show courses, add courses, invite teacher and logout buttons when teacher is logged in", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => true);
        mockedCurrentUser.getUserInfo.mockImplementation(() => mockedUser);
        const coursesItemsTeacher = teacherCourses.map((course) => new V4TItem(course.name, V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
        coursesItemsTeacher.unshift(V4TBuildItems.ADD_COURSES_ITEM);
        coursesItemsTeacher.push(V4TBuildItems.SIGNUP_TEACHER_ITEM);
        coursesItemsTeacher.push(V4TBuildItems.LOGOUT_ITEM);

        const elements = coursesProvider.getChildren();

        expect(elements).toStrictEqual(coursesItemsTeacher);
    });

    it("should show courses when teacher is logged in", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => true);
        mockedUser = mockedUserStudentModel;
        mockedCurrentUser.getUserInfo.mockImplementation(() => mockedUser);
        const coursesItemsStudent = teacherCourses.map((course) => new V4TItem(course.name, V4TItemType.CourseStudent, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
        coursesItemsStudent.unshift(V4TBuildItems.GET_WITH_CODE_ITEM);
        coursesItemsStudent.push(V4TBuildItems.LOGOUT_ITEM);

        const elements = coursesProvider.getChildren();

        expect(elements).toStrictEqual(coursesItemsStudent);
    });

    it("should show exercises on course click (teacher)", async () => {
        const course: Course = {
            id: 1,
            name: "Test course",
            exercises: [], // Exercises will be fetched from the server during call
        };
        const exercises: Exercise[] = [{
            id: 2,
            name: "Test exercise 1",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }, {
            id: 3,
            name: "Test exercise 2",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }];
        const courseItem = new V4TItem("Test course", V4TItemType.CourseTeacher, mockedVscode.TreeItemCollapsibleState.Collapsed, undefined, course, undefined);

        const response: AxiosResponse<Exercise[]> = {
            data: exercises,
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        };
        mockedClient.getExercises.mockResolvedValueOnce(response);

        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        const user: User = {
            id: 4,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoe",
        };
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);
        const expectedExerciseItems = exercises.map((exercise) => new V4TItem(exercise.name, V4TItemType.ExerciseTeacher, vscode.TreeItemCollapsibleState.None, courseItem, exercise, {
            command: "vscode4teaching.getstudentfiles",
            title: "Get exercise files",
            arguments: [course.name, exercise],
        }, 0));

        const exerciseElements = await coursesProvider.getChildren(courseItem);

        expect(mockedClient.getExercises).toHaveBeenCalledTimes(1);
        expect(mockedClient.getExercises).toHaveBeenNthCalledWith(1, course.id);
        expect(exerciseElements).toStrictEqual(expectedExerciseItems);
    });

    it("should show exercises on course click (student)", async () => {
        const course: Course = {
            id: 1,
            name: "Test course",
            exercises: [], // Exercises will be fetched from the server during call
        };
        const exercises: Exercise[] = [{
            id: 2,
            name: "Test exercise 1",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }, {
            id: 3,
            name: "Test exercise 2",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }];
        const courseItem = new V4TItem("Test course", V4TItemType.CourseStudent, mockedVscode.TreeItemCollapsibleState.Collapsed, undefined, course, undefined);

        const response: AxiosResponse<Exercise[]> = {
            data: exercises,
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        };
        mockedClient.getExercises.mockResolvedValueOnce(response);

        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        const user: User = {
            id: 4,
            roles: [{
                roleName: "ROLE_STUDENT",
            }],
            username: "johndoe",
        };
        mockedCurrentUser.getUserInfo.mockReturnValue(user);
        const expectedExerciseItems = exercises.map((exercise) => new V4TItem(exercise.name, V4TItemType.ExerciseStudent, vscode.TreeItemCollapsibleState.None, courseItem, exercise, {
            command: "vscode4teaching.getexercisefiles",
            title: "Get exercise files",
            arguments: [course.name, exercise],
        }, ExerciseStatus.StatusEnum.NOT_STARTED));
        const expectedExerciseUserInfo = (exercise: Exercise): AxiosResponse<ExerciseUserInfo> => ({
            data: {
                id: 5,
                exercise,
                status: ExerciseStatus.StatusEnum.NOT_STARTED,
                user,
                updateDateTime: Date.now().toString()
            },
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        });
        mockedClient.getExerciseUserInfo
            .mockResolvedValueOnce(expectedExerciseUserInfo(exercises[0]))
            .mockResolvedValueOnce(expectedExerciseUserInfo(exercises[1]));

        const exerciseElements = await coursesProvider.getChildren(courseItem);

        expect(mockedClient.getExercises).toHaveBeenCalledTimes(1);
        expect(mockedClient.getExercises).toHaveBeenNthCalledWith(1, course.id);
        expect(exerciseElements).toStrictEqual(expectedExerciseItems);
    });

    it("should show login form correctly then call login", async () => {
        const mockUsername = "johndoe";
        const mockPassword = "password";

        const inputOptionsUsername = mockGetInput("Username", Validators.validateUsername, mockUsername);
        const inputOptionsPassword = mockGetInput("Password", Validators.validatePasswordLogin, mockPassword, undefined, true);

        mockedClient.loginV4T.mockResolvedValue();

        await coursesProvider.login();

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(2);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsUsername);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(2, inputOptionsPassword);
        expect(mockedClient.loginV4T).toHaveBeenLastCalledWith(mockUsername, mockPassword);
    });

    it("should logout correctly", () => {
        coursesProvider.logout();
        expect(mockedClient.invalidateSession).toHaveBeenCalledTimes(1);
    });

    it("should add course", async () => {
        const courseModel = {
            name: "Test course 1",
        };

        const inputOptionsCourse = mockGetInput("Course name", Validators.validateCourseName, courseModel.name);

        mockedClient.addCourse.mockResolvedValueOnce({
            data: {
                id: 1,
                name: courseModel.name,
                exercises: [],
            },
            status: 201,
            statusText: "",
            headers: {},
            config: {},
        });
        mockedCurrentUser.updateUserInfo.mockResolvedValueOnce(
            mockedUser,
        );

        await coursesProvider.addCourse();

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsCourse);
        expect(mockedClient.addCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.addCourse).toHaveBeenLastCalledWith(courseModel);
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should edit course", async () => {
        const courseModelToEdit = new V4TItem(
            teacherCourses[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0],
            undefined,
        );
        const newCourseModel = {
            name: "Test course 1 edited",
        };

        const inputOptionsCourse = mockGetInput("Course name", Validators.validateCourseName, newCourseModel.name);

        mockedClient.editCourse.mockResolvedValueOnce({
            data: {
                id: 2,
                name: newCourseModel.name,
                exercises: teacherCourses[0].exercises,
            },
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        });
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(
            mockedUser,
        );

        await coursesProvider.editCourse(courseModelToEdit);

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsCourse);
        expect(mockedClient.editCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.editCourse).toHaveBeenLastCalledWith(teacherCourses[0].id, newCourseModel);
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should delete course", async () => {
        const courseModelToDelete = new V4TItem(
            teacherCourses[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0],
            undefined,
        );
        mockedClient.deleteCourse.mockResolvedValueOnce({
            status: 200,
            statusText: "",
            headers: {},
            config: {},
            data: undefined,
        });
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(
            mockedUser,
        );

        await coursesProvider.deleteCourse(courseModelToDelete);

        expect(mockedClient.deleteCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.deleteCourse).toHaveBeenLastCalledWith(teacherCourses[0].id);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenLastCalledWith("Are you sure you want to delete " + teacherCourses[0].name + "?", { modal: true }, "Accept");
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should refresh courses", async () => {
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.updateUserInfo.mockResolvedValueOnce(mockedUser);

        coursesProvider.refreshCourses();

        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should add an exercise without solution", async () => {
        const courseModel = new V4TItem(
            teacherCourses[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0],
            undefined,
        );

        const openDialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select a directory"
        };
        const openDialogReturnedUri: vscode.Uri = {
            authority: "",
            fragment: "",
            fsPath: "test",
            path: "test",
            query: "",
            scheme: "file",
            with: jest.fn(),
            toJSON: jest.fn()
        };
        mockedVscode.window.showOpenDialog.mockResolvedValueOnce([openDialogReturnedUri]);

        // Into getTemplateSolutionPaths()
        mockedFs.lstatSync.mockImplementation(path => mockFsStatus(path === "test"));
        mockedFs.readdirSync.mockReturnValue([
            mockFsDirent("folder_test", true),
            mockFsDirent("file_test", false)
        ]);

        const addExerciseRequestBody: ExerciseEdit = {
            name: "test",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }

        const addExerciseResponseBody: Exercise = {
            id: 10,
            name: "test",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        };
        mockedClient.addExercises.mockResolvedValueOnce({
            status: 201,
            statusText: "",
            headers: {},
            config: {},
            data: [addExerciseResponseBody],
        });

        const mockBufferDoc = Buffer.from("test");
        mockedFileZipUtil.getZipFromUris.mockResolvedValueOnce(mockBufferDoc);

        const axiosResponseMock: AxiosResponse = {
            data: new Promise((res, _) => res(mockBufferDoc)),
            status: 200,
            statusText: "",
            config: {},
            headers: {}
        }
        mockedClient.uploadExerciseTemplate.mockResolvedValue(axiosResponseMock);

        await coursesProvider.addExercises(courseModel, false);

        expect(mockedVscode.window.showOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenNthCalledWith(1, openDialogOptions);
        expect(mockedFs.lstatSync).toHaveBeenCalledTimes(1);
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(1, openDialogReturnedUri.fsPath);
        expect(mockedFs.readdirSync).toHaveBeenCalledTimes(1);
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(1, openDialogReturnedUri.fsPath, { withFileTypes: true });
        expect(mockedClient.addExercises).toHaveBeenCalledTimes(1);
        expect(mockedClient.addExercises).toHaveBeenNthCalledWith(1, teacherCourses[0].id, [addExerciseRequestBody]);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenCalledTimes(1);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(1, addExerciseResponseBody.id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenCalledTimes(0);
    });

    it("should add some exercises without solution", async () => {
        const courseModel = new V4TItem(
            teacherCourses[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0],
            undefined,
        );

        mockedVscode.window.showInformationMessage.mockResolvedValueOnce({ title: "Accept" } as vscode.MessageItem);

        const openDialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select a directory"
        };
        const openDialogReturnedUri: vscode.Uri = {
            authority: "",
            fragment: "",
            fsPath: "parentDirectory",
            path: "parentDirectory",
            query: "",
            scheme: "file",
            with: jest.fn(),
            toJSON: jest.fn()
        };
        mockedVscode.window.showOpenDialog.mockResolvedValueOnce([openDialogReturnedUri]);

        const exampleExercisesNames = ["ej1", "ej2", "ej3", "ej4", "ej5"];

        mockedFs.lstatSync.mockImplementation(path => mockFsStatus(/ej[0-9]*/.test(path.toString())));
        const mockedParentDirectoryContents = exampleExercisesNames.map(ej => mockFsDirent(ej, true));
        mockedFs.readdirSync
            // First call: scanning contents of parent directory    
            .mockReturnValueOnce(mockedParentDirectoryContents)
            // Successive calls: in getTemplateSolutionPaths(), one per each exercise, can be returned same info on every case
            .mockReturnValue([
                mockFsDirent("test_file_1", true),
                mockFsDirent("test_file_2", true)
            ]);

        const addExerciseRequestBody: ExerciseEdit[] = exampleExercisesNames.map(ej => ({
            name: ej,
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }));

        const addExerciseResponseBody: Exercise[] = exampleExercisesNames.map((ej, index) => ({
            id: 10 + index,
            name: ej,
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }));

        mockedClient.addExercises.mockResolvedValueOnce({
            status: 201,
            statusText: "",
            headers: {},
            config: {},
            data: addExerciseResponseBody,
        });

        const mockBufferDoc = Buffer.from("test_content_of_zipfiles");
        mockedFileZipUtil.getZipFromUris.mockResolvedValue(mockBufferDoc);

        const axiosResponseMock: AxiosResponse = {
            data: new Promise((res, _) => res(mockBufferDoc)),
            status: 200,
            statusText: "",
            config: {},
            headers: {}
        }
        mockedClient.uploadExerciseTemplate.mockResolvedValue(axiosResponseMock);

        await coursesProvider.addExercises(courseModel, true);


        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(1, "To upload multiple exercises, prepare a directory with a folder for each exercise, each folder including the exercise's corresponding template and solution if wanted. When ready, click 'Accept'.", { title: "Accept" });
        expect(mockedVscode.window.showOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenNthCalledWith(1, openDialogOptions);
        expect(mockedFs.readdirSync).toHaveBeenCalledTimes(6);
        expect(mockedFs.lstatSync).toHaveBeenCalledTimes(5);
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(1, openDialogReturnedUri.fsPath, { withFileTypes: true });
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(1, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[0].name));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(2, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[0].name), { withFileTypes: true });
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(2, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[1].name));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(3, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[1].name), { withFileTypes: true });
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(3, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[2].name));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(4, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[2].name), { withFileTypes: true });
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(4, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[3].name));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(5, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[3].name), { withFileTypes: true });
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(5, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[4].name));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(6, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[4].name), { withFileTypes: true });
        expect(mockedClient.addExercises).toHaveBeenCalledTimes(1);
        expect(mockedClient.addExercises).toHaveBeenNthCalledWith(1, teacherCourses[0].id, addExerciseRequestBody);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenCalledTimes(5);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(1, addExerciseResponseBody[0].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(2, addExerciseResponseBody[1].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(3, addExerciseResponseBody[2].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(4, addExerciseResponseBody[3].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(5, addExerciseResponseBody[4].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenCalledTimes(0);
    });

    it("should add an exercise with solution", async () => {
        const courseModel = new V4TItem(
            teacherCourses[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0],
            undefined,
        );

        const openDialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select a directory"
        };
        const openDialogReturnedUri: vscode.Uri = {
            authority: "",
            fragment: "",
            fsPath: "test",
            path: "test",
            query: "",
            scheme: "file",
            with: jest.fn(),
            toJSON: jest.fn()
        };
        mockedVscode.window.showOpenDialog.mockResolvedValueOnce([openDialogReturnedUri]);

        // Into getTemplateSolutionPaths()
        mockedFs.lstatSync.mockImplementation(path => mockFsStatus(path === "test"));
        mockedFs.readdirSync
            // First call: scanning contents of parent directory    
            .mockReturnValueOnce([
                mockFsDirent("template", true),
                mockFsDirent("solution", true)
            ])
            // Successive calls: in getTemplateSolutionPaths(), one per each directory, can be returned same info on every case        
            .mockReturnValue([
                mockFsDirent("test_file_1", false),
                mockFsDirent("test_file_2", false),
                mockFsDirent("test_file_3", false)
            ]);

        const addExerciseRequestBody: ExerciseEdit = {
            name: "test",
            includesTeacherSolution: true,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }

        const addExerciseResponseBody: Exercise = {
            id: 10,
            name: "test",
            includesTeacherSolution: true,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        };
        mockedClient.addExercises.mockResolvedValueOnce({
            status: 201,
            statusText: "",
            headers: {},
            config: {},
            data: [addExerciseResponseBody],
        });

        const mockBufferDoc = Buffer.from("test");
        mockedFileZipUtil.getZipFromUris.mockResolvedValue(mockBufferDoc);

        const axiosResponseMock: AxiosResponse = {
            data: new Promise((res, _) => res(mockBufferDoc)),
            status: 200,
            statusText: "",
            config: {},
            headers: {}
        }
        mockedClient.uploadExerciseTemplate.mockResolvedValue(axiosResponseMock);
        mockedClient.uploadExerciseSolution.mockResolvedValue(axiosResponseMock);

        await coursesProvider.addExercises(courseModel, false);

        expect(mockedVscode.window.showOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenNthCalledWith(1, openDialogOptions);
        expect(mockedFs.lstatSync).toHaveBeenCalledTimes(1);
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(1, openDialogReturnedUri.fsPath);
        expect(mockedFs.readdirSync).toHaveBeenCalledTimes(3);
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(1, openDialogReturnedUri.fsPath, { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(2, mockedPath.join(openDialogReturnedUri.fsPath, "template"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(3, mockedPath.join(openDialogReturnedUri.fsPath, "solution"));
        expect(mockedClient.addExercises).toHaveBeenCalledTimes(1);
        expect(mockedClient.addExercises).toHaveBeenNthCalledWith(1, teacherCourses[0].id, [addExerciseRequestBody]);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenCalledTimes(1);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(1, addExerciseResponseBody.id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenCalledTimes(1);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenNthCalledWith(1, addExerciseResponseBody.id, mockBufferDoc, false);
    });

    it("should add some exercises without solution", async () => {
        const courseModel = new V4TItem(
            teacherCourses[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0],
            undefined,
        );

        mockedVscode.window.showInformationMessage.mockResolvedValueOnce({ title: "Accept" } as vscode.MessageItem);

        const openDialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select a directory"
        };
        const openDialogReturnedUri: vscode.Uri = {
            authority: "",
            fragment: "",
            fsPath: "parentDirectory",
            path: "parentDirectory",
            query: "",
            scheme: "file",
            with: jest.fn(),
            toJSON: jest.fn()
        };
        mockedVscode.window.showOpenDialog.mockResolvedValueOnce([openDialogReturnedUri]);

        const exampleExercisesNames = ["ej1", "ej2", "ej3", "ej4", "ej5"];

        /**
         * fs library mock
         * 
         * A file structure is simulated for each exercise like this one:
         * ejN/
         * ├─ template/
         * │  ├─ file_test_1
         * │  ├─ file_test_2
         * ├─ solution/
         * │  ├─ file_test_1
         * │  ├─ file_test_2
         */
        mockedFs.lstatSync.mockImplementation(path => mockFsStatus(/ej[0-9]*/.test(path.toString()) || path === "template" || path === "solution"));
        const mockedParentDirectoryContents = exampleExercisesNames.map(ej => mockFsDirent(ej, true));
        mockedFs.readdirSync.mockImplementation((path, options) => {
            if (path.toString() === "parentDirectory")
                return exampleExercisesNames.map(ej => mockFsDirent(ej, true))
            else if (/ej[0-9]*/.test(path.toString()))
                return [
                    mockFsDirent("template", true),
                    mockFsDirent("solution", true)
                ]
            else if (["template", "solution"].some(name => name === path))
                return [
                    mockFsDirent("file_test_1", false),
                    mockFsDirent("file_test_2", false)
                ]
            else return [];
        })

        const addExerciseRequestBody: ExerciseEdit[] = exampleExercisesNames.map(ej => ({
            name: ej,
            includesTeacherSolution: true,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }));

        const addExerciseResponseBody: Exercise[] = exampleExercisesNames.map((ej, index) => ({
            id: 10 + index,
            name: ej,
            includesTeacherSolution: true,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        }));

        mockedClient.addExercises.mockResolvedValueOnce({
            status: 201,
            statusText: "",
            headers: {},
            config: {},
            data: addExerciseResponseBody,
        });

        const mockBufferDoc = Buffer.from("test_content_of_zipfiles");
        mockedFileZipUtil.getZipFromUris.mockResolvedValue(mockBufferDoc);

        const axiosResponseMock: AxiosResponse = {
            data: new Promise((res, _) => res(mockBufferDoc)),
            status: 200,
            statusText: "",
            config: {},
            headers: {}
        }
        mockedClient.uploadExerciseTemplate.mockResolvedValue(axiosResponseMock);
        mockedClient.uploadExerciseSolution.mockResolvedValue(axiosResponseMock);

        await coursesProvider.addExercises(courseModel, true);


        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(1, "To upload multiple exercises, prepare a directory with a folder for each exercise, each folder including the exercise's corresponding template and solution if wanted. When ready, click 'Accept'.", { title: "Accept" });
        expect(mockedVscode.window.showOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenNthCalledWith(1, openDialogOptions);
        expect(mockedFs.lstatSync).toHaveBeenCalledTimes(5);
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(1, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[0].name));
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(2, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[1].name));
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(3, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[2].name));
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(4, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[3].name));
        expect(mockedFs.lstatSync).toHaveBeenNthCalledWith(5, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[4].name));
        expect(mockedFs.readdirSync).toHaveBeenCalledTimes(16);
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(1, openDialogReturnedUri.fsPath, { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(2, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[0].name), { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(3, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[0].name, "template"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(4, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[0].name, "solution"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(5, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[1].name), { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(6, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[1].name, "template"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(7, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[1].name, "solution"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(8, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[2].name), { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(9, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[2].name, "template"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(10, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[2].name, "solution"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(11, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[3].name), { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(12, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[3].name, "template"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(13, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[3].name, "solution"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(14, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[4].name), { withFileTypes: true });
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(15, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[4].name, "template"));
        expect(mockedFs.readdirSync).toHaveBeenNthCalledWith(16, mockedPath.join(openDialogReturnedUri.fsPath, mockedParentDirectoryContents[4].name, "solution"));
        expect(mockedClient.addExercises).toHaveBeenCalledTimes(1);
        expect(mockedClient.addExercises).toHaveBeenNthCalledWith(1, teacherCourses[0].id, addExerciseRequestBody);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenCalledTimes(5);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(1, addExerciseResponseBody[0].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(2, addExerciseResponseBody[1].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(3, addExerciseResponseBody[2].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(4, addExerciseResponseBody[3].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(5, addExerciseResponseBody[4].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenCalledTimes(5);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenNthCalledWith(1, addExerciseResponseBody[0].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenNthCalledWith(2, addExerciseResponseBody[1].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenNthCalledWith(3, addExerciseResponseBody[2].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenNthCalledWith(4, addExerciseResponseBody[3].id, mockBufferDoc, false);
        expect(mockedClient.uploadExerciseSolution).toHaveBeenNthCalledWith(5, addExerciseResponseBody[4].id, mockBufferDoc, false);
    });

    it("should edit exercise", async () => {
        const exerciseModelToEdit = new V4TItem(
            teacherCourses[0].exercises[0].name,
            V4TItemType.ExerciseTeacher,
            mockedVscode.TreeItemCollapsibleState.None,
            undefined,
            teacherCourses[0].exercises[0],
            undefined,
        );
        const newExerciseModel = {
            name: "Test course 1 edited",
            includesTeacherSolution: false,
            solutionIsPublic: false,
            allowEditionAfterSolutionDownloaded: false
        };

        const inputOptionsCourse = mockGetInput("Exercise name", Validators.validateExerciseName, newExerciseModel.name);

        mockedClient.editExercise.mockResolvedValueOnce({
            data: {
                id: teacherCourses[0].exercises[0].id,
                name: newExerciseModel.name,
                includesTeacherSolution: false,
                solutionIsPublic: false,
                allowEditionAfterSolutionDownloaded: false
            },
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        });

        await coursesProvider.editExercise(exerciseModelToEdit);

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsCourse);
        expect(mockedClient.editExercise).toHaveBeenCalledTimes(1);
        expect(mockedClient.editExercise).toHaveBeenLastCalledWith(teacherCourses[0].exercises[0].id, newExerciseModel);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(1, "Exercise edited successfully");
    });

    it("should delete exercise", async () => {
        const exerciseModelToDelete = new V4TItem(
            teacherCourses[0].exercises[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0].exercises[0],
            undefined,
        );
        mockedClient.deleteExercise.mockResolvedValueOnce({
            status: 200,
            statusText: "",
            headers: {},
            config: {},
            data: undefined,
        });

        await coursesProvider.deleteExercise(exerciseModelToDelete);

        expect(mockedClient.deleteExercise).toHaveBeenCalledTimes(1);
        expect(mockedClient.deleteExercise).toHaveBeenLastCalledWith(teacherCourses[0].exercises[0].id);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenLastCalledWith("Are you sure you want to delete " + teacherCourses[0].exercises[0].name + "?", { modal: true }, "Accept");
        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInformationMessage).toHaveBeenNthCalledWith(1, "Exercise deleted successfully");
    });

    it("should fill up sign up student form correctly", async () => {
        const userData = {
            username: "johndoe",
            email: "johndoe@gmail.com",
            name: "John",
            lastName: "Doe"
        };

        const inputOptionsFirstName = mockGetInput("First name", Validators.validateName, userData.name);
        const inputOptionsLastName = mockGetInput("Last name", Validators.validateLastName, userData.lastName);
        const inputOptionsUsername = mockGetInput("Username", Validators.validateUsername, userData.username);
        const inputOptionsEmail = mockGetInput("E-mail", Validators.validateEmail, userData.email);

        mockedClient.signUpTeacher.mockResolvedValueOnce();

        await coursesProvider.inviteTeacher();

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(4);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsFirstName);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(2, inputOptionsLastName);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(3, inputOptionsUsername);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(4, inputOptionsEmail);
        expect(mockedClient.signUpTeacher).toHaveBeenCalledTimes(1);
        expect(mockedClient.signUpTeacher).toHaveBeenNthCalledWith(1, userData);
    });

    it("should fill up invite teacher form correctly", async () => {
        const userData = {
            username: "johndoe",
            password: "password",
            email: "johndoe@gmail.com",
            name: "John",
            lastName: "Doe",
        };

        const inputOptionsUsername = mockGetInput("Username", Validators.validateUsername, userData.username);
        const inputOptionsPassword = mockGetInput("Password", Validators.validatePasswordSignup, userData.password, undefined, true);
        const inputOptionsPasswordConfirm = mockGetInput("Confirm password", Validators.validateEqualPassword, userData.password, undefined, true);
        const inputOptionsEmail = mockGetInput("Email", Validators.validateEmail, userData.email);
        const inputOptionsName = mockGetInput("Name", Validators.validateName, userData.name);
        const inputOptionsLastName = mockGetInput("Last name", Validators.validateLastName, userData.lastName);

        mockedClient.signUpStudent.mockResolvedValueOnce();

        await coursesProvider.signup();

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(6);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsUsername);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(2, inputOptionsPassword);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(3, inputOptionsPasswordConfirm);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(4, inputOptionsEmail);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(5, inputOptionsName);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(6, inputOptionsLastName);
        expect(mockedClient.signUpStudent).toHaveBeenCalledTimes(1);
        expect(mockedClient.signUpStudent).toHaveBeenNthCalledWith(1, userData);
    });

    it("should get course from code", async () => {
        const code = "test";
        const inputOptions = mockGetInput("Introduce sharing code", Validators.validateSharingCode, code);
        const course: Course = {
            id: 1,
            name: "Test course",
            exercises: [],
        };
        const response = {
            data: course,
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        };
        mockedClient.getCourseWithCode.mockResolvedValueOnce(response);

        mockedCurrentUser.addNewCourse.mockReturnValueOnce();

        await coursesProvider.getCourseWithCode();

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptions);
        expect(mockedClient.getCourseWithCode).toHaveBeenCalledTimes(1);
        expect(mockedClient.getCourseWithCode).toHaveBeenNthCalledWith(1, code);
        expect(mockedCurrentUser.addNewCourse).toHaveBeenCalledTimes(1);
        expect(mockedCurrentUser.addNewCourse).toHaveBeenNthCalledWith(1, course);
    });

    it("should add users to course", async () => {
        const course: Course = teacherCourses[0];
        const item = new V4TItem(course.name, V4TItemType.CourseTeacher, mockedVscode.TreeItemCollapsibleState.Collapsed, undefined, course, undefined);
        const responseUsers: AxiosResponse<User[]> = {
            data: [
                mockedUserTeacherModel,
                mockedUserStudentModel, {
                    id: 101010,
                    roles: [{
                        roleName: "ROLE_STUDENT",
                    }, {
                        roleName: "ROLE_TEACHER",
                    }],
                    username: "teacher2",
                },
                {
                    id: 202020,
                    roles: [{
                        roleName: "ROLE_STUDENT",
                    }],
                    username: "johndoejr2",
                    name: "John",
                    lastName: "Doe Jr 2",
                },
            ],
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        };
        const responseUsersCourse: AxiosResponse<User[]> = {
            data: [mockedUserTeacherModel, mockedUserStudentModel],
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        };
        mockedClient.getAllUsers.mockResolvedValueOnce(responseUsers);
        mockedClient.getUsersInCourse.mockResolvedValueOnce(responseUsersCourse);

        await coursesProvider.addUsersToCourse(item);

        expect(mockedClient.getAllUsers).toHaveBeenCalledTimes(1);
        expect(mockedClient.getUsersInCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.getUsersInCourse).toHaveBeenNthCalledWith(1, course.id);
        expect(mockedVscode.window.showQuickPick).toHaveBeenCalledTimes(1);
        if (mockedVscode.window.showQuickPick.mock.calls[0][0] instanceof Array) {
            expect(mockedVscode.window.showQuickPick.mock.calls[0][0][0].label).toBe("teacher2 (Teacher)");
            expect((mockedVscode.window.showQuickPick.mock.calls[0][0][0] as UserPick).user).toBe(responseUsers.data[2]);
            expect(mockedVscode.window.showQuickPick.mock.calls[0][0][1].label).toBe("John Doe Jr 2");
            expect((mockedVscode.window.showQuickPick.mock.calls[0][0][1] as UserPick).user).toBe(responseUsers.data[3]);
        } else {
            fail("incorrect argument type for showQuickPick");
        }
        expect(mockedVscode.window.showQuickPick.mock.calls[0][1]).toStrictEqual({ canPickMany: true });
        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(0);
        expect(mockedClient.addUsersToCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.addUsersToCourse).toHaveBeenNthCalledWith(1, course.id, { ids: [responseUsers.data[2].id, responseUsers.data[3].id] });
    });

    it("should remove users from course", async () => {
        const course: Course = teacherCourses[0];
        const item = new V4TItem(course.name, V4TItemType.CourseTeacher, mockedVscode.TreeItemCollapsibleState.Collapsed, undefined, course, undefined);
        const responseUsersCourse: AxiosResponse<User[]> = {
            data: [mockedUserTeacherModel, mockedUserStudentModel, {
                id: 101010,
                roles: [{
                    roleName: "ROLE_STUDENT",
                }, {
                    roleName: "ROLE_TEACHER",
                }],
                username: "teacher2",
            },
                {
                    id: 202020,
                    roles: [{
                        roleName: "ROLE_STUDENT",
                    }],
                    username: "johndoejr2",
                    name: "John",
                    lastName: "Doe Jr 2",
                }],
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        };
        mockedClient.getUsersInCourse.mockResolvedValueOnce(responseUsersCourse);
        const responseCreator: AxiosResponse<User> = {
            data: mockedUserTeacherModel,
            status: 200,
            statusText: "2",
            headers: {},
            config: {},
        };
        mockedClient.getCreator.mockResolvedValueOnce(responseCreator);

        await coursesProvider.removeUsersFromCourse(item);

        expect(mockedClient.getUsersInCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.getUsersInCourse).toHaveBeenNthCalledWith(1, course.id);
        expect(mockedClient.getCreator).toHaveBeenCalledTimes(1);
        expect(mockedClient.getCreator).toHaveBeenNthCalledWith(1, course.id);
        expect(mockedVscode.window.showQuickPick).toHaveBeenCalledTimes(1);
        if (mockedVscode.window.showQuickPick.mock.calls[0][0] instanceof Array) {
            expect(mockedVscode.window.showQuickPick.mock.calls[0][0][0].label).toBe("johndoejr");
            expect((mockedVscode.window.showQuickPick.mock.calls[0][0][0] as UserPick).user).toBe(responseUsersCourse.data[1]);
            expect(mockedVscode.window.showQuickPick.mock.calls[0][0][1].label).toBe("teacher2 (Teacher)");
            expect((mockedVscode.window.showQuickPick.mock.calls[0][0][1] as UserPick).user).toBe(responseUsersCourse.data[2]);
            expect(mockedVscode.window.showQuickPick.mock.calls[0][0][2].label).toBe("John Doe Jr 2");
            expect((mockedVscode.window.showQuickPick.mock.calls[0][0][2] as UserPick).user).toBe(responseUsersCourse.data[3]);
        } else {
            fail("incorrect argument type for showQuickPick");
        }
        expect(mockedVscode.window.showQuickPick.mock.calls[0][1]).toStrictEqual({ canPickMany: true });
        expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledTimes(0);
        expect(mockedClient.removeUsersFromCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.removeUsersFromCourse).toHaveBeenNthCalledWith(
            1,
            course.id,
            {
                ids: [responseUsersCourse.data[1].id, responseUsersCourse.data[2].id, responseUsersCourse.data[3].id],
            });
    });
});
