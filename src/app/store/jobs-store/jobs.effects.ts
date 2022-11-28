import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { JobsAppState } from './jobs.reducers';
import { JobsService } from 'src/app/jobs/jobs.service';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import { FetchAssociatedTasks, FetchAssociatedTasksSuccess,FetchDeptTree, FetchDeptTreeSuccess, FetchEnvironmentalFactorTree, FetchEnvironmentalFactorTreeSuccess, FetchFATaskFlagTree, FetchFATaskFlagTreeSuccess, FetchHealthHygieneResults, FetchHealthHygieneResultsSuccess, FetchHealthHygienes, FetchHealthHygienesSuccess, FetchHFTree, FetchHFTreeSuccess, FetchJobDetails, FetchJobDetailsSuccess, FetchJobFlagGroupSuccess, FetchJobFlagTree, FetchJobFlagTreeSuccess, FetchJobGroupTree, FetchJobsFunctionalAnalysis, FetchJobsFunctionalAnalysisSuccess, FetchPosturalToleranceGroups, FetchPosturalToleranceGroupsSuccess, FetchPosturalTolerances, FetchPosturalTolerancesSuccess, FetchPPETree, FetchPPETreeSuccess, JobsActionTypes } from './jobs.actions';
import { AssociatedTask } from 'src/app/shared/models/associatedtasks.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { Postural } from 'src/app/shared/models/postural-tolerance.model';
import { FunctionalAnalysis, PosturalToleranceGroup } from 'src/app/shared/models/functional-analysis.model';
import { EnvironmentalTree } from 'src/app/shared/models/enviromental.model';
import { PPETree } from 'src/app/shared/models/ppe.model';
import { HumanFactorTree } from 'src/app/shared/models/human-factors.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { HealthHygiene, HealthHygieneResult } from 'src/app/shared/models/health-hygeine.model';

@Injectable()
export class JobsEffects {
  constructor(
    private actions$: Actions,
    private jobsService: JobsService,
    private store: Store<JobsAppState>
  ) {}

  fetchJobDetails$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchJobDetails>(JobsActionTypes.FetchJobDetails),
        switchMap((action) =>
          this.jobsService.getJobsDetails(action.payload).pipe(
            map((response: JobsDetails) => {
              return this.store.dispatch(new FetchJobDetailsSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchAssociatedTasks$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchAssociatedTasks>(JobsActionTypes.FetchAssociatedTasks),
        switchMap((action) =>
          this.jobsService.getAssociatedTasksForJob(action.payload.jobId, action.payload.searchCriteria).pipe(
            map((response: AssociatedTask) => {
              return this.store.dispatch(
                new FetchAssociatedTasksSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchJobFlagTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchJobFlagTree>(JobsActionTypes.FetchJobFlagTree),
        switchMap((action) =>
          this.jobsService.getJobsFlagTree().pipe(
            map((response: FlagsTree[]) => {
              return this.store.dispatch(new FetchJobFlagTreeSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchHealthHygieneResults$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchHealthHygieneResults>(JobsActionTypes.FetchHealthHygieneResults),
        switchMap((action) =>
          this.jobsService.getMainHealthHygieneResults(action.payload).pipe(
            map((response: HealthHygieneResult[]) => {
              return this.store.dispatch(new FetchHealthHygieneResultsSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchHealthHygienes$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchHealthHygienes>(JobsActionTypes.FetchHealthHygienes),
        switchMap((action) =>
          this.jobsService.getMainHealthHygiene(action.payload).pipe(
            map((response: HealthHygiene[]) => {
              return this.store.dispatch(new FetchHealthHygienesSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchFATaskFlagTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchFATaskFlagTree>(JobsActionTypes.FetchFATaskFlagTree),
        switchMap((action) =>
          this.jobsService.getFATaskFlagTree().pipe(
            map((response: FlagsTree[]) => {
              return this.store.dispatch(
                new FetchFATaskFlagTreeSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchJobGroupTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchJobGroupTree>(JobsActionTypes.FetchJobGroupTree),
        switchMap((action) =>
          this.jobsService.getJobsGroupTree().pipe(
            map((response: GroupsTree[]) => {
              return this.store.dispatch(
                new FetchJobFlagGroupSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchPosturalGroups$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchPosturalToleranceGroups>(
          JobsActionTypes.FetchPosturalToleranceGroups
        ),
        switchMap((action) =>
          this.jobsService.getPosturalToleranceGroups().pipe(
            map((response: PosturalToleranceGroup[]) => {
              return this.store.dispatch(
                new FetchPosturalToleranceGroupsSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchCurrentFA$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchJobsFunctionalAnalysis>(
          JobsActionTypes.FetchJobsFunctionalAnalysis
        ),
        switchMap((action) =>
          this.jobsService.getJobCurrentFunctionalAnalysis(action.payload).pipe(
            map((response: FunctionalAnalysis) => {
              return this.store.dispatch(
                new FetchJobsFunctionalAnalysisSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchPosturalTolerances$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchPosturalTolerances>(
          JobsActionTypes.FetchPosturalTolerances
        ),
        switchMap((action) =>
          this.jobsService.getPosturalAssessment(1).pipe(
            map((response: Postural) => {
              if (
                response.errorMessage &&
                response.errorMessage.trim().length > 0
              ) {
                return response.errorMessage;
              }
              return this.store.dispatch(
                new FetchPosturalTolerancesSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchEnvironmentalTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchEnvironmentalFactorTree>(
          JobsActionTypes.FetchEnvironmentalFactorTreeSuccess
        ),
        switchMap((action) =>
          this.jobsService.getJobsEnvironmentalFactors(action.payload).pipe(
            map((response: EnvironmentalTree[]) => {
              return this.store.dispatch(
                new FetchEnvironmentalFactorTreeSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchPPETree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchPPETree>(JobsActionTypes.FetchPPETree),
        switchMap((action) =>
          this.jobsService.getJobsPPETree(1).pipe(
            map((response: PPETree[]) => {
              return this.store.dispatch(new FetchPPETreeSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchDeptTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchDeptTree>(JobsActionTypes.FetchDeptTree),
        switchMap((action) =>
          this.jobsService.getDepartmentsTree().pipe(
            map((response: DeptTree[]) => {
              return this.store.dispatch(new FetchDeptTreeSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchHFTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchHFTree>(JobsActionTypes.FetchHFTree),
        switchMap((action) =>
          this.jobsService.getJobsHumanFactorsTree().pipe(
            map((response: HumanFactorTree[]) => {
              return this.store.dispatch(new FetchHFTreeSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
}
