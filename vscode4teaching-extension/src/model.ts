export interface User {
    id: number;
    username: string;
    courses?: Course[];
}

export interface Course {
    id: number;
    name: string;
    exercises?: Exercise[];
}

export interface Exercise {
    id: number;
    name: string;
}