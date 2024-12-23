import { ExerciseDTO } from "./exercise.dto";
import { UserDTO } from "./user.dto";

export interface CourseDTO {
    id: number;
    name: string;
    creator?: UserDTO;
    exercises?: ExerciseDTO[];
}
