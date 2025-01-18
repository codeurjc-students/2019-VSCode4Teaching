import { CourseDTO } from "./course.dto";

export interface UserDTO {
    id?: number;
    name: string;
    lastName: string;
    email?: string;
    username: string;
    password?: string;
    roles?: { roleName: string }[];
    courses?: CourseDTO[];
}
