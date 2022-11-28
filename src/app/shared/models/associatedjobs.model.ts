import { FlagsTree, JobTaskFlag } from "./flags.models";
import { Jobs } from "./jobs.model";
import { Flag, Task } from "./task.model";

export class AssociatedJob {
    currentPage: number = 0;
    jobs: TaskJobs[] = [];
    listCount: number = 0;
  }
  export class TaskJobs {
    id:number = 0;
    taskId:number = 0;
    task:Task = new Task();
    jobId:number = 0;
    job: Jobs = new Jobs();
    fileName:string = '';
    priority:number = 0;
    originalRevisionId: number = 0;
    ratio:number = 0;
    req:Req = new Req();
    comment: string = '';
    flags: JobTaskFlag[] = [];
  }

  export class Req {
    id: number = 0;
    name: string = '';
  }
