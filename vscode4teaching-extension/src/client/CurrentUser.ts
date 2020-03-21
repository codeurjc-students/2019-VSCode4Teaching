
import { Course } from "../model/serverModel/course/Course";
import { User } from "../model/serverModel/user/User";
import { APIClient } from "./APIClient";

/**
 * Holds information about the current logged user on the extension.
 * There can only be 1 logged in user at a time.
 */
export class CurrentUser {

    /**
     * Update current user info stored from server.
     * Also used for getting current available courses
     */
    public static async updateUserInfo() {
        // Errors have to be controlled in the caller function
        const userResponse = await CurrentUser.client.getServerUserInfo();
        if (userResponse.data.courses && userResponse.data.courses.length > 0) {
            userResponse.data.courses.forEach((course) => {
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

    /**
     * Logs out current user.
     */
    public static resetUserInfo() {
        this.userinfo = undefined;
    }

    /**
     * Gets current user.
     * Throws error if there is no user
     */
    public static getUserInfo(): User {
        if (this.userinfo !== undefined) {
            return this.userinfo;
        } else {
            throw new Error("No user logged in");
        }
    }

    public static addNewCourse(course: Course) {
        if (this.userinfo && !this.userinfo.courses) {
            this.userinfo.courses = [course];
        } else if (this.userinfo && this.userinfo.courses) {
            let found = false;
            for (const courseInCourses of this.userinfo.courses) {
                if (course.id === courseInCourses.id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.userinfo.courses.push(course);
            }
        } else {
            throw new Error("No user logged in");
        }
    }

    private static userinfo: User | undefined;
    private static client = APIClient.getClient();
}
