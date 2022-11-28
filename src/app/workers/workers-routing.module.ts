
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttachmentsComponent } from './attachments/attachments.component';
import { EmploymentComponent } from './employment/employment.component';
import { JobfitScoresComponent } from './jobfit-scores/jobfit-scores.component';
import { WorkerDetailsComponent } from './worker-details/worker-details.component';
import { WorkerEnvironmentComponent } from './worker-enviroment/worker-enviroment.component';
import { WorkerFlagsComponent } from './worker-flags/worker-flags.component';
import { WorkerFunctionalAnalysisComponent } from './worker-functional-analysis/worker-functional-analysis.component';
import { WorkerGroupsComponent } from './worker-groups/worker-groups.component';
import { HealthHygieneComponent } from './worker-health-hygiene/health-hygiene.component';
import { WorkerHumanFactorsComponent } from './worker-human-factors/worker-human-factors.component';
import { WorkerNotesComponent } from './worker-notes/worker-notes.component';
import { WorkerPpeComponent } from './worker-ppe/worker-ppe.component';
import { WorkersListComponent } from './workers-list/workers-list.component';
import { WorkersComponent } from './workers.component';

const routes: Routes = [
  { path: '', component: WorkersComponent,  children: [
   { path: '', component: WorkersListComponent},
   { path: 'workers-details/:workerId', component: WorkerDetailsComponent },
   { path: 'attachments/:workerId', component: AttachmentsComponent },
   { path: 'flags/:workerId', component: WorkerFlagsComponent },
   { path: 'notes/:workerId', component: WorkerNotesComponent },
   { path: 'groups/:workerId', component: WorkerGroupsComponent },
   { path: 'environment/:workerId', component: WorkerEnvironmentComponent },
   { path: 'health-hygiene/:workerId', component: HealthHygieneComponent},
   { path: 'employment/:workerId', component: EmploymentComponent},
   { path: 'human-factors/:workerId', component: WorkerHumanFactorsComponent },
   { path: 'ppe/:workerId', component: WorkerPpeComponent},
   { path: 'functional-analysis/:workerId', component: WorkerFunctionalAnalysisComponent},
   { path: 'jobFit-scores/:workerId', component: JobfitScoresComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkersRoutingModule { }
