import { ServerCommentThread } from "./CommentServerModel";

export interface User {
    id: number;
    username: string;
    roles: Role[];
    email?: string;
    name?: string;
    lastName?: string;
    courses?: Course[];
}

export interface UserSignup {
    username: string;
    password: string;
    email: string;
    name: string;
    lastName: string;
}

export interface Role {
    roleName: "ROLE_STUDENT" | "ROLE_TEACHER";
}

export interface Course {
    id: number;
    name: string;
    creator?: User;
    exercises: Exercise[];
}

export function instanceOfCourse(object: any): object is Course {
    return "id" in object && "name" in object && "exercises" in object;
}

export interface CourseEdit {
    name: string;
}

export interface ManageCourseUsers {
    ids: number[];
}

export interface Exercise {
    id: number;
    name: string;
}

export interface ExerciseEdit {
    name: string;
}

export interface FileInfo {
    id: number;
    path: string;
    comments?: ServerCommentThread[];
}

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
