import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobFittingCriteriaRoutingModule } from './job-fitting-criteria-routing.module';
import { JobFittingCriteriaComponent } from './job-fitting-criteria.component';
import { WorkerEmploymentComponent } from './worker-employment/worker-employment.component';
import { WorkerJobComponent } from './worker-job/worker-job.component';
import { WorkerTaskComponent } from './worker-task/worker-task.component';
import { WorkerDeptComponent } from './worker-dept/worker-dept.component';
import { JobEmploymentComponent } from './job-employment/job-employment.component';
import { JobWorkerComponent } from './job-worker/job-worker.component';
import { SharedModule } from '../shared/shared.module';
import { SummaryComponent } from '../job-fitting/summary/summary.component';


@NgModule({
  declarations: [
    JobFittingCriteriaComponent,
    WorkerEmploymentComponent,
    WorkerJobComponent,
    WorkerTaskComponent,
    WorkerDeptComponent,
    JobEmploymentComponent,
    JobWorkerComponent
  ],
  imports: [
    CommonModule,
    JobFittingCriteriaRoutingModule,
    SharedModule
  ],
  providers: [SummaryComponent]
})
export class JobFittingCriteriaModule { }
