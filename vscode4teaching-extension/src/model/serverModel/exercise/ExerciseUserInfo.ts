import { User } from "../user/User";
import { Exercise } from "./Exercise";

export interface ExerciseUserInfo {
    exercise: Exercise;
    user: User;
    status: number;
    updateDateTime: Date;
    lastModifiedFile?: string;
}
