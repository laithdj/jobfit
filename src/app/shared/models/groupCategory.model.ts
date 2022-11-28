import { Groups } from "./groups.models";
import { Group } from "./task.model";

export class GroupCategory {
    label?: string;
    icon?: string;
    id:number = 0;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: Groups[];
    parent?: Groups;
}


