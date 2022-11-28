import {
    createFeatureSelector,
    createSelector,
  } from '@ngrx/store';
  import { JobFitAppState, JobFitState } from './job-fit.reducers';
  
  export const selectJobFitFeatureState = createFeatureSelector<JobFitState>('jobFitState');
 //export const selectJobFitFeatureState = (state: JobFitState) => state;

  export const jobFitState = createSelector(
    selectJobFitFeatureState,
    (appState) => appState,
  );
  export const selectLanguage = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.language,
  );
  export const selectFunctionList = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.functionListId,
  );
  export const selectUserDetails = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.userDetails,
  );
  export const selectSideMenu = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.sideMenu,
  );
  export const selectCustomerSettings = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.customerSettings,
  );
  export const selectHealthHygienes = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.healthHygiene,
  );
  export const selectHealthHygieneResults = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.healthHygieneResults,
  );
  export const selectBreadCrumb = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.breadCrumb,
  );
  export const selectShowSideMenu = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.showMenu,
  );
  export const selectNewPosturalResults = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalTolerances,
  );
  export const selectPosturalBackAssessment = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups[0]?.items,
  );
  export const selectPosturalShoulderAssessment = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups[2]?.items,
  );
  export const selectPosturalHandAssessment = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups[4]?.items,
  );
  export const selectTaskOverviewId = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.selectedTaskOverviewId,
  );
  export const selectPosturalBackSecondAssessment = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups[6]?.items,
  );
  export const selectPosturalNeckAssessment = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups[1]?.items,
  );
  export const selectPosturalWristHandAssessment = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups[3]?.items,
  );
  export const selectPosturalLegFeetAssessment = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups[5]?.items,
  );
  export const selectTaskDetails = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.taskDetails,
  );
  export const selectAssociatedJobs = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.associatedJobs,
  );
  export const selectPosturalToleranceGroups = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.posturalToleranceGroups,
  );
  export const selectGripItems = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.gripItems,
  );
  export const selectCurrentFunctionalAnalysis = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.currentFunctionalAnalysis,
  );
  export const selectMaterialHandlingGroups = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.materialHandlingGroups,
  );
  export const selectGroupTree = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.groupTree,
  );
  export const selectFlagTree = createSelector(
    selectJobFitFeatureState,
    (appState) => {
      let item: any = [];
      if(!appState.flagTree){
        return item;
      } else {
        return appState.flagTree;
      }
    }
  );
  export const selectSelectedFlagTree = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.selectedFlagTree,
  );
  export const selectPPETree = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.ppeTree,
  );
  export const selectHumanFactorTree = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.humanFactorTree,
  );
  export const selectEnviromentalTree = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.enviromentalTree,
  );
  export const selectSiteTree = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.siteTree,
  );
  export const selectTask = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.task,
  );
  export const selectNextAssessmentSchedule = createSelector(
    selectJobFitFeatureState,
    (appState) => appState?.nextAssessmentSchedule,
  );