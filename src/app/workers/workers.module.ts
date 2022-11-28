import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerDetailsComponent } from './worker-details/worker-details.component';
import { WorkersComponent } from './workers.component';
import { WorkersRoutingModule } from './workers-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TabMenuModule } from 'primeng/tabmenu';
import { AttachmentsComponent } from './attachments/attachments.component';
import { CheckboxModule } from 'primeng/checkbox';
import { WorkerNotesComponent } from './worker-notes/worker-notes.component';
import { WorkerGroupsComponent } from './worker-groups/worker-groups.component';
import { WorkersListComponent } from './workers-list/workers-list.component';
import { StoreModule } from '@ngrx/store';
import { workersReducers } from '../store/workers-store/workers.reducers';
import { EffectsModule } from '@ngrx/effects';
import { WorkersEffects } from '../store/workers-store/workers.effects';
import { HealthHygieneComponent } from './worker-health-hygiene/health-hygiene.component';
import { EmploymentComponent } from './employment/employment.component';
import { WorkerHumanFactorsComponent } from './worker-human-factors/worker-human-factors.component';
import { WorkerEnvironmentComponent } from './worker-enviroment/worker-enviroment.component';
import { WorkerPpeComponent } from './worker-ppe/worker-ppe.component';
import { WorkerFlagsComponent } from './worker-flags/worker-flags.component';
import { WorkerFunctionalAnalysisComponent } from './worker-functional-analysis/worker-functional-analysis.component';
import { PosturalTolerancesComponent } from './worker-functional-analysis/postural-tolerances/postural-tolerances.component';
import { MaterialHandlingComponent } from './worker-functional-analysis/material-handling/material-handling.component';
import { GripStrengthComponent } from './worker-functional-analysis/grip-strength/grip-strength.component';
import { WorkerFAAttachmentsComponent } from './worker-functional-analysis/attachments/worker-faattachments.component';
import { FAHealthHygieneComponent } from './worker-functional-analysis/health-hygiene/health-hygiene.component';
import { LoginComponent } from '../api-authorization/login/login.component';
import { GripCheckboxComponent } from './worker-functional-analysis/grip-strength/grip-checkbox/grip-checkbox.component';
import { JobfitScoresComponent } from './jobfit-scores/jobfit-scores.component';


@NgModule({
  declarations: [
    WorkerDetailsComponent,
    WorkersComponent,
    AttachmentsComponent,
    WorkerFlagsComponent,
    WorkerNotesComponent,
    WorkerGroupsComponent,
    WorkersListComponent,
    HealthHygieneComponent,
    EmploymentComponent,
    WorkerHumanFactorsComponent,
    WorkerEnvironmentComponent,
    WorkerPpeComponent,
    WorkerFunctionalAnalysisComponent,
    PosturalTolerancesComponent,
    MaterialHandlingComponent,
    GripStrengthComponent,
    WorkerFAAttachmentsComponent,
    FAHealthHygieneComponent,
    GripCheckboxComponent,
    JobfitScoresComponent
  ],
  imports: [
    CommonModule,
    WorkersRoutingModule,
    SharedModule,
    TabMenuModule,
    CheckboxModule,
    StoreModule.forFeature('workersState', workersReducers),
    EffectsModule.forFeature([WorkersEffects]),
  ],
  providers: [
    LoginComponent
  ]
})
export class WorkersModule { }
