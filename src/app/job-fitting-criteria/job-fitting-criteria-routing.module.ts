import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobEmploymentComponent } from './job-employment/job-employment.component';
import { JobFittingCriteriaComponent } from './job-fitting-criteria.component';
import { JobWorkerComponent } from './job-worker/job-worker.component';
import { WorkerDeptComponent } from './worker-dept/worker-dept.component';
import { WorkerEmploymentComponent } from './worker-employment/worker-employment.component';
import { WorkerJobComponent } from './worker-job/worker-job.component';
import { WorkerTaskComponent } from './worker-task/worker-task.component';

const routes: Routes = [
  { path: '', component: JobFittingCriteriaComponent,  children: [
    { path: '', component: JobFittingCriteriaComponent},
    { path: 'worker-employment/:workerId/:jobId', component: WorkerEmploymentComponent},
    { path: 'worker-employment', component: WorkerEmploymentComponent},
    { path: 'worker-jobs/:workerId/:jobId', component: WorkerJobComponent},
    { path: 'worker-jobs', component: WorkerJobComponent},
    { path: 'worker-tasks/:workerId/:jobId', component: WorkerTaskComponent},
    { path: 'worker-tasks', component: WorkerTaskComponent},
    { path: 'worker-dept/:workerId/:jobId', component: WorkerDeptComponent},
    { path: 'worker-dept', component: WorkerDeptComponent},
    { path: 'job-employment/:workerId/:jobId', component: JobEmploymentComponent},
    { path: 'job-employment', component: JobEmploymentComponent},
    { path: 'job-worker/:workerId/:jobId', component: JobWorkerComponent},
    { path: 'job-worker', component: JobWorkerComponent},
  ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class JobFittingCriteriaRoutingModule { }
