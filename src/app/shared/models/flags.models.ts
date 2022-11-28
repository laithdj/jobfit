import { NoteEntity } from "./note.model";


export class Flags {
    id: number = 0;
    label:string = ''
    companyId: number = 0;
    typeId: number = 0;
    name?: any;
    flagId:number = 0;
    supplementaryId: number = 0;
    parentId?: number;
    children: any[] = [];
    parent?: any;
    specificNote?: string = '';
    note:string = '';
}
export class Flag {
    id:number = 0;
    label: string = '';
    companyId: number = 0;
    typeId: number = 0;
    name?: any;
    flagId:number = 0;
    supplementaryId: number = 0;
    note:string = '';
    categoryId: number = 0;
    taskId:number = 0;
    supplmentaryId: number = 0;
    specificNote: string = '';
    originalRevisionId: number = 0;
    parentId: number = 0;
    parent?: any;
    children: Flag[] = [];
  }


export class FlagsTree {
    label:string = ''
    id: number = 0;
    companyId: number = 0;
    typeId: number = 0;
    specificNote: string = '';
    note?:NoteEntity = new NoteEntity();
    faNote?:NoteEntity = new NoteEntity();
    flagId:number = 0;
    supplementaryId: number = 0;
    parentId?: number;
    children: any[] = [];
    partialSelected?: boolean;
    parent?: Flags = new Flags();
    isActive: boolean = false;
}
export class JobTaskFlag {
    entityId: number = 0 ;
    id: number = 0;
    isActive: boolean = false;
    lastUpdate: Date = new Date();
    originalRevisionId?:number = 0;
    specificNote: string = '';
    supplementaryEntityId: number = 0;
} 