export class DeptTree {
    id: number = 0;
    label:string = ''
    companyId: number = 0;
    typeId: number = 0;
    typeName?: string = '';
    parentId?: number;
    children: DeptTree[] = [];
    parent?: any;
    partialSelected?: boolean;
    selectable?: boolean = false;
    expanded?: boolean = false;
}
export class Dept{
    id: number = 0;
    label:string = ''
    companyId: number = 0;
    typeId: number = 0;
    name?: any;
    supplementaryId: number = 0;
    parentId?: number;
    children: any[] = [];
    parent?: any;
}
