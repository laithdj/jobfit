import { JobTaskFlag } from "./flags.models";
import { Jobs } from "./jobs.model";
import { Task } from "./task.model";

export class AssociatedTask {
    currentPage: number = 0;
    tasks: JobTask[] = [];
    listCount: number = 0;
  }
  export class JobTask {
    id:number = 0;
    taskId:number = 0;
    task: Task = new Task();
    jobId:number = 0;
    originalRevisionId: number = 0;
    job: Jobs = new Jobs();
    fileName:string = '';
    priority:number = 0;
    ratio:number = 0;
    req:TaskRequirement = new TaskRequirement();
    comment: string = '';
    flags: JobTaskFlag[] = [];
  }
  export class TaskRequirement {
    id: number = 0;
    name: string = '';
  }

  export class BatchAssociatedTasks
  {
    jobId: number = 0; 
    associatedTaskIds: number[] = [];
    removedAssociatedTaskIds: number[] = [];
    frequency: string = ""; 
  }