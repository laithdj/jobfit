import {
    createFeatureSelector,
    createSelector,
  } from '@ngrx/store';
  import { WorkersState } from './workers.reducers';

  export const selectWorkersFeatureState = createFeatureSelector<WorkersState>('workersState');
 //export const selectWorkerFitFeatureState = (state: WorkerFitState) => state;
  export const workersState = createSelector(
    selectWorkersFeatureState,
    (appState) => appState,
  );
  export const selectWorkersPPETree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.ppeTree,
  );
  export const selectDeptTree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.deptTree,
  );
  export const selectHumanFactorTree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.humanFactorTree,
  );
  export const selectWorkerDetails = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.workerDetails,
  )
  export const selectAssociatedTasks = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.associatedTasks,
  );
  export const selectWorkerFlagTree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.workerFlagTree,
  );
  export const selectWorkerGroupTree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.workerGroupTree,
  );
  
  export const selectPosturalBackAssessment = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups[0]?.items,
  );
  export const selectPosturalShoulderAssessment = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups[2]?.items,
  );
  export const selectPosturalHandAssessment = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups[4]?.items,
  );
  export const selectPosturalBackSecondAssessment = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups[6]?.items,
  );
  export const selectCurrentFunctionalAnalysis = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.currentFunctionalAnalysis,
  );
  export const selectFAWorkerFlagTree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.faWorkerFlagTree,
  );
  export const selectPosturalNeckAssessment = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups[1]?.items,
  );
  export const selectPosturalToleranceGroups = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups,
  );
  export const selectPosturalWristHandAssessment = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups[3]?.items,
  );
  export const selectPosturalLegFeetAssessment = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.posturalToleranceGroups[5]?.items,
  );
  export const selectWorkerHealthHygienes = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.workerHealthHygiene,
  );
  export const selectWorkerHealthHygieneResults = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.workerHealthHygieneResults,
  );
  export const selectNextAssessmentSchedule = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.nextAssessmentSchedule,
  );
  export const selectEnviromentalTree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.enviromentalTree,
  );
  export const selectPPETree = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.ppeTree,
  );
  export const selectMaterialHandlingGroups = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.materialHandlingGroups,
  );
  export const selectGripItems = createSelector(
    selectWorkersFeatureState,
    (appState) => appState?.gripItems,
  );