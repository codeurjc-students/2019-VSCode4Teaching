import { AsideAction, AsideItem, AsideSubitem } from "./aside.model";

export class AsideStudentCourse implements AsideItem {
    name: string;
    id: number;
    collapsed: boolean;
    subitems: AsideStudentExercise[];
    actions: AsideAction[];
    callback?: (itemId: number, ...info: string[]) => void;

    constructor(name: string, id: number, subitems: AsideStudentExercise[], callback?: (itemId: number, ...info: string[]) => void) {
        this.name = name;
        this.id = id;
        this.collapsed = true;
        this.subitems = subitems;

        // TODO Actions to be implemented when course screens are ready
        this.actions = [
            { name: "Refresh exercises", icon: "fas fa-rotate-right", callback: (courseId) => console.log(`Refresh course ${courseId}`) },
        ];
        this.callback = callback;
    }
}

export class AsideStudentExercise implements AsideSubitem {
    name: string;
    id: number;
    actions: AsideAction[];
    callback: (itemId: number, subitemId: number, ...info: string[]) => any;

    constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
        this.actions = [];
        this.callback = (courseId, exerciseId) => { console.log(`Click exercise ${exerciseId} course ${courseId}`) };
    }
}
