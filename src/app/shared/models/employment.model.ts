import { Dept } from "./department.model";
import { Flags } from "./flags.models";
import { Jobs } from "./jobs.model";
import { Worker } from "./worker.model";

export class EmploymentResultView {
    employments: Employment[] = [];
    listCount: number = 0;
    currentPage: number = 0;
}
export class Employment {
    comments: string = '';
    displayGroup: string = '';
    employmentTypeId: number = 1;
    firstName: string = '';
    jobId:number=0;
    flags: Flags[] = [];
    id:number = 0;
    isActive: boolean = false;
    lastName: string = '';
    originalRevisionId: number | null = null;
    orgEntityId: number = 0;
    job:Jobs = new Jobs();
    rosterId: number = 0;
    startDate: Date = new Date();
    stopDate?: Date;
    workerId: number = 0;
    jobFitSummaryScore: JobFitSummaryScore = new JobFitSummaryScore();
    jobFitResultView: JobFitResultView = new JobFitResultView();
    jobFitResultId: number = 0;
    jobFitScoreId: number = 0;
    roster: Roster = new Roster();
    departmentName: string = '';
    worker: Worker = new Worker();
}
export class JobFitSummaryScore {
    addedByEmployment: boolean = false;
    comments: string = '';
    date: Date = new Date();
    id: number = 0;
    isActive: boolean = false;
    job: Jobs = new Jobs();
    jobFitScore: JobFitScoreView = new JobFitScoreView();
    jobFitScoreId: number = 0;
    workerId: number = 0;
    jobId: number = 0;
}
export class JobFitSummaryScoreResult {
    summaryScore: JobFitSummaryScore[] = [];
    listCount: number = 0;
    currentPage:number = 0;
}
export class JobFitScoreView {
    id: number = 0;
    isActive: boolean = false;
    name: string = '';
    value: number = 0;
}
export class JobFitResultView {
    id:number = 0;
    isActive: boolean = false;
    result: string = '';
}
export class Roster {
    id: number = 0;
    isActive: boolean = false;
    orgEntityId: number = 0;
    name: string = '';
    briefDescription: string = '';
    daysOff: number = 0;
    daysOn: number = 0;
    displayOrder: number = 0;
    shiftLength:number = 0;
    fullDescription : string = '';
    label: string = '';
}
export class EmploymentSearchCriteria {
    departmentId?: number = 0;
    useForPreEmployment: boolean = false;
    pageNumber: number = 0;
    count: number = 0;
    sortField: string = '';
    sortDir: string = '';
}

export class EmploymentJob {
    name: string ='';
    id: number = 0;
    departments: Dept[] = [];
}
