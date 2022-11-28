import { NoteEntity } from "./note.model";


export class HumanFactor {
    id: number = 0;
    label: string = '';
    note: string = '';
    categoryId: number = 0;
    taskId:number = 0;
    supplementaryEntityId: number = 0;
    specificNote: string = '';
    originalRevisionId: number = 0;
    parentId: number = 0;
    children: any[] = [];
}
export class HumanFactorTree {
    label: string = '';
    id: number = 0;
    categoryId?: number = 0;
    typeId?: number = 0;
    parentId?: number = 0;
    specificNote?:string = '';
    children: HumanFactorTree[] = [];
    parent: any;
    note: NoteEntity = new NoteEntity();
    partialSelected?: boolean;
  //  note: string = '';
    fit:boolean = false;
    expanded?:boolean = false;
}