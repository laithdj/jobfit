
    export class Child {
        label: string = '';
        data: string = '';
        expandedIcon: string = '';
        collapsedIcon: string = '';
        children: Child[] = [];
    }

    export class SiteRelationShips {
        label: string = '';
        data: string = '';
        expandedIcon: string = '';
        collapsedIcon: string = '';
        children: Child[] = [];
    }


    export interface SiteRelationShip<T = any> {
        label?: string;
        data?: T;
        icon?: string;
        expandedIcon?: any;
        collapsedIcon?: any;
        children?: SiteRelationShip<T>[];
        leaf?: boolean;
        expanded?: boolean;
        type?: string;
        parent?: SiteRelationShip<T>;
        partialSelected?: boolean;
        styleClass?: string;
        draggable?: boolean;
        droppable?: boolean;
        selectable?: boolean;
        key?: string;
    }