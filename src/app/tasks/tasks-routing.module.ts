import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HealthHygieneCriteria } from '../shared/models/health-hygiene-criteri.model';
import { AssociatedJobsComponent } from './associated-jobs/associated-jobs.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { EnviromentComponent } from './enviroment/enviroment.component';
import { FlagsComponent } from './flags/flags.component';
import { FunctionalAnalysisComponent } from './functional-analysis/functional-analysis.component';
import { GroupsComponent } from './groups/groups.component';
import { HealthHygieneCriteriaComponent } from './health-hygiene-criteria/health-hygiene-criteria.component';
import { HealthHygieneComponent } from './health-hygiene/health-hygiene.component';
import { HumanFactorsComponent } from './human-factors/human-factors.component';
import { NotesComponent } from './notes/notes.component';
import { PpeComponent } from './ppe/ppe.component';
import { ReportComponent } from './report/report.component';
import { TasksDetailsComponent } from './tasks-details/tasks-details.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { TasksComponent } from './tasks.component';

const routes: Routes = [
  { path: '', component: TasksComponent,  children: [
    { path: '', component: TasksListComponent},
    { path: 'tasks-details/:taskId', component: TasksDetailsComponent},
    { path: 'associated-jobs/:taskId', component: AssociatedJobsComponent},
    { path: 'notes/:taskId', component: NotesComponent},
    { path: 'flags/:taskId', component: FlagsComponent},
    { path: 'groups/:taskId', component: GroupsComponent},
    { path: 'attachments/:taskId', component: AttachmentsComponent},
    { path: 'functional-analysis/:taskId', component: FunctionalAnalysisComponent},
    { path: 'health-hygiene/:taskId', component: HealthHygieneComponent},
    { path: 'health-hygiene-criteria/:taskId', component: HealthHygieneCriteriaComponent},
    { path: 'environment/:taskId', component: EnviromentComponent},
    { path: 'human-factors/:taskId', component: HumanFactorsComponent},
    { path: 'ppe/:taskId', component: PpeComponent},
    { path: 'report/:type', component: ReportComponent},
  ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
