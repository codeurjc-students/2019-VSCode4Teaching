import { User } from "../user/User";
import { Exercise } from "./Exercise";
import { ExerciseStatus } from "./ExerciseStatus";

export interface ExerciseUserInfo {
    id: number;
    exercise: Exercise;
    user: User;
    status: ExerciseStatus.StatusEnum;
    updateDateTime: string;
    modifiedFiles?: string[];
}
