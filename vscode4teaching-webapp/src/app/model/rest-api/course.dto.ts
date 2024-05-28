import { ExerciseDTO } from "./exercise.dto";
import { UserDTO } from "./user.dto";

export interface CourseDTO {
    id: string;
    name: string;
    creator?: UserDTO;
    exercises?: ExerciseDTO[];
}
