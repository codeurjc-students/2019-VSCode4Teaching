import { Course, User } from "../model/serverModel/ServerModel";
import { APIClient } from "./APIClient";

export class CurrentUser {

    public static async updateUserInfo() {
        // Errors have to be controlled in the caller function
        const userResponse = await CurrentUser.client.getServerUserInfo();
        if (userResponse.data.courses && userResponse.data.courses.length > 0) {
            userResponse.data.courses.forEach((course: Course) => {
                if (!course.exercises) {
                    course.exercises = [];
                }
            });
        }
        this.userinfo = userResponse.data;
    }

    /**
     * Checks if user is logged in (User info exists)
     */
    public static isLoggedIn(): boolean {
        return this.userinfo !== undefined;
    }

    public static resetUserInfo() {
        this.userinfo = undefined;
    }

    public static getUserInfo(): User {
        if (this.userinfo !== undefined) {
            return this.userinfo;
        } else {
            throw new Error("No user logged in");
        }
    }
    private static userinfo: User | undefined;
    private static client = APIClient.getClient();
}
