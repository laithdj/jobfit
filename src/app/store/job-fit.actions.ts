/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { AssociatedJob } from '../shared/models/associatedjobs.model';
import { DeptTree } from '../shared/models/department.model';
import { Environmental, EnvironmentalTree } from '../shared/models/enviromental.model';
import { FlagsTree } from '../shared/models/flags.models';
import { CustomerCompanySettings, FunctionalAnalysis, PosturalToleranceGroup } from '../shared/models/functional-analysis.model';
import { GripItemView } from '../shared/models/grips.model';
import { GroupsTree } from '../shared/models/groups.models';
import { HealthHygiene, HealthHygieneResult } from '../shared/models/health-hygeine.model';
import { HumanFactor, HumanFactorTree } from '../shared/models/human-factors.model';
import { MaterialHandling, MaterialHandlingGroup } from '../shared/models/materialHandling.model';
import { Postural } from '../shared/models/postural-tolerance.model';
import { PPE, PPETree } from '../shared/models/ppe.model';
import { SiteTree } from '../shared/models/sites.model';
import { TaskDetails } from '../shared/models/task.details.model';
import { Task } from '../shared/models/task.model';
import { User } from '../shared/models/user.model';

// eslint-disable-next-line no-shadow

export enum JobFitActionTypes {
  Translate = 'Translate',
  TranslateSuccess = 'Translate Success',
  SetSideMenu = 'Set Side Menu Success',
  SetBreadCrumb = 'Set Bread Crumb Success',
  ShowSideMenu = 'Show Side Menu Success',
  FetchPosturalTolerances = 'Fetch Postural Tolerances',
  FetchPosturalTolerancesSuccess = 'Fetch Postural Tolerances Success',
  PosturalTolerancesValueChange = 'PosturalBackTolerancesValueChange',
  FetchTaskDetails = 'Fetch Task Details',
  FetchTaskDetailsSuccess = 'Fetch Task Details Success',
  FetchTask = 'Fetch Task',
  FetchTaskSuccess = 'Fetch Task Success',
  FetchNextAssessmentSchedule = 'Fetch Task Next Assessment Schedule',
  FetchAssociatedJobs = 'Fetch Associated Jobs',
  FetchAssociatedJobsSuccess = 'Fetch Associated Jobs Success',
  FetchPosturalToleranceGroups = 'Fetch Postural Tolerance Groups',
  FetchPosturalToleranceGroupsSuccess = 'Fetch Postural Tolerance Groups Success',
  FetchCurrentFunctionalAnalysisForTask = 'Fetch Current Functional Analysis For Task',
  FetchCurrentFunctionalAnalysisForTaskSuccess = 'Fetch Current Functional Analysis Success For Task',
  FetchMaterialHandlingGroups = 'Fetch MaterialHandling Groups',
  FetchMaterialHandlingGroupsSuccess = 'Fetch MaterialHandling Groups Success',
  FetchGripItems = 'Fetch Grip Items',
  FetchGripItemsSuccess = 'Fetch Grip Items Success',
  FetchGroupTree = 'Fetch Group Tree',
  AddMaterialHandling = "Add Material Handling",
  UpdateMaterialHandling = "Update Material Handling",
  FetchGroupTreeSuccess = 'Fetch Group Tree Success',
  FetchFlagTree = 'Fetch Flag Tree',
  FetchFlagTreeSuccess = 'Fetch Flag Tree Success',
  FetchSiteTree = 'Fetch Site Tree',
  FetchSiteTreeSuccess = 'Fetch Site Tree Success',
  FetchPPETree = 'Fetch PPE Tree',
  FetchPPETreeSuccess = 'Fetch PPE Tree Success',
  FetchHumanFactorTree = 'Fetch Human Factor Tree',
  FetchHumanFactorTreeSuccess = 'Fetch Human Factor Tree Success',
  FetchEnvironmentalFactorTree = 'Environmental Factor Tree',
  FetchEnvironmentalFactorTreeSuccess = 'Environmental Factor Tree Success',
  FetchSelectedFlagTree = 'Fetch Selected Flag Tree',
  FetchSelectedFlagTreeSuccess = 'Fetch Selected Flag Tree Success',
  UpdateCurrentFunctionalAnalysis = 'Update Current Functional Analysis',
  FetchHealthHygieneResults = 'Fetch Health Hygiene Results',
  FetchHealthHygieneResultsSuccess = 'Fetch Health Hygiene Results Success',
  FetchHealthHygienes = 'Fetch Health Hygiene',
  FetchHealthHygienesSuccess = 'Fetch Health Hygiene Success',
  FetchCustomerSettings = 'Fetch Customer Settings',
  FetchCustomerSettingsSuccess = 'Fetch Customer Settings Success',
  FetchFunctionListPermissions = 'Fetch Function List Permissions',
  FetchFunctionListPermissionsSuccess = 'Fetch Function List Permissions Success',
  FetchPosturalTolerancesNewResults = "Fetch Postural Tolerances NewResults",
  SetTaskOverviewId = "Set Task Overview Id"
}

export class Translate implements Action {
  readonly type = JobFitActionTypes.Translate;

  constructor(public payload: string) { }
}
export class SetSideMenu implements Action {
  readonly type = JobFitActionTypes.SetSideMenu;

  constructor(public payload: MenuItem[]) { }
}
export class SetBreadCrumb implements Action {
  readonly type = JobFitActionTypes.SetBreadCrumb;

  constructor(public payload: MenuItem[]) { }
}
export class ShowSideMenu implements Action {
  readonly type = JobFitActionTypes.ShowSideMenu;

  constructor(public payload: boolean) { }
}
export class SetTaskOverviewId implements Action {
  readonly type = JobFitActionTypes.SetTaskOverviewId;

  constructor(public payload: number) { }
}
export class TranslateSuccess implements Action {
  readonly type = JobFitActionTypes.TranslateSuccess;

  constructor() { }
}
export class FetchPosturalTolerances implements Action {
  readonly type = JobFitActionTypes.FetchPosturalTolerances;

  constructor(public payload: number) { }
}
export class FetchPosturalTolerancesSuccess implements Action {
  readonly type = JobFitActionTypes.FetchPosturalTolerancesSuccess;

  constructor(public payload: Postural) { }
}
export class PosturalTolerancesValueChange implements Action {
  readonly type = JobFitActionTypes.PosturalTolerancesValueChange;

  constructor(public payload: {id: number , value:string , type: number}) { }
}
export class FetchTaskDetails implements Action {
  readonly type = JobFitActionTypes.FetchTaskDetails;

  constructor(public payload: number) { }
}
export class FetchTaskDetailsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchTaskDetailsSuccess;

  constructor(public payload: TaskDetails) { }
}
export class FetchAssociatedJobs implements Action {
  readonly type = JobFitActionTypes.FetchAssociatedJobs;

  constructor(public payload: number) { }
}
export class FetchAssociatedJobsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchAssociatedJobsSuccess;

  constructor(public payload: AssociatedJob) { }
}
export class FetchPosturalToleranceGroups implements Action {
  readonly type = JobFitActionTypes.FetchPosturalToleranceGroups;

  constructor() { }
}
export class UpdateCurrentFunctionalAnalysis implements Action {
  readonly type = JobFitActionTypes.UpdateCurrentFunctionalAnalysis;

  constructor(public payload: FunctionalAnalysis) { }
}

export class FetchPosturalToleranceGroupsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchPosturalToleranceGroupsSuccess;

  constructor(public payload: PosturalToleranceGroup[]) { }
}
export class FetchCurrentFunctionalAnalysisForTask implements Action {
  readonly type = JobFitActionTypes.FetchCurrentFunctionalAnalysisForTask;

  constructor(public payload : number) { }
}
export class FetchCurrentFunctionalAnalysisForTaskSuccess implements Action {
  readonly type = JobFitActionTypes.FetchCurrentFunctionalAnalysisForTaskSuccess;

  constructor(public payload: FunctionalAnalysis) { }
}
export class FetchMaterialHandlingGroups implements Action {
  readonly type = JobFitActionTypes.FetchMaterialHandlingGroups;

  constructor() { }
}
export class AddMaterialHandling implements Action {
  readonly type = JobFitActionTypes.AddMaterialHandling;

  constructor(public payload : MaterialHandling) { }
}
export class UpdateMaterialHandling implements Action {
  readonly type = JobFitActionTypes.UpdateMaterialHandling;

  constructor(public payload : MaterialHandling) { }
}
export class FetchMaterialHandlingGroupsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchMaterialHandlingGroupsSuccess;

  constructor(public payload: MaterialHandlingGroup[]) { }
}
export class FetchGripItems implements Action {
  readonly type = JobFitActionTypes.FetchGripItems;

  constructor() { }
}
export class FetchGripItemsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchGripItemsSuccess;

  constructor(public payload: GripItemView[]) { }
}
export class FetchGroupTree implements Action {
  readonly type = JobFitActionTypes.FetchGroupTree;

  constructor() { }
}
export class FetchGroupTreeSuccess implements Action {
  readonly type = JobFitActionTypes.FetchGroupTreeSuccess;

  constructor(public payload: GroupsTree[]) { }
}
export class FetchFlagTree implements Action {
  readonly type = JobFitActionTypes.FetchFlagTree;

  constructor() { }
}
export class FetchFlagTreeSuccess implements Action {
  readonly type = JobFitActionTypes.FetchFlagTreeSuccess;

  constructor(public payload: FlagsTree[]) { }
}
export class FetchPPETree implements Action {
  readonly type = JobFitActionTypes.FetchPPETree;

  constructor(public payload: PPE[]) { }
}
export class FetchPPETreeSuccess implements Action {
  readonly type = JobFitActionTypes.FetchPPETreeSuccess;

  constructor(public payload: PPETree[]) { }
}
export class FetchHumanFactorTree implements Action {
  readonly type = JobFitActionTypes.FetchHumanFactorTree;

  constructor(public payload: HumanFactor[]) { }
}
export class FetchHumanFactorTreeSuccess implements Action {
  readonly type = JobFitActionTypes.FetchHumanFactorTreeSuccess;

  constructor(public payload: HumanFactorTree[]) { }
}
export class FetchEnvironmentalFactorTree implements Action {
  readonly type = JobFitActionTypes.FetchEnvironmentalFactorTree;

  constructor(public payload: Environmental[]) { }
}
export class FetchEnvironmentalFactorTreeSuccess implements Action {
  readonly type = JobFitActionTypes.FetchEnvironmentalFactorTreeSuccess;

  constructor(public payload: EnvironmentalTree[]) { }
}
export class FetchSiteTree implements Action {
  readonly type = JobFitActionTypes.FetchSiteTree;

  constructor(public payload: SiteTree[]) { }
}
export class FetchSiteTreeSuccess implements Action {
  readonly type = JobFitActionTypes.FetchSiteTreeSuccess;

  constructor(public payload: DeptTree[]) { }
}
export class FetchSelectedFlagTree implements Action {
  readonly type = JobFitActionTypes.FetchSelectedFlagTree;

  constructor() { }
}
export class FetchSelectedFlagTreeSuccess implements Action {
  readonly type = JobFitActionTypes.FetchSelectedFlagTreeSuccess;

  constructor(public payload: FlagsTree[]) { }
}
export class FetchTask implements Action {
  readonly type = JobFitActionTypes.FetchTask;

  constructor(public payload: number) { }
}
export class FetchTaskSuccess implements Action {
  readonly type = JobFitActionTypes.FetchTaskSuccess;

  constructor(public payload: Task) { }
}
export class FetchHealthHygieneResults implements Action {
  readonly type = JobFitActionTypes.FetchHealthHygieneResults;

  constructor(public payload: number) { }
}
export class FetchHealthHygieneResultsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchHealthHygieneResultsSuccess;

  constructor(public payload: HealthHygieneResult[]) { }
}
export class FetchHealthHygienes implements Action {
  readonly type = JobFitActionTypes.FetchHealthHygienes;

  constructor(public payload: string) { }
}
export class FetchHealthHygienesSuccess implements Action {
  readonly type = JobFitActionTypes.FetchHealthHygienesSuccess;

  constructor(public payload: HealthHygiene[]) { }
}
export class FetchCustomerSettings implements Action {
  readonly type = JobFitActionTypes.FetchCustomerSettings;

  constructor() { }
}
export class FetchCustomerSettingsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchCustomerSettingsSuccess;

  constructor(public payload: CustomerCompanySettings) { }
}

export class FetchFunctionListPermissions implements Action {
  readonly type = JobFitActionTypes.FetchFunctionListPermissions;

  constructor() { }
}
export class FetchFunctionListPermissionsSuccess implements Action {
  readonly type = JobFitActionTypes.FetchFunctionListPermissionsSuccess;

  constructor(public payload: User) { }
}
export class FetchPosturalTolerancesNewResults implements Action {
  readonly type = JobFitActionTypes.FetchPosturalTolerancesNewResults;

  constructor() { }
}


export type JobFitActions =
Translate |
TranslateSuccess |
SetSideMenu |
ShowSideMenu | 
FetchPosturalTolerances |
FetchPosturalTolerancesSuccess|
PosturalTolerancesValueChange |
FetchTaskDetails |
FetchTaskDetailsSuccess |
FetchAssociatedJobs |
FetchAssociatedJobsSuccess |
FetchPosturalToleranceGroups | 
FetchPosturalToleranceGroupsSuccess|
FetchCurrentFunctionalAnalysisForTask |
FetchCurrentFunctionalAnalysisForTaskSuccess | 
FetchMaterialHandlingGroups |
FetchMaterialHandlingGroupsSuccess |
FetchGripItems |
FetchGripItemsSuccess |
FetchGroupTree |
FetchGroupTreeSuccess|
FetchFlagTree|
FetchFlagTreeSuccess |
FetchSiteTree|
FetchSiteTreeSuccess |
FetchPPETree |
FetchPPETreeSuccess |
FetchHumanFactorTree |
FetchHumanFactorTreeSuccess |
AddMaterialHandling |
FetchEnvironmentalFactorTree |
FetchEnvironmentalFactorTreeSuccess |
FetchSelectedFlagTree |
UpdateMaterialHandling |
FetchSelectedFlagTreeSuccess |
SetBreadCrumb |
FetchTaskSuccess |
FetchTask |
UpdateCurrentFunctionalAnalysis |
FetchHealthHygieneResults |
FetchHealthHygieneResultsSuccess |
FetchHealthHygienes |
FetchHealthHygienesSuccess |
FetchCustomerSettings |
FetchCustomerSettingsSuccess |
FetchFunctionListPermissions |
FetchFunctionListPermissionsSuccess |
FetchPosturalTolerancesNewResults | 
SetTaskOverviewId


