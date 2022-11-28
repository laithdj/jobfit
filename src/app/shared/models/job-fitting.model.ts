export class JobFitSummary {
    environmentalFactors: SummaryResult = new SummaryResult();
    gripStrength: SummaryResult = new SummaryResult();
    healthHygiene: SummaryResult = new SummaryResult();
    humanFactors: SummaryResult = new SummaryResult();
    id:number = 0;
    isJob: boolean = false;
    isVirtual: boolean = false;
    jobId: number = 0;
    materialHandlings: SummaryResult = new SummaryResult();
    name: string = '';
    posturalTolerances: SummaryResult = new SummaryResult();
    ppe: SummaryResult = new SummaryResult();
    required:boolean = false;
    taskSetId: number = 0;
    workerId: number = 0;
    isActive = false;
}

export class SummaryResult {
    fail:number = 0;
    notTested: number = 0;
    pass: number = 0;
}
export class JobFitOptions{
    additionalTaskSetIndex:number = 0;
    dictionary:any;
    allExistingTaskSetIds:any;
    additionalTaskSetsList:number[] = [];
    assumptionFitDate:Date | null = null;
    deptId: number = 0;
    displayDate:Date | null = null;
    failTaskSetIds:number[] | null = null;
    hideShowOption: boolean | null = null;
    includedExistingTaskSetIds: number[] | null = null;
    associatedId: number = 0;
    minFARecordDate:Date | null = null;
    passTaskSetIds: number[] | null = null;
    useAssumptionFit:boolean = false;
    suitableTaskIds: number[] = [];
    workerId: number = 0;
    jobId: number = 0;
    taskId: number = 0;
}
export class JobFitItem {
    fit:boolean = false;
    groupName: string ='';
    itemId: number = 0;
    name:string = '';
    requirement: string = '';
    score:string = '';
}
export class JobFitEnvironmentalFactor {
    categoryId: number = 0;
    fit:boolean = false;
    id:number = 0;
    isActive:boolean = false;
    lastUpdate:Date = new Date();
    name:string = '';
    note:string = '';
    noteId: number =0;
    specificNote: string = '';
    workerSpecificNote: string = '';
}
export class JobFitHealthHygiene {
    criteria: string = '';
    field: string ='';
    fit:boolean = false;
    macId: number = 0;
    name: string = '';
    required: string = '';
    result: string = '';
}


export enum EJobFitSideMenu{
    WorkerVsEmp = 0,
    WorkerVsJob = 1,
    WorkerVsTasks = 2,
    WorkerVsDept = 3,
    JobVsEmp = 4,
    JobVsWorker = 5
}