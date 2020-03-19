import { User, Course } from "../model/serverModel/ServerModel";
import { APIClient } from "./APIClient";

export namespace CurrentUser {
    let _userinfo: User | undefined;

    export async function updateUserInfo () {
        // Errors have to be controlled in the caller function
        let userResponse = await APIClient.getServerUserInfo();
        if (userResponse.data.courses && userResponse.data.courses.length > 0) {
            userResponse.data.courses.forEach((course: Course) => {
                if (!course.exercises) {
                    course.exercises = [];
                }
            });
        }
        _userinfo = userResponse.data;
    }

    /**
     * Checks if user is logged in (User info exists)
     */
    export function isLoggedIn (): boolean {
        return _userinfo !== undefined;
    }

    export function resetUserInfo () {
        _userinfo = undefined;
    }

    export function getUserInfo (): User {
        if (_userinfo !== undefined) {
            return _userinfo;
        } else {
            throw new Error('No user logged in');
        }
    }

}