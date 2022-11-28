import { MetaReducer } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { AppState } from '../app-store/reducers';
import { Postural } from '../shared/models/postural-tolerance.model';
import { JobFitActions, JobFitActionTypes } from './job-fit.actions';
import * as _ from 'lodash';
import { TaskDetails} from '../shared/models/task.details.model';
import { AssociatedJob } from '../shared/models/associatedjobs.model';
import { CustomerCompanySettings, EPosturalToleranceGroup, FunctionalAnalysis, PosturalToleranceResult } from '../shared/models/functional-analysis.model';
import { GroupsTree } from '../shared/models/groups.models';
import { FlagsTree } from '../shared/models/flags.models';
import { PPETree } from '../shared/models/ppe.model';
import { HumanFactorTree } from '../shared/models/human-factors.model';
import { EnvironmentalTree } from '../shared/models/enviromental.model';
import { DeptTree } from '../shared/models/department.model';
import { Task, NextAssesmentSchedule } from '../shared/models/task.model';
import { HealthHygiene, HealthHygieneResult } from '../shared/models/health-hygeine.model';
import { AuthorisedFunctionList, User } from '../shared/models/user.model';

export interface JobFitAppState extends AppState  {
  // eslint-disable-next-line no-use-before-define
  'jobFitState': JobFitState;
}

export interface JobFitState {
    language?: string;
    sideMenu: MenuItem[];
    userDetails: User
    breadCrumb: any;
    showMenu: boolean;
    posturalAssessment: any;
    taskDetails: TaskDetails;
    associatedJobs: AssociatedJob;
    posturalToleranceGroups: any[];
    materialHandlingGroups: any[];
    gripItems: any[];
    currentFunctionalAnalysis: FunctionalAnalysis;
    groupTree: GroupsTree[],
    flagTree: FlagsTree[],
    ppeTree: PPETree[],
    posturalTolerances: PosturalToleranceResult[],
    humanFactorTree: HumanFactorTree[],
    enviromentalTree: EnvironmentalTree[],
    siteTree: DeptTree[],
    selectedFlagTree:FlagsTree[],
    task: Task;
    healthHygieneResults: HealthHygieneResult[];
    healthHygiene: HealthHygiene[];
    customerSettings: CustomerCompanySettings;
    nextAssessmentSchedule: NextAssesmentSchedule[];
    functionListId: number[];
    selectedTaskOverviewId: number;
}

const initialState: JobFitState = {
    language: '',
    sideMenu: [],
    userDetails: new User(),
    breadCrumb: [],
    showMenu: false,
    posturalAssessment: new Postural(),
    taskDetails: new TaskDetails(),
    associatedJobs: new AssociatedJob(),
    posturalToleranceGroups: [],
    materialHandlingGroups: [],
    currentFunctionalAnalysis: new FunctionalAnalysis(),
    gripItems: [],
    groupTree: [],
    flagTree: [],
    siteTree: [],
    ppeTree: [],
    humanFactorTree: [],
    posturalTolerances:  [],
    enviromentalTree: [],
    selectedFlagTree: [],
    task: new Task(),
    healthHygieneResults: [],
    healthHygiene: [],
    functionListId:[],
    customerSettings: new CustomerCompanySettings(),
    nextAssessmentSchedule: [],
    selectedTaskOverviewId: 0

};

export function jobFitReducers(state = initialState, action: JobFitActions): JobFitState {
  switch (action.type) {
    case JobFitActionTypes.Translate: {
      return {
        ...state,
        language: action.payload,
      };
    }
    case JobFitActionTypes.SetSideMenu: {
      return {
        ...state,
        sideMenu: action.payload,
      };
    }

    case JobFitActionTypes.UpdateMaterialHandling: {
      let currentFunctionalAnalysis = _.cloneDeep(state.currentFunctionalAnalysis);
      let indx = currentFunctionalAnalysis.materialHandlingResults.findIndex((x) => x.materialHandlingItemId === action.payload.materialHandlingItemId && x.materialHandlingFreqId === action.payload.materialHandlingFreqId);
      if(indx > -1){
        currentFunctionalAnalysis.materialHandlingResults[indx] = action.payload;
      } else {
        currentFunctionalAnalysis.materialHandlingResults.push(action.payload);
      }

      return {
        ...state,
        currentFunctionalAnalysis: currentFunctionalAnalysis,
      };
    }
    case JobFitActionTypes.SetBreadCrumb: {
      return {
        ...state,
        breadCrumb: action.payload,
      };
    }
    case JobFitActionTypes.ShowSideMenu: {
      return {
        ...state,
        showMenu: action.payload,
      };
    }
    case JobFitActionTypes.FetchPosturalTolerancesSuccess: {
      return {
        ...state,
        posturalAssessment: action.payload,
      };
    }
    case JobFitActionTypes.FetchFunctionListPermissionsSuccess: {
      var functionList: number[] = [];
      let i = 0;
      var authorisedList = new AuthorisedFunctionList();
      action.payload.securityGroups.forEach(secGroup => {
        action.payload.securityGroups[i].functionSets.forEach(element => {
          authorisedList.Function[element.functionId] = element.allow;
          if(element.allow){
            functionList.push(element.functionId);
          }
        });
        i++;
      });
      localStorage.setItem("authorisedList", JSON.stringify(authorisedList));
      localStorage.setItem("functionList", JSON.stringify(functionList));
      return {
        ...state,
        functionListId: functionList,
        userDetails: action.payload
      };
    }
    case JobFitActionTypes.FetchTaskDetailsSuccess: {
      return {
        ...state,
        taskDetails: action.payload,
      };
    }
    case JobFitActionTypes.FetchPosturalToleranceGroupsSuccess: {
      return {
        ...state,
        posturalToleranceGroups: action.payload,
      };
    }
    case JobFitActionTypes.FetchMaterialHandlingGroupsSuccess: {
      return {
        ...state,
        materialHandlingGroups: action.payload,
      };
    }
    case JobFitActionTypes.FetchCurrentFunctionalAnalysisForTaskSuccess: {
      return {
        ...state,
        currentFunctionalAnalysis: action.payload,
      };
    }
    case JobFitActionTypes.FetchAssociatedJobsSuccess: {
      return {
        ...state,
        associatedJobs: action.payload,
      };
    }
    case JobFitActionTypes.FetchGripItemsSuccess: {
      return {
        ...state,
        gripItems: action.payload,
      };
    }
    case JobFitActionTypes.FetchGroupTreeSuccess: {
      return {
        ...state,
        groupTree: action.payload,
      };
    }
    case JobFitActionTypes.UpdateCurrentFunctionalAnalysis: {
      return {
        ...state,
        currentFunctionalAnalysis: action.payload,
      };
    }

    case JobFitActionTypes.FetchTaskSuccess: {
      return {
        ...state,
        task: action.payload,
      };
    }
    case JobFitActionTypes.FetchFlagTreeSuccess: {
      return {
        ...state,
        flagTree: action.payload ? action.payload : [],
      };
    }
    case JobFitActionTypes.FetchPPETreeSuccess: {
      return {
        ...state,
        ppeTree: action.payload,
      };
    }
    case JobFitActionTypes.FetchHumanFactorTreeSuccess: {
      return {
        ...state,
        humanFactorTree: action.payload,
      };
    }
    case JobFitActionTypes.FetchEnvironmentalFactorTreeSuccess: {
      return {
        ...state,
        enviromentalTree: action.payload,
      };
    }

    case JobFitActionTypes.FetchSiteTreeSuccess: {
      return {
        ...state,
        siteTree: action.payload,
      };
    }
    case JobFitActionTypes.FetchHealthHygieneResultsSuccess: {
      return {
        ...state,
        healthHygieneResults: action.payload,
      };
    }
    case JobFitActionTypes.FetchHealthHygienesSuccess: {
      return {
        ...state,
        healthHygiene: action.payload,
      };
    }
    case JobFitActionTypes.FetchCustomerSettingsSuccess: {
      return {
        ...state,
        customerSettings: action.payload,
      };
    }
    case JobFitActionTypes.SetTaskOverviewId: {
      return {
        ...state,
        selectedTaskOverviewId: action.payload,
      };
    }
    
    case JobFitActionTypes.PosturalTolerancesValueChange: {
      const posturalAssessment:any = _.cloneDeep(state.posturalAssessment);
      let result:any;

      if(action.payload.type === 1) { // if value is back
        result = posturalAssessment.back;
      } else if(action.payload.type === 2){ // shoulder
        result = posturalAssessment.shoulder;
      } else if(action.payload.type === 3){ // hand
        result = posturalAssessment.hand;
      } else if(action.payload.type === 4){ // back again
        result = posturalAssessment.backSecond;
      } else if(action.payload.type === 5){ // neck
        result = posturalAssessment.neck;
      } else if(action.payload.type === 6){ // wrist/hand
        result = posturalAssessment.wristHand;
      } else { // leg/feet
        result = posturalAssessment.legFeet;
      }
      const resultIdx = result.findIndex((item: { id: number; }) => item.id === action.payload.id);

      if(resultIdx > -1){
        const currentResult = result[resultIdx];
        currentResult.value = action.payload.value;
        posturalAssessment.back = result;
      }

      return {
        ...state,
        posturalAssessment: posturalAssessment,
      };
    }
    case JobFitActionTypes.FetchPosturalTolerancesNewResults: {
      let posturalResults:PosturalToleranceResult[] = [];
    //  this.posturalBackTolerancesResult = [];
      state.posturalToleranceGroups[0]?.items.forEach((element: { displayOrder: number; id: number; }) => {
          var pt: PosturalToleranceResult = new PosturalToleranceResult();
          pt.functionalAnalysisId = 0;
          pt.displayOrder = element.displayOrder;
          pt.posturalToleranceItemId= element.id;
          pt.groupId = EPosturalToleranceGroup.Back;
          pt.frequency.char = 'NT';
        //  this.posturalBackTolerancesResult.push(pt);
          posturalResults.push(pt);
      });
    //  this.posturalShoulderTolerancesResult = [];
      state.posturalToleranceGroups[2]?.items.forEach((element: { displayOrder: number; id: number; }) => {
          var pt: PosturalToleranceResult = new PosturalToleranceResult();
          pt.functionalAnalysisId = 0;
          pt.displayOrder = element.displayOrder;
          pt.posturalToleranceItemId= element.id;
          pt.groupId = EPosturalToleranceGroup.Shoulder;
          pt.frequency.char = 'NT'; 
        //  this.posturalShoulderTolerancesResult.push(pt);
          posturalResults.push(pt);
      });
    //  this.posturalHandTolerancesResult = [];
      state.posturalToleranceGroups[4]?.items.forEach((element: { displayOrder: number; id: number; }) => {
          var pt: PosturalToleranceResult = new PosturalToleranceResult();
          pt.functionalAnalysisId = 0;
          pt.displayOrder = element.displayOrder;
          pt.posturalToleranceItemId= element.id;
          pt.groupId = EPosturalToleranceGroup.HandFingers;
          pt.frequency.char = 'NT'; 
        //  this.posturalHandTolerancesResult.push(pt)
          posturalResults.push(pt);
      });
    //  this.posturalNeckTolerancesResult = [];
      state.posturalToleranceGroups[1]?.items.forEach((element: { displayOrder: number; id: number; }) => {
          var pt: PosturalToleranceResult = new PosturalToleranceResult();
          pt.functionalAnalysisId = 0;
          pt.displayOrder = element.displayOrder;
          pt.posturalToleranceItemId= element.id;
          pt.groupId = EPosturalToleranceGroup.Neck;
          pt.frequency.char = 'NT'; 
        //  this.posturalNeckTolerancesResult.push(pt);
          posturalResults.push(pt);
      });
    //  this.posturalWristHandTolerancesResult = [];
      state.posturalToleranceGroups[3]?.items.forEach((element: { displayOrder: number; id: number; }) => {
          var pt: PosturalToleranceResult = new PosturalToleranceResult();
          pt.functionalAnalysisId = 0;
          pt.displayOrder = element.displayOrder;
          pt.posturalToleranceItemId= element.id;
          pt.groupId = EPosturalToleranceGroup.WristHands;
          pt.frequency.char = 'NT'; 
        //  this.posturalWristHandTolerancesResult.push(pt);
          posturalResults.push(pt);
      });
    //  this.posturalLegFeetTolerancesResult = [];
      state.posturalToleranceGroups[5]?.items.forEach((element: { displayOrder: number; id: number; }) => {
          var pt: PosturalToleranceResult = new PosturalToleranceResult();
          pt.functionalAnalysisId = 0;
          pt.displayOrder = element.displayOrder;
          pt.posturalToleranceItemId= element.id;
          pt.groupId = EPosturalToleranceGroup.LegFeet;
          pt.frequency.char = 'NT'; 
        //  this.posturalLegFeetTolerancesResult.push(pt);
          posturalResults.push(pt);
      });
    //  this.posturalGeneralTolerancesResult = [];
      state.posturalToleranceGroups[6]?.items.forEach((element: { displayOrder: number; id: number; }) => {
          var pt: PosturalToleranceResult = new PosturalToleranceResult();
          pt.functionalAnalysisId = 0;
          pt.displayOrder = element.displayOrder;
          pt.posturalToleranceItemId= element.id;
          pt.groupId = EPosturalToleranceGroup.General;
          pt.frequency.char = 'NT'; 
        //  this.posturalGeneralTolerancesResult.push(pt);
          posturalResults.push(pt);
      });
    //  this.onChange.emit(this.posturalResults);
  
      return {
        ...state,
        posturalTolerances: posturalResults,
      };
    }


    default:
      return state;
  }
}

export const metaReducers: MetaReducer<JobFitAppState>[] = !environment.production ? [] : [];


