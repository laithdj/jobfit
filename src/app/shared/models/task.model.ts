import { Environmental } from "./enviromental.model";
import { HumanFactor } from "./human-factors.model";
import { PPE } from "./ppe.model";
import { SiteTree } from "./sites.model";

    export class Task {
      id:number = 0
      originalRevisionId:number = 0;
      name:string = '';
      department:string = '';
      groups:Group[] = [];
      flags:Flag[] = [];
      environmentalFactors: Environmental[] = [];
      humanFactor: HumanFactor[] = [];
      ppe: PPE[] = [];
      description:string = '';
      sites:SiteTree[] = [];
      nextAssessmentScheduleId: number = 0;
      siteIds: number[] = [];
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
    export class TaskItem {
      currentPage: number = 0;
      listCount: number = 0;
      tasks: Task[] = [];
      }
  
      export class Group {
        id:number = 0;
        label: string = '';
        companyId: number = 0;
        typeId: number = 0;
        name?: any;
        flagId:number = 0;
        supplementaryId: number = 0;
        parent?: any;
        note:string = '';
        categoryId: number = 0;
        taskId:number = 0;
        supplmentaryId: number = 0;
        specificNote: string = '';
        originalRevisionId: number = 0;
        parentId: number = 0;
        children: Flag[] = [];
      }

  
      export class Flag {
        id:number = 0;
        label: string = '';
        note:string = '';
        categoryId: number = 0;
        taskId:number = 0;
        supplmentaryId: number = 0;
        specificNote: string = '';
        originalRevisionId: number = 0;
        parentId: number = 0;
        children: Flag[] = [];
      }
  


