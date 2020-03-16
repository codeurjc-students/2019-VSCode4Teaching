import { User, Course } from "./serverModel/ServerModel";
import { APIClient } from "../client/APIClient";

export class CurrentUser {
    static userinfo: User | undefined;

    static newUserInfo () {
        CurrentUser.userinfo = {
            id: -1,
            username: "",
            roles: [{ roleName: "ROLE_STUDENT" }]
        };
        return CurrentUser.userinfo;
    }

    static async updateUserInfo () {
        let coursesThenable = APIClient.getServerUserInfo();
        // Errors have to be controlled in the caller function
        let userResponse = await coursesThenable;
        if (userResponse.data.courses && userResponse.data.courses.length > 0) {
            userResponse.data.courses.forEach((course: Course) => {
                if (!course.exercises) {
                    course.exercises = [];
                }
            });
        }
        CurrentUser.userinfo = userResponse.data;
    }
}