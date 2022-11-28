import {
    createFeatureSelector,
    createSelector,
  } from '@ngrx/store';
  import { JobsAppState, JobsState } from './jobs.reducers';

  export const selectJobsFeatureState = createFeatureSelector<JobsState>('jobsState');
 //export const selectJobFitFeatureState = (state: JobFitState) => state;
  export const jobsState = createSelector(
    selectJobsFeatureState,
    (appState) => appState,
  );
  export const selectJobsPPETree = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.ppeTree,
  );
  export const selectDeptTree = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.deptTree,
  );
  export const selectJobsHFTree = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.hfTree,
  );
  export const selectJobDetails = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.jobsDetails,
  );
  export const selectAssociatedTasks = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.associatedTasks,
  );
  export const selectJobFlagTree = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.jobFlagTree,
  );
  export const selectJobGroupTree = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.jobGroupTree,
  );
  export const selectHealthHygienes = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.healthHygiene,
  );
  export const selectHealthHygieneResults = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.healthHygieneResults,
  );
  
  export const selectPosturalBackAssessment = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups[0]?.items,
  );
  export const selectPosturalShoulderAssessment = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups[2]?.items,
  );
  export const selectPosturalHandAssessment = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups[4]?.items,
  );
  export const selectPosturalBackSecondAssessment = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups[6]?.items,
  );
  export const selectJobsFunctionalAnalysis = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.jobsFunctionalAnalysis,
  );
  export const selectFATaskFlagTree = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.faTaskFlagTree,
  );
  export const selectPosturalNeckAssessment = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups[1]?.items,
  );
  export const selectPosturalToleranceGroups = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups,
  );
  export const selectPosturalWristHandAssessment = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups[3]?.items,
  );
  export const selectPosturalLegFeetAssessment = createSelector(
    selectJobsFeatureState,
    (appState) => appState?.posturalToleranceGroups[5]?.items,
  );