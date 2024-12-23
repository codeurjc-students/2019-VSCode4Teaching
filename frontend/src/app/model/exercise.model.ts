import { Course } from "./course.model";
import { ExerciseDTO } from "./rest-api/exercise.dto";

export class Exercise {
    readonly #id: number;
    readonly #name: string;
    readonly #course?: Course;
    readonly #includesTeacherSolution: boolean;
    #solutionIsPublic: boolean;
    #allowEditionAfterSolutionDownloaded: boolean;


    constructor(dto: ExerciseDTO) {
        this.#id = dto.id as number;
        this.#name = dto.name;
        if (dto.course) this.#course = new Course(dto.course);
        this.#includesTeacherSolution = dto.includesTeacherSolution;
        this.#solutionIsPublic = dto.solutionIsPublic;
        this.#allowEditionAfterSolutionDownloaded = dto.allowEditionAfterSolutionDownloaded;
    }


    get id(): number {
        return this.#id;
    }

    get name(): string {
        return this.#name;
    }

    get course(): Course | undefined {
        return this.#course;
    }

    get includesTeacherSolution(): boolean {
        return this.#includesTeacherSolution;
    }

    get solutionIsPublic(): boolean {
        return this.#solutionIsPublic;
    }

    set solutionIsPublic(value: boolean) {
        this.#solutionIsPublic = value;
    }

    get allowEditionAfterSolutionDownloaded(): boolean {
        return this.#allowEditionAfterSolutionDownloaded;
    }

    set allowEditionAfterSolutionDownloaded(value: boolean) {
        this.#allowEditionAfterSolutionDownloaded = value;
    }

    public toDTO = (): ExerciseDTO => {
        return {
            id: this.id,
            name: this.name,
            ...(this.course ? { course: this.course.toDTO() } : {}),
            includesTeacherSolution: this.includesTeacherSolution,
            solutionIsPublic: this.solutionIsPublic,
            allowEditionAfterSolutionDownloaded: this.allowEditionAfterSolutionDownloaded
        };
    }
}
