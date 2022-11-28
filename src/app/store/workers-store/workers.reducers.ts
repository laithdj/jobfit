import { MetaReducer } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { WorkersActions, WorkersActionTypes } from './workers.actions';
import * as _ from 'lodash';

import { AppState } from 'src/app/app.state';
import { AssociatedTask } from 'src/app/shared/models/associatedtasks.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { FunctionalAnalysis } from 'src/app/shared/models/functional-analysis.model';
import { PPETree } from 'src/app/shared/models/ppe.model';
import { HumanFactorTree } from 'src/app/shared/models/human-factors.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { NextAssesmentSchedule, Worker } from 'src/app/shared/models/worker.model';
import { HealthHygiene, HealthHygieneResult } from 'src/app/shared/models/health-hygeine.model';
import { EnvironmentalTree } from 'src/app/shared/models/enviromental.model';

export interface WorkersAppState extends AppState  {
  // eslint-disable-next-line no-use-before-define
  'workersState': WorkersState;
}

export interface WorkersState {
    workerDetails: Worker
    associatedTasks: AssociatedTask;
    workerFlagTree: FlagsTree[];
    workerGroupTree: GroupsTree[];
    posturalToleranceGroups: any[];
    currentFunctionalAnalysis: FunctionalAnalysis;
    faWorkerFlagTree: FlagsTree[];
    ppeTree: PPETree[];
    deptTree:DeptTree[];
    humanFactorTree: HumanFactorTree[],
    workerHealthHygieneResults: HealthHygieneResult[];
    workerHealthHygiene: HealthHygiene[];
    enviromentalTree: EnvironmentalTree[],
    materialHandlingGroups: any[];
    gripItems: any[];
    nextAssessmentSchedule: NextAssesmentSchedule[];
}

const initialState: WorkersState = {
  workerDetails: new Worker(),
  associatedTasks: new AssociatedTask(),
  workerFlagTree: [],
  workerGroupTree: [],
  posturalToleranceGroups: [],
  currentFunctionalAnalysis: new FunctionalAnalysis(),
  faWorkerFlagTree: [],
  ppeTree: [],
  deptTree: [],
  humanFactorTree: [],
  workerHealthHygieneResults: [],
  workerHealthHygiene: [],
  enviromentalTree: [],
  materialHandlingGroups: [],
  gripItems: [],
  nextAssessmentSchedule: [],
};

export function workersReducers(state = initialState, action: WorkersActions): WorkersState {
  switch (action.type) {
    case WorkersActionTypes.FetchGripItemsSuccess: {
      return {
        ...state,
        gripItems: action.payload,
      };
    }
    case WorkersActionTypes.FetchWorkerDetailsSuccess:{
      return {
        ...state,
        workerDetails: action.payload,
      };
    }
    case WorkersActionTypes.FetchWorkerFlagTreeSuccess: {
      return {
        ...state,
        workerFlagTree: action.payload,
      };
    }
    case WorkersActionTypes.FetchFAWorkerFlagTreeSuccess: {
      return {
        ...state,
        faWorkerFlagTree: action.payload,
      };
    }
    case WorkersActionTypes.FetchMaterialHandlingGroupsSuccess: {
      return {
        ...state,
        materialHandlingGroups: action.payload,
      };
    }
    case WorkersActionTypes.FetchWorkerGroupTreeSuccess: {
      return {
        ...state,
        workerGroupTree: action.payload,
      };
    }
    case WorkersActionTypes.FetchWorkerHealthHygieneResultsSuccess: {
      return {
        ...state,
        workerHealthHygieneResults: action.payload,
      };
    }
    case WorkersActionTypes.FetchWorkerHealthHygienesSuccess: {
      return {
        ...state,
        workerHealthHygiene: action.payload,
      };
    }
    case WorkersActionTypes.FetchHumanFactorTreeSuccess: {
      return {
        ...state,
        humanFactorTree: action.payload,
      };
    }
    case WorkersActionTypes.FetchEnvironmentalFactorTreeSuccess: {
      return {
        ...state,
        enviromentalTree: action.payload,
      };
    }
    case WorkersActionTypes.FetchPPETreeSuccess: {
      return {
        ...state,
        ppeTree: action.payload,
      };
    }
    case WorkersActionTypes.FetchPosturalToleranceGroupsSuccess: {
      return {
        ...state,
        posturalToleranceGroups: action.payload,
      };
    }
    case WorkersActionTypes.FetchCurrentFunctionalAnalysisForWorkerSuccess: {
      return {
        ...state,
        currentFunctionalAnalysis: action.payload,
      };
    }
    case WorkersActionTypes.UpdateCurrentFunctionalAnalysis: {
      return {
        ...state,
        currentFunctionalAnalysis: action.payload,
      };
    }

    default:
      return state;
  }
}

export const metaReducers: MetaReducer<WorkersAppState>[] = !environment.production ? [] : [];


