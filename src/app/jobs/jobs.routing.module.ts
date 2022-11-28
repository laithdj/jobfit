import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FunctionalAnalysis } from '../shared/models/functional-analysis.model';
import { FunctionalAnalysisComponent } from '../jobs/functional-analysis/functional-analysis.component';
import { AssociatedTasksComponent } from './associated-tasks/associated-tasks.component';
import { FlagsComponent } from './flags/flags.component';
import { GroupsComponent } from './groups/groups.component';
import { JobsDetailsComponent } from './jobs-details/jobs-details.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { JobsComponent } from './jobs.component';
import { NotesComponent } from './notes/notes.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { EnviromentComponent } from './environment/enviroment.component';
import { PpeComponent } from './ppe/ppe.component';
import { HumanFactorsComponent } from './human-factors/human-factors.component';
import { HealthHygieneComponent } from './health-hygiene/health-hygiene.component';
import { EmploymentComponent } from './employment/employment.component';
import { DepartmentComponent } from './department/department.component';

const routes: Routes = [
  { path: '', component: JobsComponent,  children: [
    { path: '', component: JobsListComponent},
    { path: 'jobs-details/:jobId', component: JobsDetailsComponent},
    { path: 'associated-tasks/:jobId', component: AssociatedTasksComponent},
    { path: 'notes/:jobId', component: NotesComponent},
    { path: 'flags/:jobId', component: FlagsComponent},
    { path: 'groups/:jobId', component: GroupsComponent},
    { path: 'functional-analysis/:jobId', component: FunctionalAnalysisComponent},
    { path: 'attachments/:jobId', component: AttachmentsComponent},
    { path: 'environment/:jobId', component: EnviromentComponent },
    { path: 'ppe/:jobId', component: PpeComponent},
    { path: 'health-hygiene/:jobId', component: HealthHygieneComponent},
    { path: 'human-factors/:jobId', component: HumanFactorsComponent },
    { path: 'employment/:jobId', component: EmploymentComponent },
    { path: 'departments/:jobId', component: DepartmentComponent },

  ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobsRoutingModule { }
