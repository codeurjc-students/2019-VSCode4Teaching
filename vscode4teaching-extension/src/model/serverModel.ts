export interface User {
    id: number;
    username: string;
    roles: Role[];
    email?: string;
    name?: string;
    lastName?: string;
    courses?: Course[];
}

export interface Course {
    id: number;
    name: string;
    creator: User;
    exercises: Exercise[];
}

export interface Exercise {
    id: number;
    name: string;
}

export interface Role {
    roleName: "ROLE_STUDENT" | "ROLE_TEACHER";
}

export interface FileInfo {
    id: number;
    path: string;
}