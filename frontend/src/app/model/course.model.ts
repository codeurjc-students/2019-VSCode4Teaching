import { User } from "./user.model";
import { Exercise } from "./exercise.model";
import { CourseDTO } from "./rest-api/course.dto";
import { ExerciseDTO } from "./rest-api/exercise.dto";

export class Course {
    readonly #id: number;
    readonly #name: string;
    readonly #creator: User | undefined;
    #exercises: Exercise[] | undefined;

    constructor(dto: CourseDTO) {
        this.#id = dto.id as number;
        this.#name = dto.name;
        this.#creator = dto.creator ? new User(dto.creator) : undefined;
        this.#exercises = dto.exercises?.map((dto: ExerciseDTO) => new Exercise(dto)) ?? undefined;
    }


    get id(): number {
        return this.#id;
    }

    get name(): string {
        return this.#name;
    }

    get creator(): User | undefined {
        return this.#creator;
    }

    get exercises(): Exercise[] | undefined {
        return this.#exercises;
    }

    set exercises(value: Exercise[]) {
        this.#exercises = value;
    }


    public toDTO = (): CourseDTO => {
        return {
            id: this.id,
            name: this.name,
            creator: this.creator?.toDTO(),
            exercises: this.exercises?.map((exercise: Exercise) => exercise.toDTO())
        };
    }
}
