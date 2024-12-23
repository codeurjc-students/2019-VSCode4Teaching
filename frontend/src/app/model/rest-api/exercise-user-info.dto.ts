import { ExerciseDTO } from "./exercise.dto";
import { UserDTO } from "./user.dto";

export interface ExerciseUserInfoDTO {
    id: string;
    exercise: ExerciseDTO;
    user: UserDTO;
    status: string;
    modifiedFiles?: string[];
    updateDateTime?: string;
}
