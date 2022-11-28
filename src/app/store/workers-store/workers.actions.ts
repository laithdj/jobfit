/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { Environmental, EnvironmentalTree } from 'src/app/shared/models/enviromental.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { FunctionalAnalysis, PosturalToleranceGroup } from 'src/app/shared/models/functional-analysis.model';
import { GripItemView } from 'src/app/shared/models/grips.model';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { HealthHygiene, HealthHygieneResult } from 'src/app/shared/models/health-hygeine.model';
import { HumanFactorTree } from 'src/app/shared/models/human-factors.model';
import { MaterialHandling, MaterialHandlingGroup } from 'src/app/shared/models/materialHandling.model';
import { Postural } from 'src/app/shared/models/postural-tolerance.model';
import { PPETree } from 'src/app/shared/models/ppe.model';
import { Worker } from 'src/app/shared/models/worker.model';


// eslint-disable-next-line no-shadow
export enum WorkersActionTypes {
  FetchWorkerDetails = 'Fetch Worker Details',
  FetchWorkerDetailsSuccess = 'Fetch Worker Details Success',
  FetchWorkerFlagTree = 'Fetch Worker Flag Tree',
  FetchWorkerFlagTreeSuccess = 'Fetch Worker Flag Tree Success',
  FetchWorkerGroupTree = 'Fetch Worker Group Tree',
  FetchWorkerGroupTreeSuccess = 'Fetch Worker Group Tree Success',
  FetchFAWorkerFlagTree = 'Fetch FAWorker Flag Tree',
  FetchFAWorkerFlagTreeSuccess = 'Fetch FAWorker Flag Tree Success',
  FetchWorkerHealthHygieneResults = 'Fetch Worker Health Hygiene Results',
  FetchWorkerHealthHygieneResultsSuccess = 'Fetch Worker Health Hygiene Results Success',
  FetchWorkerHealthHygienes  = 'Fetch Worker Health Hygiene',
  FetchWorkerHealthHygienesSuccess  = 'Fetch Worker Health Hygiene Success',
  FetchNextAssessmentSchedule = 'Fetch Worker Next Assessment Schedule',
  FetchHumanFactorTree = 'Fetch Worker Human Factor Tree',
  FetchHumanFactorTreeSuccess = 'Fetch Worker Human Factor Tree Success',
  FetchEnvironmentalFactorTree = 'Worker Environmental Factor Tree',
  FetchEnvironmentalFactorTreeSuccess = 'Worker Environmental Factor Tree Success',
  FetchPPETree = 'Fetch Worker PPE Tree',
  FetchPPETreeSuccess = 'Fetch Worker PPE Tree Success',
  FetchPosturalToleranceGroups = 'Fetch Worker Postural Tolerance Groups',
  FetchPosturalToleranceGroupsSuccess = 'Fetch Worker Postural Tolerance Groups Success',
  FetchCurrentFunctionalAnalysisForWorker = 'Fetch Current Functional Analysis For Worker',
  FetchCurrentFunctionalAnalysisForWorkerSuccess= 'Fetch Current Functional Analysis Success For Worker',
  UpdateCurrentFunctionalAnalysis = 'Update Current Functional Analysis',
  FetchPosturalTolerances = 'Fetch Worker Postural Tolerances',
  FetchPosturalTolerancesSuccess = 'Fetch Worker Postural Tolerances Success',
  FetchGripItems = 'Fetch Worker Grip Items',
  FetchGripItemsSuccess = 'Fetch Worker Grip Items Success',
  FetchMaterialHandlingGroups = 'Fetch Worker MaterialHandling Groups',
  FetchMaterialHandlingGroupsSuccess = 'Fetch Worker MaterialHandling Groups Success',
  AddMaterialHandling = "Add Worker Material Handling",
  UpdateMaterialHandling = "Update Worker Material Handling",
}
export class FetchPosturalToleranceGroups implements Action {
  readonly type = WorkersActionTypes.FetchPosturalToleranceGroups;

  constructor() { }
}
export class FetchPosturalToleranceGroupsSuccess implements Action {
  readonly type = WorkersActionTypes.FetchPosturalToleranceGroupsSuccess;

  constructor(public payload: PosturalToleranceGroup[]) { }
}
export class FetchPosturalTolerances implements Action {
  readonly type = WorkersActionTypes.FetchPosturalTolerances;

  constructor(public payload: number) { }
}
export class FetchPosturalTolerancesSuccess implements Action {
  readonly type = WorkersActionTypes.FetchPosturalTolerancesSuccess;

  constructor(public payload: Postural) { }
}
export class FetchWorkerDetails implements Action {
  readonly type = WorkersActionTypes.FetchWorkerDetails;

  constructor(public payload: number) { }
}
export class FetchWorkerDetailsSuccess implements Action {
  readonly type = WorkersActionTypes.FetchWorkerDetailsSuccess;

  constructor(public payload: Worker) { }
}
export class FetchCurrentFunctionalAnalysisForWorker implements Action {
  readonly type = WorkersActionTypes.FetchCurrentFunctionalAnalysisForWorker;

  constructor(public payload : number) { }
}
export class FetchCurrentFunctionalAnalysisForWorkerSuccess implements Action {
  readonly type = WorkersActionTypes.FetchCurrentFunctionalAnalysisForWorkerSuccess;

  constructor(public payload: FunctionalAnalysis) { }
}
export class FetchWorkerFlagTree implements Action {
  readonly type = WorkersActionTypes.FetchWorkerFlagTree;

  constructor() { }
}
export class UpdateCurrentFunctionalAnalysis implements Action {
  readonly type = WorkersActionTypes.UpdateCurrentFunctionalAnalysis;

  constructor(public payload: FunctionalAnalysis) { }
}
export class FetchWorkerFlagTreeSuccess implements Action {
  readonly type = WorkersActionTypes.FetchWorkerFlagTreeSuccess;

  constructor(public payload: FlagsTree[]) { }
}

export class FetchWorkerGroupTree implements Action {
  readonly type = WorkersActionTypes.FetchWorkerGroupTree;

  constructor() { }
}
export class FetchWorkerGroupTreeSuccess implements Action {
  readonly type = WorkersActionTypes.FetchWorkerGroupTreeSuccess;

  constructor(public payload: GroupsTree[]) { }
}
export class FetchFAWorkerFlagTree implements Action {
  readonly type = WorkersActionTypes.FetchFAWorkerFlagTree;

  constructor(public payload: FlagsTree[]) { }
}
export class FetchFAWorkerFlagTreeSuccess implements Action {
  readonly type = WorkersActionTypes.FetchFAWorkerFlagTreeSuccess;

  constructor(public payload: FlagsTree[]) { }
}
export class FetchWorkerHealthHygieneResults implements Action {
  readonly type = WorkersActionTypes.FetchWorkerHealthHygieneResults;

  constructor(public payload: number) { }
}
export class FetchWorkerHealthHygieneResultsSuccess implements Action {
  readonly type = WorkersActionTypes.FetchWorkerHealthHygieneResultsSuccess;

  constructor(public payload: HealthHygieneResult[]) { }
}
export class FetchWorkerHealthHygienes implements Action {
  readonly type = WorkersActionTypes.FetchWorkerHealthHygienes;

  constructor(public payload: string) { }
}
export class FetchWorkerHealthHygienesSuccess implements Action {
  readonly type = WorkersActionTypes.FetchWorkerHealthHygienesSuccess;

  constructor(public payload: HealthHygiene[]) { }
}
export class FetchNextAssessmentSchedule implements Action {
  readonly type = WorkersActionTypes.FetchNextAssessmentSchedule;

  constructor(public payload: HealthHygiene[]) { }
}
export class FetchHumanFactorTree implements Action {
  readonly type = WorkersActionTypes.FetchHumanFactorTree;

  constructor() { }
}
export class FetchHumanFactorTreeSuccess implements Action {
  readonly type = WorkersActionTypes.FetchHumanFactorTreeSuccess;

  constructor(public payload: HumanFactorTree[]) { }
}
export class FetchEnvironmentalFactorTree implements Action {
  readonly type = WorkersActionTypes.FetchEnvironmentalFactorTree;

  constructor(public payload: Environmental[]) { }
}
export class FetchEnvironmentalFactorTreeSuccess implements Action {
  readonly type = WorkersActionTypes.FetchEnvironmentalFactorTreeSuccess;

  constructor(public payload: EnvironmentalTree[]) { }
}
export class FetchPPETree implements Action {
  readonly type = WorkersActionTypes.FetchPPETree;

  constructor() { }
}
export class FetchPPETreeSuccess implements Action {
  readonly type = WorkersActionTypes.FetchPPETreeSuccess;

  constructor(public payload: PPETree[]) { }
}
export class FetchGripItems implements Action {
  readonly type = WorkersActionTypes.FetchGripItems;

  constructor() { }
}
export class FetchGripItemsSuccess implements Action {
  readonly type = WorkersActionTypes.FetchGripItemsSuccess;

  constructor(public payload: GripItemView[]) { }
}
export class FetchMaterialHandlingGroups implements Action {
  readonly type = WorkersActionTypes.FetchMaterialHandlingGroups;

  constructor() { }
}
export class FetchMaterialHandlingGroupsSuccess implements Action {
  readonly type = WorkersActionTypes.FetchMaterialHandlingGroupsSuccess;

  constructor(public payload: MaterialHandlingGroup[]) { }
}
export class AddMaterialHandling implements Action {
  readonly type = WorkersActionTypes.AddMaterialHandling;

  constructor(public payload : MaterialHandling) { }
}
export class UpdateMaterialHandling implements Action {
  readonly type = WorkersActionTypes.UpdateMaterialHandling;

  constructor(public payload : MaterialHandling) { }
}
export type WorkersActions =
FetchMaterialHandlingGroups |
FetchMaterialHandlingGroupsSuccess |
FetchCurrentFunctionalAnalysisForWorker |
FetchCurrentFunctionalAnalysisForWorkerSuccess | 
FetchWorkerDetails |
FetchWorkerDetailsSuccess |
FetchWorkerFlagTree |
FetchWorkerFlagTreeSuccess |
FetchWorkerGroupTree |
FetchWorkerGroupTreeSuccess |
FetchFAWorkerFlagTreeSuccess | 
FetchFAWorkerFlagTree |
FetchWorkerHealthHygieneResultsSuccess |
FetchWorkerHealthHygieneResults |
FetchWorkerHealthHygienes |
FetchWorkerHealthHygienesSuccess |
FetchHumanFactorTree |
FetchHumanFactorTreeSuccess |
FetchEnvironmentalFactorTree |
FetchEnvironmentalFactorTreeSuccess |
FetchPPETree |
FetchPPETreeSuccess |
FetchPosturalToleranceGroups | 
FetchPosturalToleranceGroupsSuccess|
UpdateCurrentFunctionalAnalysis |
FetchGripItems |
FetchGripItemsSuccess |
FetchPosturalTolerances |
FetchPosturalTolerancesSuccess |
UpdateMaterialHandling |
AddMaterialHandling;
