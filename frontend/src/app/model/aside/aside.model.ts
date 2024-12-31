export interface AsideItem {
    name: string;
    id: number;
    collapsed: boolean;
    subitems: AsideSubitem[];
    actions: AsideAction[];
    callback?: (itemId: number, ...info: string[]) => void;
}

export interface AsideSubitem {
    name: string;
    id: number;
    icon: string;
    actions: AsideAction[];
    callback: (itemId: number, subitemId: number, ...info: string[]) => void;
}

export interface AsideAction {
    name: string;
    icon: string | undefined;
    callback: (itemId: number, subitemId?: number, ...info: string[]) => void;
}
