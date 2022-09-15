import * as path from "path";
import { mocked } from "ts-jest/utils";
import { CurrentUser } from "../../src/client/CurrentUser";
import { Course } from "../../src/model/serverModel/course/Course";
import { User } from "../../src/model/serverModel/user/User";

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("path");
const mockedPath = mocked(path, true);
mockedPath.resolve.mockImplementation((...args) => "v4t"); // set INTERNAL_FILES_DIR to mock value

import { FileZipUtil } from "../../src/utils/FileZipUtil";

describe("FileZipUtil", () => {
    afterEach(() => {
        mockedPath.resolve.mockClear();
    });

    it("should get exercise zip info", async () => {
        const course: Course = {
            exercises: [{
                id: 2,
                name: "exercise",
                includesTeacherSolution: false,
                solutionIsPublic: false
            }],
            id: 1,
            name: "course",
        };

        const user: User = {
            id: 3,
            roles: [{
                roleName: "ROLE_STUDENT",
            }],
            username: "johndoejr",
            courses: [course],
        };

        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(user);

        mockedPath.resolve.mockImplementation((...args) => {
            let finalRoute = "";
            for (const arg of args) {
                finalRoute = finalRoute.concat("/").concat(arg);
            }
            return finalRoute;
        });

        const zipInfo = FileZipUtil.studentExerciseZipInfo(course.name, course.exercises[0]);

        expect(zipInfo.dir).toBe("/v4tdownloads/johndoejr/course/exercise");
        expect(zipInfo.zipDir).toBe("/v4t/johndoejr");
        expect(zipInfo.zipName).toBe("2.zip");
    });
});
