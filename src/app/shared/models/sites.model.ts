export class SiteTree {
    companyId: number = 0;
    children: SiteTree[] = [];
    id: number = 0;
    label: string = '';
    note: string = '';
    parent?: any;
    parentId: string = '';
    typeId: number = 0;
    partialSelected?: boolean;
    selectable?: boolean = false;
    expanded?: boolean = false;
}