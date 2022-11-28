import { JobFitOptions } from "./job-fitting.model";

export class ReportResults {
    currentPage: number = 0;
    listCount: number = 0;
    reports: Report[] = [];
}
export class Report {
    id: number = 0;
    name: string = '';
    description: string = '';
    reportType: ReportType = new ReportType();
    reportSection:ReportSectionSet[] = [];
    typeId: number = 0;
    isAvailable: boolean = false;
}
export class ReportType {
    Id: number = 0;
    typeName = '';
    isActive = false;
}
export class ReportSectionSet {
    id:number = 0;
    reportSection: ReportSection = new ReportSection();
    reportSectionId: number = 0;
    reportId: number = 0;
    isActive: boolean = false;
}
export class ReportSection {
    Id: number = 0;
    name: string = '';
    description: string = '';
}
export class ReportOptions {
    ids: number[] = [];
    jobFitEntityType: string = '';
    reportName = '';
    reportId: number = 0;
    isStandard: boolean = true;
    isSystemReport: boolean = false;
    isSummary: boolean = false;
    generalReportOptions = new GeneralReportOptions();
    assocTaskReportOptions = new AssocTaskReportOptions();
    faReportOptions = new FAReportOptions();
    taskDetailsReportOptions = new TaskDetailsReportOptions();
    jobfitReportOptions = new JobFitOptions();
}

export class GeneralReportOptions {
    includeBiologicalSex: boolean = false;
    includeAddress: boolean = false;
    includeFAQPage: boolean = true;
    includeImageAttachments: boolean = false;
    includeJobfitMatchingGrid: boolean = false;
}

export class AssocTaskReportOptions {
    includeTaskDetails: boolean = false;
    includeTaskImageAttachments: boolean = false;
    sortTaskBy: string = "Name";
}

export class FAReportOptions {
    recordSelectionOption: string = "Current";
    includeRecords: boolean = true;
    includeGraphs: boolean = false;
    posturalToleranceIds: number[] = [];
    materialHandlingContinuousIds: number[] = [];
    materialHandlingFrequentIds: number[] = [];
    materialHandlingOccassionalIds: number[] = [];
    startDate?: Date;
    endDate?: Date;
}

export class TaskDetailsReportOptions {
    taskIncludeOption: string = "None";
    suitableTaskIds: number[] = [];
    customTaskIds: number[] = [];
}

export enum EReportType {
    Worker = "Worker",
    Task = "Task",
    Job = "Job",
    JobFit = "JobFit"
}
