import { NoteEntity } from "./note.model";

export class PPE {
    id: number = 0;
    label: string = '';
    note: string = '';
    categoryId: number = 0;
    taskId:number = 0;
    supplementaryEntityId: number = 0;
    specificNote: string = '';
    originalRevisionId: number = 0;
    children: PPE[] = [];
    parentId: number = 0;
}
export class PPETree {
    label: string = '';
    id: number = 0;
    companyId: number = 0;
    typeId: number = 0;
    specificNote?:string = '';
    parentId: number = 0;
    children: PPETree[] = [];
    parent: any;
    partialSelected?: boolean;
    generalNote?: string = '';
    note: NoteEntity = new NoteEntity();
    fit:boolean = false;
    expanded?:boolean = false;
}
