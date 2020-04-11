import { User } from "../user/User";
import { Exercise } from "./Exercise";

export interface ExerciseUserInfo {
    exercise: Exercise;
    user: User;
    finished: boolean;
}
