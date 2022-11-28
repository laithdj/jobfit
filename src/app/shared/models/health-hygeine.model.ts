export class HealthHygiene {
    useResult: boolean = false;
    id: number = 0;
    name: string = '';
    inputItems: HealthHygieneInputItemView[] = [];
    nextDueDateSetting: NextDueDateSetting = new NextDueDateSetting();
}
export class NextDueDateSetting {
    healthHygieneTypeId?:number = 0; 
    healthHygieneId?:number = 0; 
    years:number = 0;  
    months:number = 0; 
    days:number = 0; 
}
export class HealthHygieneResult {
    assessmentDate: Date = new Date();
    healthHygieneId: number = 0;
    healthHygiene: HealthHygiene = new HealthHygiene();
    id: number = 0;
    isActive: boolean = false;
    nextDueDate: NextDueDate = new NextDueDate();
    providerId: number = 0;
    results: HealthHygieneInputItemResult[] = [];
    originalRevisonId: number = 0;
}
export class NextDueDate {
    date:Date | undefined;
    lastUpdate: Date = new Date();
    id: number = 0;
    isActive: boolean = false;
    source: string = '';
    isManualNextDueDate: boolean | undefined = false;
}
export class HealthHygieneInputItemResult {
    healthHygieneInputItemId: number = 0;
    healthHygieneResultId: number = 0;
    id: number = 0;
    inputItem: HealthHygieneInputItemView = new HealthHygieneInputItemView();
    isActive: boolean = false;
    value: string = '';
    valueText: string = '';
    inputTypeId: number = 0;
    name: string = '';
    useResult: boolean = false;
}
export class HealthHygieneInputItemView {
    category: string ='';
    categoryString: string = '';
    displayOrder: any;
    healthHygiene: HealthHygiene = new HealthHygiene();
    healthHygieneId: number = 0;
    id: number = 0;
    inputTypeId:number = 0;
    isActive: boolean = false;
    isConfirmed: boolean = false;
    name: string = '';
    sessionId: string = '';
    zone: string = '';
    listItems: HealthHygieneInputListItem[] = [];
    settings: HealthHygieneInputItemSettings[] = [];
    type: InputType = new InputType();
    
}
export class HealthHygieneInputListItem {
    healthHygieneInputItemId: number = 0;
    id: number = 0;
    isActive: boolean = false;
    itemIndex: any;
    itemText: string = '';
    itemValue: string = '';
}
export class InputType {
    id: number = 0;
    isActive: boolean = false;
    typeName: string = '';
}
export class HealthHygieneInputItemSettings {
    defaultValue: string = '';
    healthHygieneInputItemId: number = 0;
    id:number = 0 ;
    isActive: boolean = false;
    maxValue: string = '';
    minValue: string = '';
    precision:any;
    required: boolean = false;
    selectLimit: any;
    separator: string = '';
    unit: string = '';
}
export class HHListItem {
    id: number = 0;
    name: string = "";
    isActive: boolean = true;
}

export enum EInputType{
    Text = 1,
    Selection = 2,
    Decimal = 3,
    DecimalRange = 4,
    WholeNumber = 5,
    WholeNumberRange = 6,
    Date = 7,
    DateRange = 8,
    YesNo = 9,
    FileAttachment = 10,
    Comments = 11
}
export class HealthHygieneResults{
    currentPage: number = 0;
    listCount: number = 0;
    healthHygiene: HealthHygiene[] = [];
}

export class HHResultPerCategory {
    category: string = "";
    healthHygieneResultId: number = 0;
    results: HealthHygieneInputItemResult[] = [];
}

export class HHListPerCategory {
    categories: HHResultPerCategory[]=[];
}
