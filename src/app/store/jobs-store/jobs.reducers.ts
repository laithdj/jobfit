import { MetaReducer } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { JobsActions, JobsActionTypes } from './jobs.actions';
import * as _ from 'lodash';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import { AppState } from 'src/app/app.state';
import { AssociatedTask } from 'src/app/shared/models/associatedtasks.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { FunctionalAnalysis } from 'src/app/shared/models/functional-analysis.model';
import { PPETree } from 'src/app/shared/models/ppe.model';
import { HumanFactorTree } from 'src/app/shared/models/human-factors.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { HealthHygiene, HealthHygieneResult } from 'src/app/shared/models/health-hygeine.model';

export interface JobsAppState extends AppState  {
  // eslint-disable-next-line no-use-before-define
  'jobsState': JobsState;
}

export interface JobsState {
    jobsDetails: JobsDetails;
    associatedTasks: AssociatedTask;
    jobFlagTree: FlagsTree[];
    jobGroupTree: GroupsTree[];
    posturalToleranceGroups: any[];
    jobsFunctionalAnalysis: FunctionalAnalysis;
    faTaskFlagTree: FlagsTree[];
    ppeTree: PPETree[];
    deptTree:DeptTree[];
    hfTree: HumanFactorTree[];
    healthHygieneResults: HealthHygieneResult[];
    healthHygiene: HealthHygiene[];

}

const initialState: JobsState = {
  jobsDetails: new JobsDetails(),
  associatedTasks: new AssociatedTask(),
  jobFlagTree: [],
  jobGroupTree: [],
  posturalToleranceGroups: [],
  jobsFunctionalAnalysis: new FunctionalAnalysis(),
  faTaskFlagTree: [],
  ppeTree: [],
  deptTree: [],
  hfTree: [],
  healthHygieneResults: [],
  healthHygiene: []
};

export function jobsReducers(state = initialState, action: JobsActions): JobsState {
  switch (action.type) {
    case JobsActionTypes.FetchHFTreeSuccess: {
      return {
        ...state,
        hfTree: action.payload,
      };
    }
    case JobsActionTypes.FetchPPETreeSuccess: {
      return {
        ...state,
        ppeTree: action.payload,
      };
    }
    case JobsActionTypes.FetchDeptTreeSuccess: {
      return {
        ...state,
        deptTree: action.payload,
      };
    }
    case JobsActionTypes.FetchJobDetailsSuccess: {
      return {
        ...state,
        jobsDetails: action.payload,
      };
    }
    case JobsActionTypes.FetchAssociatedTasksSuccess: {
      return {
        ...state,
        associatedTasks: action.payload,
      };
    }
    case JobsActionTypes.FetchHealthHygieneResultsSuccess: {
      return {
        ...state,
        healthHygieneResults: action.payload,
      };
    }
    case JobsActionTypes.FetchHealthHygienesSuccess: {
      return {
        ...state,
        healthHygiene: action.payload,
      };
    }
    case JobsActionTypes.FetchPosturalToleranceGroupsSuccess: {
      return {
        ...state,
        posturalToleranceGroups: action.payload,
      };
    }
    case JobsActionTypes.FetchJobsFunctionalAnalysisSuccess: {
      return {
        ...state,
        jobsFunctionalAnalysis: action.payload,
      };
    }
    case JobsActionTypes.FetchJobFlagTreeSuccess: {
      return {
        ...state,
        jobFlagTree: action.payload,
      };
    }
    case JobsActionTypes.FetchFATaskFlagTreeSuccess: {
      return {
        ...state,
        faTaskFlagTree: action.payload,
      };
    }
    case JobsActionTypes.FetchJobGroupTreeSuccess: {
      return {
        ...state,
        jobGroupTree: action.payload,
      };
    }
    default:
      return state;
  }
}

export const metaReducers: MetaReducer<JobsAppState>[] = !environment.production ? [] : [];


