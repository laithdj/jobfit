import { Flags } from "./flags.models";

export class FlagCategory{
    label?: string;
    icon?: string;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: Flags[];
    parent?: Flags;
}