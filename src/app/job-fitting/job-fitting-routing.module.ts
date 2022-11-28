import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentComponent } from './environment/environment.component';
import { GripStrengthComponent } from './grip-strength/grip-strength.component';
import { HealthHygieneComponent } from './health-hygiene/health-hygiene.component';
import { HumanFactorsComponent } from './human-factors/human-factors.component';
import { JobFittingComponent } from './job-fitting.component';
import { MaterialHandlingComponent } from './material-handling/material-handling.component';
import { PosturalTolerancesComponent } from './postural-tolerances/postural-tolerances.component';
import { PpeComponent } from './ppe/ppe.component';
import { SummaryComponent } from './summary/summary.component';
import { TaskOverviewComponent } from './task-overview/task-overview.component';

const routes: Routes = [
  { path: '', component: JobFittingComponent,  children: [
    { path: '', component: JobFittingComponent},
    { path: 'summary/:workerId/:jobId', component: SummaryComponent},
    { path: 'summary/:workerId/:jobId/:deptId', component: SummaryComponent},
    { path: 'postural-tolerances/:workerId/:jobId', component: PosturalTolerancesComponent},
    { path: 'postural-tolerances/:workerId/:jobId/:associatedId', component: PosturalTolerancesComponent},
    { path: 'material-handling/:workerId/:jobId', component: MaterialHandlingComponent},
    { path: 'material-handling/:workerId/:jobId/:associatedId', component: MaterialHandlingComponent},
    { path: 'grip-strength/:workerId/:jobId', component: GripStrengthComponent},
    { path: 'grip-strength/:workerId/:jobId/:associatedId', component: GripStrengthComponent},
    { path: 'human-factors/:workerId/:jobId', component: HumanFactorsComponent},
    { path: 'human-factors/:workerId/:jobId/:associatedId', component: HumanFactorsComponent},
    { path: 'ppe/:workerId/:jobId', component: PpeComponent},
    { path: 'ppe/:workerId/:jobId/:associatedId', component: PpeComponent},
    { path: 'environmental/:workerId/:jobId', component: EnvironmentComponent},
    { path: 'environmental/:workerId/:jobId/:associatedId', component: EnvironmentComponent},
    { path: 'health-hygiene/:workerId/:jobId', component: HealthHygieneComponent},
    { path: 'health-hygiene/:workerId/:jobId/:associatedId', component: HealthHygieneComponent},
    { path: 'task-overview/:workerId/:jobId', component: TaskOverviewComponent},
    { path: 'task-overview/:workerId/:jobId/:taskId', component: TaskOverviewComponent},

  ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobFittingRoutingModule { }
