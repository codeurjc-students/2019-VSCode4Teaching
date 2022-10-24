export namespace ExerciseStatus {
    export enum StatusEnum {
        NOT_STARTED = "NOT_STARTED",
        IN_PROGRESS = "IN_PROGRESS",
        FINISHED = "FINISHED"
    }

    export function toString(status: StatusEnum): string {
        switch (status) {
            case "NOT_STARTED":
                return "Not started";
            case "FINISHED":
                return "Finished";
            case "IN_PROGRESS":
                return "In progress";
            default:
                return "";
        }
    }
}
