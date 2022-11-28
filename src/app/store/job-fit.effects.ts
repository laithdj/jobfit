import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { FetchAssociatedJobs, FetchAssociatedJobsSuccess, FetchCurrentFunctionalAnalysisForTask, FetchCurrentFunctionalAnalysisForTaskSuccess, FetchCustomerSettings, FetchCustomerSettingsSuccess, FetchEnvironmentalFactorTree, FetchEnvironmentalFactorTreeSuccess, FetchFlagTree, FetchFlagTreeSuccess, FetchFunctionListPermissions, FetchFunctionListPermissionsSuccess, FetchGripItems, FetchGripItemsSuccess, FetchGroupTree, FetchGroupTreeSuccess, FetchHealthHygieneResults, FetchHealthHygieneResultsSuccess, FetchHealthHygienes, FetchHealthHygienesSuccess, FetchHumanFactorTree, FetchHumanFactorTreeSuccess, FetchMaterialHandlingGroups, FetchMaterialHandlingGroupsSuccess, FetchPosturalToleranceGroups, FetchPosturalToleranceGroupsSuccess, FetchPosturalTolerances, FetchPosturalTolerancesSuccess, FetchPPETree, FetchPPETreeSuccess, FetchSiteTree, FetchSiteTreeSuccess, FetchTask, FetchTaskDetails, FetchTaskDetailsSuccess, FetchTaskSuccess, JobFitActionTypes } from './job-fit.actions';
import { TasksService } from '../tasks/tasks-service.service';
import { Postural } from '../shared/models/postural-tolerance.model';
import { JobFitAppState } from './job-fit.reducers';
import { TaskDetails } from '../shared/models/task.details.model';
import { AssociatedJob } from '../shared/models/associatedjobs.model';
import { CustomerCompanySettings, FunctionalAnalysis, PosturalToleranceGroup } from '../shared/models/functional-analysis.model';
import { MaterialHandlingGroup } from '../shared/models/materialHandling.model';
import { GripItemView } from '../shared/models/grips.model';
import { GroupsTree } from '../shared/models/groups.models';
import { FlagsTree } from '../shared/models/flags.models';
import { PPETree } from '../shared/models/ppe.model';
import { HumanFactorTree } from '../shared/models/human-factors.model';
import { EnvironmentalTree } from '../shared/models/enviromental.model';
import { DeptTree } from '../shared/models/department.model';
import { Task } from '../shared/models/task.model';
import { HealthHygiene, HealthHygieneResult } from '../shared/models/health-hygeine.model';
import { User } from '../shared/models/user.model';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class JobFitEffects {
  constructor(private actions$: Actions, private tasksService: TasksService,
    private workersService:WorkersService,
    private store: Store<JobFitAppState>,
    ) { }

    fetchPosturalTolerances$ = createEffect(() =>
    this.actions$.pipe(ofType<FetchPosturalTolerances>(JobFitActionTypes.FetchPosturalTolerances),
    switchMap((action) => this.tasksService.getPosturalAssessment(1)
      .pipe(map((response: Postural) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return response.errorMessage;
        }
        return this.store.dispatch(new FetchPosturalTolerancesSuccess(response));
      })),
    )),
    {
      dispatch: false,
    }
  );

  fetchTaskDetails$ = createEffect(() =>
  this.actions$.pipe(ofType<FetchTaskDetails>(JobFitActionTypes.FetchTaskDetails),
  switchMap((action) => this.tasksService.getTaskDetails(action.payload)
    .pipe(map((response: TaskDetails) => {

      return this.store.dispatch(new FetchTaskDetailsSuccess(response));
    })),
  )),
  {
    dispatch: false,
  }
);
fetchTask$ = createEffect(() =>
this.actions$.pipe(ofType<FetchTask>(JobFitActionTypes.FetchTask),
switchMap((action) => this.tasksService.getTask(action.payload)
  .pipe(map((response: Task) => {
    return this.store.dispatch(new FetchTaskSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
// fetchAssociatedJobs$ = createEffect(() =>
// this.actions$.pipe(ofType<FetchAssociatedJobs>(JobFitActionTypes.FetchAssociatedJobs),
// switchMap((action) => this.tasksService.getAssociatedJobsForTask(action.payload)
//   .pipe(map((response: AssociatedJob) => {

//     return this.store.dispatch(new FetchAssociatedJobsSuccess(response));
//   })),
// )),
// {
//   dispatch: false,
// }
// );

fetchPosturalGroups$ = createEffect(() =>
this.actions$.pipe(ofType<FetchPosturalToleranceGroups>(JobFitActionTypes.FetchPosturalToleranceGroups),
switchMap((action) => this.tasksService.getPosturalToleranceGroups()
  .pipe(map((response: PosturalToleranceGroup[]) => {

    return this.store.dispatch(new FetchPosturalToleranceGroupsSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchMaterialGroups$ = createEffect(() =>
this.actions$.pipe(ofType<FetchMaterialHandlingGroups>(JobFitActionTypes.FetchMaterialHandlingGroups),
switchMap((action) => this.tasksService.getMaterialHandlingGroups()
  .pipe(map((response: MaterialHandlingGroup[]) => {

    return this.store.dispatch(new FetchMaterialHandlingGroupsSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchGripItems$ = createEffect(() =>
this.actions$.pipe(ofType<FetchGripItems>(JobFitActionTypes.FetchGripItems),
switchMap((action) => this.tasksService.getGripItems()
  .pipe(map((response: GripItemView[]) => {

    return this.store.dispatch(new FetchGripItemsSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchCurrentFA$ = createEffect(() =>
this.actions$.pipe(ofType<FetchCurrentFunctionalAnalysisForTask>(JobFitActionTypes.FetchCurrentFunctionalAnalysisForTask),
switchMap((action) => this.tasksService.getCurrentFunctionalAnalysis(action.payload)
  .pipe(map((response: FunctionalAnalysis) => {

    return this.store.dispatch(new FetchCurrentFunctionalAnalysisForTaskSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchGroupTree$ = createEffect(() =>
this.actions$.pipe(ofType<FetchGroupTree>(JobFitActionTypes.FetchGroupTree),
switchMap((action) => this.tasksService.getGroupsTree()
  .pipe(map((response: GroupsTree[]) => {

    return this.store.dispatch(new FetchGroupTreeSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchFlagTree$ = createEffect(() =>
this.actions$.pipe(ofType<FetchFlagTree>(JobFitActionTypes.FetchFlagTree),
switchMap((action) => this.tasksService.getFlagsTree()
  .pipe(map((response: FlagsTree[]) => {

    return this.store.dispatch(new FetchFlagTreeSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchPPETree$ = createEffect(() =>
this.actions$.pipe(ofType<FetchPPETree>(JobFitActionTypes.FetchPPETree),
switchMap((action) => this.tasksService.getPPETree()
  .pipe(map((response: PPETree[]) => {

    return this.store.dispatch(new FetchPPETreeSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchHumanFactorTree$ = createEffect(() =>
this.actions$.pipe(ofType<FetchHumanFactorTree>(JobFitActionTypes.FetchHumanFactorTree),
switchMap((action) => this.tasksService.getHumanFactorTree()
  .pipe(map((response: HumanFactorTree[]) => {

    return this.store.dispatch(new FetchHumanFactorTreeSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchCustomerSettings$ = createEffect(() =>
this.actions$.pipe(ofType<FetchCustomerSettings>(JobFitActionTypes.FetchCustomerSettings),
switchMap((action) => this.tasksService.getCustomerSettings()
  .pipe(map((response: CustomerCompanySettings) => {

    return this.store.dispatch(new FetchCustomerSettingsSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchFunctionListForUser$ = createEffect(() =>
this.actions$.pipe(ofType<FetchFunctionListPermissions>(JobFitActionTypes.FetchFunctionListPermissions),
switchMap((action) => this.tasksService.getUserDetails()
  .pipe(map((response: User) => {
    return this.store.dispatch(new FetchFunctionListPermissionsSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchEnviromentalTree$ = createEffect(() =>
this.actions$.pipe(ofType<FetchEnvironmentalFactorTree>(JobFitActionTypes.FetchEnvironmentalFactorTree),
switchMap((action) => this.workersService.getEnviromentalTree()
  .pipe(map((response: EnvironmentalTree[]) => {

    return this.store.dispatch(new FetchEnvironmentalFactorTreeSuccess(response));
  })),
)),
{
  dispatch: false,
}
);
fetchSiteTree$ = createEffect(() =>
      this.actions$.pipe(ofType<FetchSiteTree>(JobFitActionTypes.FetchSiteTree),
      switchMap((action) => this.tasksService.getSitesTree(action.payload)
        .pipe(map((response: DeptTree[]) => {

          return this.store.dispatch(new FetchSiteTreeSuccess(response));
        })),
      )),
      {
        dispatch: false,
      }
      );
  fetchHealthHygieneResults$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType<FetchHealthHygieneResults>(JobFitActionTypes.FetchHealthHygieneResults),
          switchMap((action) =>
            this.tasksService.getMainHealthHygieneResults(action.payload).pipe(
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
          ofType<FetchHealthHygienes>(JobFitActionTypes.FetchHealthHygienes),
          switchMap((action) =>
            this.tasksService.getMainHealthHygieneByType("Tasks").pipe(
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
}
