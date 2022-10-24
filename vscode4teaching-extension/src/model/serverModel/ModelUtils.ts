import { User } from "./user/User";

export class ModelUtils {
    public static isStudent(user: User) {
        if (user) {
            return user.roles.filter((role) => role.roleName === "ROLE_STUDENT").length > 0 && user.roles.length === 1;
        } else {
            return false;
        }
    }

    public static isTeacher(user: User) {
        if (user) {
            return user.roles.filter((role) => role.roleName === "ROLE_TEACHER").length > 0;
        } else {
            return false;
        }
    }
}
