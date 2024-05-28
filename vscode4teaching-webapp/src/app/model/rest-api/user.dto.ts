import { CourseDTO } from "./course.dto";

export interface UserDTO {
    id: number;
    username: string;
    name: string;
    lastName: string;
    email?: string;
    roles?: { roleName: string }[];
    courses?: CourseDTO[];
}
