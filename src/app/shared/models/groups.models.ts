import { NoteEntity } from "./note.model";

export class Child {
    label: string = '';
    data: string = '';
    expandedIcon: string = '';
    collapsedIcon: string = '';
    children: Child[] = [];
}

/*
export class Groups {
    id: number = 0;
    label?: string;
    icon?: string;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: Groups[];
    parent?: Groups;
    checked:

}
export class GroupsTree {
    id: number = 0;
    companyId: number = 0;
    typeId: number = 0;
    name?: any;
    parentId?: any;
    children: any[] = [];
    parent?: any;
}

*/
export class Groups {
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
}

export class GroupsTree {
    label:string = ''
    id: number = 0;
    companyId: number = 0;
    typeId: number = 0;
    note?: NoteEntity = new NoteEntity();
    flagId:number = 0;
    specificNote?: string = '';
    supplementaryId: number = 0;
    parentId?: number;
    children: GroupsTree[] = [];
    partialSelected?: boolean;
    parent?: Groups = new Groups();
}

