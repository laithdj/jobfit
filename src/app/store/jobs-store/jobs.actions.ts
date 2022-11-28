/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { AssociatedTask } from 'src/app/shared/models/associatedtasks.model';
import { EnvironmentalTree } from 'src/app/shared/models/enviromental.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { FunctionalAnalysis, PosturalToleranceGroup } from 'src/app/shared/models/functional-analysis.model';
import { Groups, GroupsTree } from 'src/app/shared/models/groups.models';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import { Postural } from 'src/app/shared/models/postural-tolerance.model';
import { PPETree } from 'src/app/shared/models/ppe.model';
import { HumanFactorTree } from 'src/app/shared/models/human-factors.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { HealthHygiene, HealthHygieneResult } from 'src/app/shared/models/health-hygeine.model';

// eslint-disable-next-line no-shadow
export enum JobsActionTypes {
  FetchJobDetails = 'Fetch Job Details',
  FetchJobDetailsSuccess = 'Fetch Job Details Success',
  FetchAssociatedTasks = 'Fetch Associated Jobs',
  FetchAssociatedTasksSuccess = 'Fetch Associated Jobs Success',
  FetchJobFlagTree = 'Fetch Job Flag Tree',
  FetchJobFlagTreeSuccess = 'Fetch Job Flag Tree Success',
  FetchJobGroupTree = 'Fetch Job Group Tree',
  FetchJobGroupTreeSuccess = 'Fetch Job Group Tree Success',
  FetchPosturalTolerances = 'Fetch Job Postural Tolerances',
  FetchPosturalTolerancesSuccess = 'Fetch Job Postural Tolerances Success',
  FetchPosturalToleranceGroups = 'Fetch Job Postural Tolerance Groups',
  FetchPosturalToleranceGroupsSuccess = 'Fetch JobPostural Tolerance Groups Success',
  FetchJobsFunctionalAnalysis = 'Fetch Job Current Functional Analysis',
  FetchJobsFunctionalAnalysisSuccess ='Fetch Job Current Functional Analysis Success',
  FetchFATaskFlagTree = 'Fetch Job FATask Flag Tree',
  FetchFATaskFlagTreeSuccess = 'Fetch Job FATask Flag Tree Success',
  FetchEnvironmentalFactorTree = 'Fetch Job Environmental Factors Tree',
  FetchEnvironmentalFactorTreeSuccess = 'Fetch Job Environmental Factors Tree Success',
  FetchPPETree = 'Fetch Job PPE Tree',
  FetchPPETreeSuccess = 'Fetch Job PPE Tree Success',
  FetchHFTree = 'Fetch Job Human Factors Tree',
  FetchHFTreeSuccess = 'Fetch Job Human Factors Tree Success',
  FetchDeptTree = 'Fetch Dept Tree',
  FetchDeptTreeSuccess = 'Fetch Dept Tree Success',
  FetchHealthHygieneResults = 'Fetch Job Health Hygiene Results',
  FetchHealthHygieneResultsSuccess = 'Fetch Job Health Hygiene Results Success',
  FetchHealthHygienes  = 'Fetch Job Health Hygiene',
  FetchHealthHygienesSuccess  = 'Fetch Job Health Hygiene Success',
}

export class FetchJobDetails implements Action {
  readonly type = JobsActionTypes.FetchJobDetails;

  constructor(public payload: number) { }
}
export class FetchJobDetailsSuccess implements Action {
  readonly type = JobsActionTypes.FetchJobDetailsSuccess;

  constructor(public payload: JobsDetails) { }
}
export class FetchPosturalToleranceGroups implements Action {
  readonly type = JobsActionTypes.FetchPosturalToleranceGroups;

  constructor() { }
}
export class FetchPosturalToleranceGroupsSuccess implements Action {
  readonly type = JobsActionTypes.FetchPosturalToleranceGroupsSuccess;

  constructor(public payload: PosturalToleranceGroup[]) { }
}
export class FetchAssociatedTasks implements Action {
  readonly type = JobsActionTypes.FetchAssociatedTasks;

  constructor(public payload: {jobId: number , searchCriteria: SearchCriteria}) { }
}
export class FetchAssociatedTasksSuccess implements Action {
  readonly type = JobsActionTypes.FetchAssociatedTasksSuccess;

  constructor(public payload: AssociatedTask) { }
}
export class FetchJobFlagTree implements Action {
  readonly type = JobsActionTypes.FetchJobFlagTree;

  constructor() { }
}
export class FetchPosturalTolerances implements Action {
  readonly type = JobsActionTypes.FetchPosturalTolerances;

  constructor(public payload: number) { }
}
export class FetchPosturalTolerancesSuccess implements Action {
  readonly type = JobsActionTypes.FetchPosturalTolerancesSuccess;

  constructor(public payload: Postural) { }
}

export class FetchJobsFunctionalAnalysis implements Action {
  readonly type = JobsActionTypes.FetchJobsFunctionalAnalysis;

  constructor(public payload : number) { }
}
export class FetchJobsFunctionalAnalysisSuccess implements Action {
  readonly type = JobsActionTypes.FetchJobsFunctionalAnalysisSuccess;

  constructor(public payload: FunctionalAnalysis) { }
}
export class FetchFATaskFlagTree implements Action {
  readonly type = JobsActionTypes.FetchFATaskFlagTree;

  constructor(public payload: FlagsTree[]) { }
}
export class FetchFATaskFlagTreeSuccess implements Action {
  readonly type = JobsActionTypes.FetchFATaskFlagTreeSuccess;

  constructor(public payload: FlagsTree[]) { }
}
export class FetchJobFlagTreeSuccess implements Action {
  readonly type = JobsActionTypes.FetchJobFlagTreeSuccess;

  constructor(public payload: FlagsTree[]) { }
}
export class FetchJobGroupTree implements Action {
  readonly type = JobsActionTypes.FetchJobGroupTree;

  constructor(public payload: Groups[]) { }
}
export class FetchJobFlagGroupSuccess implements Action {
  readonly type = JobsActionTypes.FetchJobGroupTreeSuccess;

  constructor(public payload: GroupsTree[]) { }
}
export class FetchEnvironmentalFactorTree implements Action {
  readonly type = JobsActionTypes.FetchEnvironmentalFactorTree;

  constructor(public payload:number) { }
}
export class FetchEnvironmentalFactorTreeSuccess implements Action {
  readonly type = JobsActionTypes.FetchEnvironmentalFactorTreeSuccess;

  constructor(public payload: EnvironmentalTree[]) { }
}
export class FetchPPETree implements Action {
  readonly type = JobsActionTypes.FetchPPETree;

  constructor() { }
}
export class FetchPPETreeSuccess implements Action {
  readonly type = JobsActionTypes.FetchPPETreeSuccess;

  constructor(public payload: PPETree[]) { }
}
export class FetchDeptTree implements Action {
  readonly type = JobsActionTypes.FetchDeptTree;

  constructor() { }
}
export class FetchDeptTreeSuccess implements Action {
  readonly type = JobsActionTypes.FetchDeptTreeSuccess;

  constructor(public payload: DeptTree[]) { }
}
export class FetchHFTree implements Action {
  readonly type = JobsActionTypes.FetchHFTree;

  constructor() { }
}
export class FetchHFTreeSuccess implements Action {
  readonly type = JobsActionTypes.FetchHFTreeSuccess;

  constructor(public payload: HumanFactorTree[]) { }
}
export class FetchHealthHygieneResults implements Action {
  readonly type = JobsActionTypes.FetchHealthHygieneResults;

  constructor(public payload: number) { }
}
export class FetchHealthHygieneResultsSuccess implements Action {
  readonly type = JobsActionTypes.FetchHealthHygieneResultsSuccess;

  constructor(public payload: HealthHygieneResult[]) { }
}
export class FetchHealthHygienes implements Action {
  readonly type = JobsActionTypes.FetchHealthHygienes;

  constructor(public payload: string) { }
}
export class FetchHealthHygienesSuccess implements Action {
  readonly type = JobsActionTypes.FetchHealthHygienesSuccess;

  constructor(public payload: HealthHygiene[]) { }
}

export type JobsActions =
FetchJobDetails |
FetchJobDetailsSuccess |
FetchAssociatedTasks|
FetchAssociatedTasksSuccess |
FetchJobFlagTree |
FetchJobFlagTreeSuccess |
FetchJobGroupTree |
FetchJobFlagGroupSuccess |
FetchPosturalTolerances |
FetchPosturalTolerancesSuccess |
FetchPosturalToleranceGroups |
FetchPosturalToleranceGroupsSuccess|
FetchFATaskFlagTreeSuccess | 
FetchFATaskFlagTree |
FetchEnvironmentalFactorTree |
FetchEnvironmentalFactorTreeSuccess |
FetchPPETree |
FetchPPETreeSuccess |
FetchHFTree |
FetchHFTreeSuccess |
FetchDeptTree |
FetchDeptTreeSuccess |
FetchHealthHygieneResultsSuccess |
FetchHealthHygieneResults |
FetchHealthHygienes |
FetchHealthHygienesSuccess |
FetchJobsFunctionalAnalysis |
FetchJobsFunctionalAnalysisSuccess;
