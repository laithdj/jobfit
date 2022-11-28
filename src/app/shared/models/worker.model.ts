import { HealthHygiene } from "./health-hygeine.model";
import { Groups } from "./groups.models";
import { Notes } from "./notes.model";
import { Environmental } from "./enviromental.model";
import { SupplementaryEntity } from "./jobs.model";
import { Flags } from "./flags.models";
import { PPE } from "./ppe.model";
import { HumanFactor } from "./human-factors.model";
import { Attachments } from "./attachments.model";
import { FunctionalAnalysis } from "./functional-analysis.model";
import { Flag, Group } from "./task.model";

export class Worker {
    originalRevisionID: number | undefined;
    workerId: number = 0;
    firstName: string = '';
    lastName: string = '';
    employeeID: string = '';
    dob: Date = new Date();
    notes: Notes[] = [];
    isMale: boolean = false;
    gender: string = '';
    NextDueDateId: number = 0;
    isActive: boolean = true;
    flagsString: string = '';
    groupsString: string = '';
    lastUpdate: Date = new Date();
    mailAddress: Address = new Address();
    homeAddress: Address = new Address();
    workAddress: Address = new Address();
    homePhone: string = '';
    workPhone: string = '';
    mobileNo: string = '';
    emailAddress: string = '';
    fullName: string = '';
    flags: Flag[] = [];
    groups: Group[] = [];
    ppe: PPE[] = [];
    humanFactors: HumanFactor[] = [];
    environmentalFactors: Environmental[] = [];
    attachment: Attachments[] = [];
    functionalAnalysis: FunctionalAnalysis[] = [];
    nextAssessmentScheduleId: number = 0;
    duplicateWorkerId: number = 0;
}

export class Address {
    line1: string = '';
    line2: string = '';
    city: string = '';
    state: string = '';
    postcode: string = '';
    country: string = '';
    
}
export class HealthHygieneNextAssessmentSchedule{
    nextAssessmentScheduleId: number = 0;
    healthHygieneId: number = 0;
    originalRevisionId: number = 0;
    assessmentDateTime: Date = new Date;
    providerId: number|null = 0;
    comments: string = '';
    isActive: boolean = false;
}
export class NextAssesmentSchedule {
    originalRevisionId: number = 0;
    assessmentDateTime: Date = new Date;
    providerId: number|null = 0;
    comments: string = '';
    isActive: boolean = false;
}
export class NextDueDate{
    isManualNextDueDate: boolean = true;
    date: Date = new Date;
    comments: string = '';
    source: string = '';
}
export class WorkerDetailView {
    workerId: number = 0;
    workerFirstName: string = '';
    workerLastName: string = '';
    workerName: string = this.workerFirstName + this.workerLastName;
    jobId: number = 0;
    jobName: string = '';
    rosterString: string = '';
    employmentComments: string = '';
    results: string = '';
    jobFitScore: string = '';
    startDate: Date = new Date;
    stopDate: Date = new Date;
}

export class WorkerViewModel {
    companyId: number = 0;
    employeId: number = 0;
    firstName: string = '';
    lastName: string = '';
    dOB: Date = new Date;
    gender: string = '';
    homePhone: string = '';
    mobilePhone: string = '';
    email: string = '';
}

export class CombineOptionsView {
    combineEntityName: string = '';
    firstEntityId: number = 0;
    flagsToRemove: SupplementaryEntity[] = [];
    flagsToSet: SupplementaryEntity[] = [];
    groupsToSet: SupplementaryEntity[] = [];
    groupsToRemove: SupplementaryEntity[] = [];
    secondEntityId: number = 0;
}

export class WorkerItem {
    currentPage: number = 0;
    listCount: number = 0;
    workers: Worker[] = [];
}