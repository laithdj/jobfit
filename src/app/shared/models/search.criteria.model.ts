import { DeptTree } from "./department.model";
import { FlagsTree } from "./flags.models";
import { GroupsTree } from "./groups.models";
import { Jobs } from "./jobs.model";
import { Provider } from "./provider.model";
import { QuickSearch } from "./quicksearch.model";
import { Task } from "./task.model";

export class SearchCriteria {
    pageNumber: number = 0;
    count: number = 0;
    sortField: string = '';
    sortDir: string = '';
    type?: string = '';
    jobId?:number = 0;
    taskId?:number = 0;
    quickSearch: QuickSearch = new QuickSearch();
    advancedSearch: AdvancedSearch | null = new AdvancedSearch();
}

export class NoteSearchCriteriaView {
    count: number = 0;
    pageNumber: number = 0;
    sortField: string = '';
    sortDir: string = '';
    type: string = '';
}

export class JobsSearchCriteria {
    pageNumber: number = 0;
    count: number = 0;
    sortField: string = '';
    quickSearch: QuickSearch = new QuickSearch();
    advancedSearch: JobsAdvancedSearch | null = new JobsAdvancedSearch();
}
export class WorkersSearchCriteria {
    pageNumber: number = 0;
    count: number = 0;
    sortField: string = '';
    quickSearch: QuickSearch = new QuickSearch();
    advancedWorkerSearch: AdvancedWorkerSearch = new AdvancedWorkerSearch();
}
export class AdvancedWorkerSearch {
    WorkerDetailSearch: WorkerDetailSearchView = new WorkerDetailSearchView();
    flagsOption: number = 0;
    flags: FlagsTree[] = []; 
    groups: GroupsTree[] = [];
    groupsOption: number = 0;
    advancedEmploymentSearch: AdvancedEmploymentSearch = new AdvancedEmploymentSearch();
    functionalAnalysis = new FunctionalAnalysisSearch();
}
export class WorkerDetailSearchView {
    ageFrom?: number;
    ageTo?: number;
    dobFrom?: Date;
    dobTo?: Date;
    employeeId: string = '';
    firstName: string = '';
    lastName: string = '';
    isMale?: boolean; 
}

export class AdvancedEmploymentSearch {
    sites: DeptTree[] = [];
    preEmployment?: boolean;
    pastEmploymentFrom?: Date;
    pastEmploymentTo?: Date;
    flags: FlagsTree[] = []; 
    flagsOption: number = 0;
}

export class AdvancedSearch {
    name: string = '';
    flags: FlagsTree[] = [];
    sites: DeptTree[] = [];
    flagsOption: number = 0;
    groups: GroupsTree[] = [];
    groupsOption: number = 0;
    jobs: JobSearch = new JobSearch();
    functionalAnalysis = new FunctionalAnalysisSearch();
}
export class JobsAdvancedSearch {
    name: string = '';
    flags: FlagsTree[] = [];
    sites: DeptTree[] = [];
    flagsOption: number = 0;
    groups: GroupsTree[] = [];
    groupsOption: number = 0;
    tasks: TaskSearch = new TaskSearch();
    functionalAnalysis = new FunctionalAnalysisSearch();
}
export class FunctionalAnalysisSearch {
    flagsOption: number = 0;
    events: Event[] = [];
    flagSearch:FlagsTree[] = [];
    from?: Date;
    providers: Provider[] = [];
    to?: Date;
}
export class SearchFlags {
    items: SearchEntity[] = [];
    type: any;
}
export class Event {
    companyId: number = 0 ;
    id: number = 0;
    isActive: boolean = false;
    name:string = '';
    lastUpdate: Date = new Date();
}
export class SearchEntity {
    category: any;
    categoryId: number = 0;
    id: number = 0;
    isActive: boolean = true; 
    Name:string = '';
    Note:string = '';
    NoteId: number = 0;
}
export class JobSearch {
    flags: FlagsTree[] = [];
    sites: DeptTree[] = [];
    frequency: TaskRequirement = new TaskRequirement();
    searchOption: number = 0;
    jobs: Jobs[] = [];
}
export class TaskSearch {
    flags: FlagsTree[] = [];
    sites: DeptTree[] = [];
    frequency: TaskRequirement = new TaskRequirement();
    searchOption: number = 0;
    tasks: Task[] = [];
}
export class TaskRequirement {
    ID: number = 0;
    name: string = '';
}
export enum EmploymentType {
   Employment = 1,
   PreEmployment = 2
}
