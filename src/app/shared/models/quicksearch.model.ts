export class QuickSearch {
    field:string = 'Name';
    value:string = '';
    type:QuickSearchType | undefined;
}
export enum QuickSearchType{
    Contains = 0,
    StartsWith = 1,
    EndsWith = 2
}