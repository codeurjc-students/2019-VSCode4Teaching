import { Course } from "../course/Course";
import { Role } from "./Role";

export interface User {
    id: number;
    username: string;
    roles: Role[];
    email?: string;
    name?: string;
    lastName?: string;
    courses?: Course[];
}
