import { AxiosResponse } from "axios";
import { mocked } from "ts-jest/utils";
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

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("../../src/utils/FileZipUtil");
const mockedFileZipUtil = mocked(FileZipUtil, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

let coursesProvider = new CoursesProvider();

const mockedUserTeacherModel: User = {
    id: 1,
    username: "johndoe",
    roles: [{
        roleName: "ROLE_STUDENT",
    }, {
        roleName: "ROLE_TEACHER",
    }],
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
            },
            {
                id: 40,
                name: "Exercise 2",
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

    afterEach(() => {
        mockedCurrentUser.isLoggedIn.mockClear();
        mockedCurrentUser.updateUserInfo.mockClear();
        mockedCurrentUser.getUserInfo.mockClear();
        mockedVscode.EventEmitter.mockClear();
        mockedVscode.window.showInputBox.mockClear();
        mockedClient.initializeSessionFromFile.mockClear();
        mockedClient.getUsersInCourse.mockClear();
        mockedVscode.window.showQuickPick.mockClear();
        mockedVscode.window.showWarningMessage.mockClear();
        mockedVscode.window.showInformationMessage.mockClear();
        coursesProvider = new CoursesProvider();
        mockedUser = mockedUserTeacherModel;
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

    it("should show courses, add courses, sign up teacher and logout buttons when teacher is logged in", () => {
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

    it("should show exercises on course click (Teacher)", async () => {
        const course: Course = {
            id: 1,
            name: "Test course",
            exercises: [], // Exercises will be fetched from the server during call
        };
        const exercises: Exercise[] = [{
            id: 2,
            name: "Test exercise 1",
        }, {
            id: 3,
            name: "Test exercise 2",
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
        }));

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

    it("should add exercise", async () => {
        const courseModel = new V4TItem(
            teacherCourses[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            teacherCourses[0],
            undefined,
        );
        const exerciseModel = {
            name: "New exercise",
        };

        const inputOptionsExercise = mockGetInput("Exercise name", Validators.validateExerciseName, exerciseModel.name);

        const openDialogOptions = {
            canSelectFiles: true,
            canSelectFolders: true,
            canSelectMany: true,
        };
        const fileUrisMocks = [
            mockedVscode.Uri.file("testFile1"),
            mockedVscode.Uri.file("testFile2"),
            mockedVscode.Uri.file("testFile3"),
        ];
        mockedVscode.window.showOpenDialog.mockResolvedValueOnce(fileUrisMocks);

        mockedClient.addExercise.mockResolvedValueOnce({
            status: 201,
            statusText: "",
            headers: {},
            config: {},
            data: {
                id: 10,
                name: exerciseModel.name,
            },
        });

        const mockBuffer = Buffer.from("test");
        mockedFileZipUtil.getZipFromUris.mockResolvedValueOnce(mockBuffer);

        mockedClient.uploadExerciseTemplate.mockResolvedValueOnce({
            status: 200,
            statusText: "",
            headers: {},
            config: {},
            data: {
            },
        });

        await coursesProvider.addExercise(courseModel);

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsExercise);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenNthCalledWith(1, openDialogOptions);
        expect(mockedClient.addExercise).toHaveBeenCalledTimes(1);
        expect(mockedClient.addExercise).toHaveBeenNthCalledWith(1, teacherCourses[0].id, { name: exerciseModel.name });
        expect(mockedFileZipUtil.getZipFromUris).toHaveBeenCalledTimes(1);
        expect(mockedFileZipUtil.getZipFromUris).toHaveBeenNthCalledWith(1, fileUrisMocks);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenCalledTimes(1);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(1, 10, mockBuffer);
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
        };

        const inputOptionsCourse = mockGetInput("Exercise name", Validators.validateExerciseName, newExerciseModel.name);

        mockedClient.editExercise.mockResolvedValueOnce({
            data: {
                id: teacherCourses[0].exercises[0].id,
                name: newExerciseModel.name,
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

    it("should sign up student correctly", async () => {
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
