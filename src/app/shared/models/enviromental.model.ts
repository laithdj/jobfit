import { Note, NoteEntity } from "./note.model";

export class Child {
    label: string = '';
    data: string = '';
    expandedIcon: string = '';
    collapsedIcon: string = '';
    children: Child[] = [];
}


export class Environmental {
    id:number = 0;
    label?: string;
    categoryId: number = 0;
    taskId:number = 0;
    supplmentaryId: number = 0;
    specificNote: string = '';
    note?: NoteEntity = new NoteEntity();
    originalRevisionId: number = 0;
    icon?: string;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: Environmental[];
    parent?: Environmental;

}
export class EnvironmentalTree {
    id: number = 0;
    companyId: number = 0;
    typeId: number = 0;
    name?: any;
    parentId?: any;
    children: any[] = [];
    parent?: any;
    partialSelected?: boolean;
    note: NoteEntity = new NoteEntity();
    generalNote?: string = '';
    specificNote?:string = '';
    fit:boolean = false;
    expanded?: boolean = false;
}
