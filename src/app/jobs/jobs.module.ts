import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { JobsComponent } from './jobs.component';
import { SharedModule } from '../shared/shared.module';
import { JobsDetailsComponent } from './jobs-details/jobs-details.component';
import { JobsRoutingModule } from './jobs.routing.module';
import { EffectsModule } from '@ngrx/effects';
import { JobsEffects } from '../store/jobs-store/jobs.effects';
import { StoreModule } from '@ngrx/store';
import { jobsReducers } from '../store/jobs-store/jobs.reducers';
import { AssociatedTasksComponent } from './associated-tasks/associated-tasks.component';
import { FlagsComponent } from './flags/flags.component';
import { NotesComponent } from './notes/notes.component';
import { GroupsComponent } from './groups/groups.component';
import { FunctionalAnalysisComponent } from './functional-analysis/functional-analysis.component';
import { GripStrengthComponent } from './functional-analysis/grip-strength/grip-strength.component';
import { MaterialHandlingComponent } from './functional-analysis/material-handling/material-handling.component';
import { JobsPosturalTolerancesComponent } from './functional-analysis/postural-tolerances/postural-tolerances.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { AttachmentsComponent } from './attachments/attachments.component';
import { EnviromentComponent } from './environment/enviroment.component';
import { PpeComponent } from './ppe/ppe.component';
import { HealthHygieneComponent } from './health-hygiene/health-hygiene.component';
import { HumanFactorsComponent } from './human-factors/human-factors.component';
import { EmploymentComponent } from './employment/employment.component';
import { DepartmentComponent } from './department/department.component';
import { LoginComponent } from '../api-authorization/login/login.component';
import { GripInputBoxComponent } from '../tasks/functional-analysis/grip-strength/grip-input-box/grip-input-box.component';
import { JobsGripInputBoxComponent } from './functional-analysis/grip-strength/jobs-grip-input-box/jobs-grip-input-box.component';
import { JobsMaterialResultComponent } from './functional-analysis/material-handling/jobs-material-result/jobs-material-result.component';
import { JobsMaterialCheckboxComponent } from './functional-analysis/material-handling/jobs-material-checkbox/jobs-material-checkbox.component';

@NgModule({
  declarations: [
    JobsListComponent,
    JobsComponent,
    JobsDetailsComponent,
    AssociatedTasksComponent,
    FlagsComponent,
    AttachmentsComponent,
    NotesComponent,
    GroupsComponent,
    FunctionalAnalysisComponent,
    GripStrengthComponent,
    MaterialHandlingComponent,
    JobsPosturalTolerancesComponent,
    EnviromentComponent,
    PpeComponent,
    HealthHygieneComponent,
    HumanFactorsComponent,
    EmploymentComponent,
    DepartmentComponent,
    JobsGripInputBoxComponent,
    JobsMaterialResultComponent,
    JobsMaterialCheckboxComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    JobsRoutingModule,
    TabMenuModule,
    StoreModule.forFeature('jobsState', jobsReducers),
    EffectsModule.forFeature([JobsEffects]),

  ],
  providers: [
    LoginComponent
  ]
})
export class JobsModule { }
