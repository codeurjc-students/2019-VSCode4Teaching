import { ServerCommentThread } from "./commentServerModel";

export interface User {
    id: number;
    username: string;
    roles: Role[];
    email?: string;
    name?: string;
    lastName?: string;
    courses?: Course[];
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

export function instanceOfCourse (object: any): object is Course {
    return 'id' in object && 'name' in object && 'exercises' in object;
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
    static isTeacher (user: User) {
        return user.roles.filter(role => role.roleName === "ROLE_TEACHER").length > 0;
    }
}