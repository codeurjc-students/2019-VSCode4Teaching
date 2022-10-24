import { Exercise } from "../exercise/Exercise";
import { User } from "../user/User";

export interface Course {
    id: number;
    name: string;
    creator?: User;
    exercises: Exercise[];
}

export function instanceOfCourse(object: any): object is Course {
    return "id" in object && "name" in object && "exercises" in object;
}
