import { Exercise } from "./exercise.model";
import { User } from "./user.model";
import { ExerciseUserInfoDTO } from "./rest-api/exercise-user-info.dto";

export type ExerciseUserInfoStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";

export class ExerciseUserInfo {
    readonly #id: number;
    readonly #exercise: Exercise;
    readonly #user: User;
    #status: ExerciseUserInfoStatus;
    #modifiedFiles: string[] | undefined;
    readonly #updateDateTime: Date | undefined;


    constructor(dto: ExerciseUserInfoDTO) {
        this.#id = parseInt(dto.id);
        this.#exercise = new Exercise(dto.exercise);
        this.#user = new User(dto.user);
        this.#status = dto.status as ExerciseUserInfoStatus;
        this.#modifiedFiles = dto.modifiedFiles;

        // Add Z to the end of the string if it is missing
        // All dates coming from backend will be in UTC, so we can safely add Z to the end
        // This will make sure that the date is parsed as UTC and client will display it in local time
        const updateDateTime = (dto.updateDateTime?.slice(-1)[0] === "Z") ? dto.updateDateTime : dto.updateDateTime + "Z";
        this.#updateDateTime = updateDateTime ? new Date(updateDateTime) : undefined;
    }


    get id(): number {
        return this.#id;
    }

    get exercise(): Exercise {
        return this.#exercise;
    }

    get user(): User {
        return this.#user;
    }

    get status() {
        return this.#status;
    }

    get modifiedFiles(): string[] | undefined {
        return this.#modifiedFiles;
    }

    get updateDateTime(): Date | undefined {
        return this.#updateDateTime;
    }


    set status(value: ExerciseUserInfoStatus) {
        this.#status = value;
    }

    set modifiedFiles(value: string[] | undefined) {
        this.#modifiedFiles = value;
    }


    public toDTO = (): ExerciseUserInfoDTO => ({
        id: this.id.toString(),
        exercise: this.exercise.toDTO(),
        user: this.user.toDTO(),
        status: this.status,
        modifiedFiles: this.modifiedFiles
    });
}
