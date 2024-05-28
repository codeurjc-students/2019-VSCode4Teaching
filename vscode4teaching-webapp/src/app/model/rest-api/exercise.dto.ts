import { CourseDTO } from "./course.dto";

export interface ExerciseDTO {
    id: number;
    name: string;
    course: CourseDTO;
    includesTeacherSolution: boolean;
    solutionIsPublic: boolean;
    allowEditionAfterSolutionDownloaded: boolean;
}
