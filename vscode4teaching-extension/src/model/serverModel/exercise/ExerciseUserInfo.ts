import { User } from "../user/User";
import { Exercise } from "./Exercise";

export interface ExerciseUserInfo {
    id: number;
    exercise: Exercise;
    user: User;
    status: number;
    updateDateTime: string;
    modifiedFiles?: string[];
}
