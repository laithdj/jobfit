import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { FetchCurrentFunctionalAnalysisForWorker, FetchCurrentFunctionalAnalysisForWorkerSuccess, FetchEnvironmentalFactorTree,  FetchEnvironmentalFactorTreeSuccess,  FetchFAWorkerFlagTree,  FetchFAWorkerFlagTreeSuccess,  FetchGripItems,  FetchGripItemsSuccess, FetchHumanFactorTree,  FetchHumanFactorTreeSuccess,  FetchMaterialHandlingGroups,  FetchMaterialHandlingGroupsSuccess,  FetchPosturalToleranceGroups,  FetchPosturalToleranceGroupsSuccess,  FetchPosturalTolerances,  FetchPosturalTolerancesSuccess,  FetchPPETree,  FetchPPETreeSuccess,  FetchWorkerDetails, FetchWorkerDetailsSuccess, FetchWorkerFlagTree, FetchWorkerFlagTreeSuccess, FetchWorkerGroupTree, FetchWorkerGroupTreeSuccess, FetchWorkerHealthHygieneResults, FetchWorkerHealthHygieneResultsSuccess, FetchWorkerHealthHygienes, FetchWorkerHealthHygienesSuccess, WorkersActionTypes } from './workers.actions';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { FunctionalAnalysis, PosturalToleranceGroup } from 'src/app/shared/models/functional-analysis.model';
import { WorkersService } from 'src/app/workers/workers.service';
import { WorkersAppState } from './workers.reducers';
import { HealthHygiene, HealthHygieneResult } from 'src/app/shared/models/health-hygeine.model';
import { HumanFactorTree } from 'src/app/shared/models/human-factors.model';
import { EnvironmentalTree } from 'src/app/shared/models/enviromental.model';
import { PPETree } from 'src/app/shared/models/ppe.model';
import { MaterialHandlingGroup } from 'src/app/shared/models/materialHandling.model';
import { GripItemView } from 'src/app/shared/models/grips.model';
import { Postural } from 'src/app/shared/models/postural-tolerance.model';

@Injectable()
export class WorkersEffects {
  constructor(
    private actions$: Actions,
    private workersService: WorkersService,
    private store: Store<WorkersAppState>
  ) {}

  fetchWorkerDetails$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchWorkerDetails>(WorkersActionTypes.FetchWorkerDetails),
        switchMap((action) =>
          this.workersService.getWorkerDetails(action.payload).pipe(
            map((response) => {
              return this.store.dispatch(new FetchWorkerDetailsSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchWorkerFlagTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchWorkerFlagTree>(WorkersActionTypes.FetchWorkerFlagTree),
        switchMap((action) =>
          this.workersService.getWorkersFlagTree().pipe(
            map((response: FlagsTree[]) => {
              return this.store.dispatch(new FetchWorkerFlagTreeSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchFAWorkerFlagTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchFAWorkerFlagTree>(WorkersActionTypes.FetchFAWorkerFlagTree),
        switchMap((action) =>
          this.workersService.getFAWorkerFlagTree().pipe(
            map((response: FlagsTree[]) => {
              return this.store.dispatch(
                new FetchFAWorkerFlagTreeSuccess(response)
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
          WorkersActionTypes.FetchPosturalTolerances
        ),
        switchMap((action) =>
          this.workersService.getPosturalAssessment(1).pipe(
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
  fetchWorkerGroupTree$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchWorkerGroupTree>(WorkersActionTypes.FetchWorkerGroupTree),
        switchMap((action) =>
          this.workersService.getWorkersGroupTree().pipe(
            map((response: GroupsTree[]) => {
              return this.store.dispatch(
                new FetchWorkerGroupTreeSuccess(response)
              );
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchCurrentFA$ = createEffect(() =>
    this.actions$.pipe(ofType<FetchCurrentFunctionalAnalysisForWorker>(WorkersActionTypes.FetchCurrentFunctionalAnalysisForWorker),
    switchMap((action) => this.workersService.getWorkerCurrentFunctionalAnalysis(action.payload)
      .pipe(map((response: FunctionalAnalysis) => {

        return this.store.dispatch(new FetchCurrentFunctionalAnalysisForWorkerSuccess(response));
      })),
    )),
    {
      dispatch: false,
    }
  );
  fetchWorkerHealthHygieneResults$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchWorkerHealthHygieneResults>(WorkersActionTypes.FetchWorkerHealthHygieneResults),
        switchMap((action) =>
          this.workersService.getWorkerMainHealthHygieneResults(action.payload).pipe(
            map((response: HealthHygieneResult[]) => {
              return this.store.dispatch(new FetchWorkerHealthHygieneResultsSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
  fetchWorkerHealthHygienes$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchWorkerHealthHygienes>(WorkersActionTypes.FetchWorkerHealthHygienes),
        switchMap((action) =>
          this.workersService.getMainHealthHygieneByType("Workers").pipe(
            map((response: HealthHygiene[]) => {
              return this.store.dispatch(new FetchWorkerHealthHygienesSuccess(response));
            })
          )
        )
      ),
    {
      dispatch: false,
    }
  );
fetchHumanFactorTree$ = createEffect(() =>
  this.actions$.pipe(ofType<FetchHumanFactorTree>(WorkersActionTypes.FetchHumanFactorTree),
    switchMap((action) => this.workersService.getHumanFactorTree()
      .pipe(map((response: HumanFactorTree[]) => {

        return this.store.dispatch(new FetchHumanFactorTreeSuccess(response));
      })),
    )),
    {
      dispatch: false,
    }
);
fetchEnviromentalTree$ = createEffect(() =>
  this.actions$.pipe(ofType<FetchEnvironmentalFactorTree>(WorkersActionTypes.FetchEnvironmentalFactorTree),
    switchMap((action) => this.workersService.getEnviromentalTree()
      .pipe(map((response: EnvironmentalTree[]) => {

        return this.store.dispatch(new FetchEnvironmentalFactorTreeSuccess(response));
      })),
    )),
    {
      dispatch: false,
  }
);
fetchPPETree$ = createEffect(() =>
  this.actions$.pipe(ofType<FetchPPETree>(WorkersActionTypes.FetchPPETree),
  switchMap((action) => this.workersService.getPPETree()
    .pipe(map((response: PPETree[]) => {

      return this.store.dispatch(new FetchPPETreeSuccess(response));
    })),
  )),
  {
    dispatch: false,
  }
);
fetchPosturalGroups$ = createEffect(() =>
  this.actions$.pipe(ofType<FetchPosturalToleranceGroups>(WorkersActionTypes.FetchPosturalToleranceGroups),
  switchMap((action) => this.workersService.getPosturalToleranceGroups()
    .pipe(map((response: PosturalToleranceGroup[]) => {

      return this.store.dispatch(new FetchPosturalToleranceGroupsSuccess(response));
    })),
  )),
  {
    dispatch: false,
  }
);
fetchMaterialGroups$ = createEffect(() =>
  this.actions$.pipe(ofType<FetchMaterialHandlingGroups>(WorkersActionTypes.FetchMaterialHandlingGroups),
  switchMap((action) => this.workersService.getMaterialHandlingGroups()
    .pipe(map((response: MaterialHandlingGroup[]) => {

      return this.store.dispatch(new FetchMaterialHandlingGroupsSuccess(response));
    })),
  )),
  {
    dispatch: false,
  }
);
fetchGripItems$ = createEffect(() =>
  this.actions$.pipe(ofType<FetchGripItems>(WorkersActionTypes.FetchGripItems),
  switchMap((action) => this.workersService.getGripItems()
    .pipe(map((response: GripItemView[]) => {

      return this.store.dispatch(new FetchGripItemsSuccess(response));
    })),
  )),
  {
    dispatch: false,
  }
  );

}
