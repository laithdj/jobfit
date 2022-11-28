import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksRoutingModule } from './tasks-routing.module';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { SharedModule } from '../shared/shared.module';
import { TasksComponent } from './tasks.component';
import { TasksDetailsComponent } from './tasks-details/tasks-details.component';
import { AssociatedJobsComponent } from './associated-jobs/associated-jobs.component';
import { NotesComponent } from './notes/notes.component';
import { FlagsComponent } from './flags/flags.component';
import { GroupsComponent } from './groups/groups.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { FunctionalAnalysisComponent } from './functional-analysis/functional-analysis.component';
import { PosturalTolerancesComponent } from './functional-analysis/postural-tolerances/postural-tolerances.component';
import { TaskGripStrengthComponent } from './functional-analysis/grip-strength/grip-strength.component';
import { MaterialHandlingComponent } from './functional-analysis/material-handling/material-handling.component';
import { HealthHygieneComponent } from './health-hygiene/health-hygiene.component';
import { EnviromentComponent } from './enviroment/enviroment.component';
import { PpeComponent } from './ppe/ppe.component';
import { HumanFactorsComponent } from './human-factors/human-factors.component';
import { FAAttachmentsComponent } from './functional-analysis/attachments/attachments.component';
import { RiskRatingComponent } from './functional-analysis/risk-rating/risk-rating.component';
import { ReportComponent } from './report/report.component';
import { LoginComponent } from '../api-authorization/login/login.component';
import { TaskFAHealthHygieneComponent } from './functional-analysis/health-hygiene/health-hygiene.component';
import { HealthHygieneCriteriaComponent } from './health-hygiene-criteria/health-hygiene-criteria.component';

@NgModule({
  declarations: [
    TasksListComponent,
    TasksComponent,
    TasksDetailsComponent,
    AssociatedJobsComponent,
    NotesComponent,
    FlagsComponent,
    GroupsComponent,
    AttachmentsComponent,
    FAAttachmentsComponent,
    FunctionalAnalysisComponent,
    PosturalTolerancesComponent,
    MaterialHandlingComponent,
    TaskGripStrengthComponent,
    HealthHygieneComponent,
    EnviromentComponent,
    PpeComponent,
    HumanFactorsComponent,
    RiskRatingComponent,
    PosturalTolerancesComponent,
    ReportComponent,
    TaskFAHealthHygieneComponent,
    HealthHygieneCriteriaComponent
  ],
  imports: [
    CommonModule,
    TasksRoutingModule,
    SharedModule
  ],
  providers: [
    PosturalTolerancesComponent,
    RiskRatingComponent,
    LoginComponent
  ]
})
export class TasksModule { }
