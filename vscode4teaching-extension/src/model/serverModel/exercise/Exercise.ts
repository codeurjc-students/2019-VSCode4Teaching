export interface Exercise {
    id: number;
    name: string;
}
export function instanceOfExercise(object: any): object is Exercise {
    return "id" in object && "name" in object;
}
