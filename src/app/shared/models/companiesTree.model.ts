import { SiteTree } from "./sites.model";


export class CompaniesTree{
    label?: string;
    icon?: string;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: SiteTree[];
    parent?: SiteTree;
}