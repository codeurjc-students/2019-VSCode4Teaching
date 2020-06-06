import { AxiosResponse } from "axios";
import { mocked } from "ts-jest/utils";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { Course } from "../../src/model/serverModel/course/Course";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { User } from "../../src/model/serverModel/user/User";

jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);

describe("Current user", () => {
    afterEach(() => {
        CurrentUser.resetUserInfo();
    });
    it("should update user info", async () => {
        const user: User = {
            id: 40,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoe",
            courses: [
                {
                    id: 1,
                    name: "Test course 1",
                    exercises: [],
                },
            ],
        };
        const response: AxiosResponse<User> = {
            data: user,
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.getServerUserInfo.mockResolvedValueOnce(response);
        const updatedUser = await CurrentUser.updateUserInfo();
        expect(CurrentUser.isLoggedIn()).toBe(true);
        expect(CurrentUser.getUserInfo()).toBe(user);
        expect(updatedUser).toBe(user);
    });
    it("should reset info", async () => {
        const user: User = {
            id: 40,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoe",
            courses: [
                {
                    id: 1,
                    name: "Test course 1",
                    exercises: [],
                },
            ],
        };
        const response: AxiosResponse<User> = {
            data: user,
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.getServerUserInfo.mockResolvedValueOnce(response);
        await CurrentUser.updateUserInfo();

        CurrentUser.resetUserInfo();
        expect(CurrentUser.isLoggedIn()).toBe(false);
        try {
            CurrentUser.getUserInfo();
            fail("Get user info should throw error");
        } catch (error) {
            expect(error.message).toBe("No user logged in");
        }
    });

    it("should add new course", async () => {
        const exercises: Exercise[] = [{
            id: 21,
            name: "Test exercise 1",
        }, {
            id: 22,
            name: "Test exercise 2",
        }];
        const newCourse: Course = {
            id: 20,
            name: "Test course 2",
            exercises,
        };
        const user: User = {
            id: 40,
            roles: [{
                roleName: "ROLE_STUDENT",
            }, {
                roleName: "ROLE_TEACHER",
            }],
            username: "johndoe",
            courses: [
                {
                    id: 1,
                    name: "Test course 1",
                    exercises: [],
                },
            ],
        };
        const response: AxiosResponse<User> = {
            data: user,
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.getServerUserInfo.mockResolvedValueOnce(response);

        await CurrentUser.updateUserInfo();

        CurrentUser.addNewCourse(newCourse);
        expect(CurrentUser.getUserInfo().courses).toContain(newCourse);
    });
});
