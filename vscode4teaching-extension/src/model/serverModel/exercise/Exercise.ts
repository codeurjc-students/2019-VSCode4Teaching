import { Course } from "../course/Course";

export interface Exercise {
    id: number;
    name: string;
    course?: Course;
    includesTeacherSolution: boolean;
    solutionIsPublic: boolean;
    allowEditionAfterSolutionDownloaded: boolean;
}

export function instanceOfExercise(object: any): object is Exercise {
    return "id" in object && "name" in object;
}
