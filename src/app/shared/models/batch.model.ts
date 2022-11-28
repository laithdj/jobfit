import { BatchCopyOptions, RenameOptions } from "./jobs.model";

export enum EBatchWorkerAction
{
    SetRemoveWorkerFlag = 1,
    AddRemoveWorkerGroup = 2,
    GenerateWorkerReport = 3
}
export enum EBatchTaskAction
{
    SetRemoveTaskFlag = 1,
    AddRemoveTaskGroup = 2,
    AddRemoveTaskSite = 3,
    CopyTask = 4,
    AdjustTaskTitle = 5,
    GenerateTaskReport = 6
}
export enum EBatchJobAction
{
    SetRemoveJobFlag = 1,
    AddRemoveJobGroup = 2,
    AddRemoveJobDept = 3,
    CopyJob = 4,
    AdjustJobTitle = 5,
    GenerateJobReport = 6
}
export class BatchOptionsView
{
    ids: number[] = []; 
    jobFitEntityType: string = '';
    isSet: boolean = true;
    flagIds: number[] = [];
    groupIds: number[] = [];
    orgIds: number[] = [];
    renameOptions: RenameOptions = new RenameOptions();
    batchCopyOptions: BatchCopyOptions = new BatchCopyOptions();
}

export class BatchRenameAdjusted
{
    id: number = 0; 
    name: string = "";
    adjustedName: string = "";
}

export enum EJobFitEntity
{
    Workers = "Workers",
    Tasks = "Tasks",
    Jobs = "Jobs"
}

export enum EChangeCaseOptionTypes
{
    LeaveUnchanged = 0,
    TitleCase = 1,
    TitleCaseWithLowercaseAction = 2
}
export enum ECopyIncludeOptionTypes
{
    None = 0,
    Notes = 1,
    Flags = 2,
    Groups = 3,
    Attachments = 4,
    HH = 5,
    FA = 6,
    HF = 7,
    EF = 8,
    PPE = 9,
    AssociatedTasks = 10,
    AssociatedJobs = 11
}