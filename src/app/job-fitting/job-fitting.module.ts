import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobFittingRoutingModule } from './job-fitting-routing.module';
import { SummaryComponent } from './summary/summary.component';
import { JobFittingComponent } from './job-fitting.component';
import { SharedModule } from '../shared/shared.module';
import { PosturalTolerancesComponent } from './postural-tolerances/postural-tolerances.component';
import { MaterialHandlingComponent } from './material-handling/material-handling.component';
import { GripStrengthComponent } from './grip-strength/grip-strength.component';
import { HealthHygieneComponent } from './health-hygiene/health-hygiene.component';
import { HumanFactorsComponent } from './human-factors/human-factors.component';
import { PpeComponent } from './ppe/ppe.component';
import { EnvironmentComponent } from './environment/environment.component';
import { TaskOverviewComponent } from './task-overview/task-overview.component';
import { JobFitMaterialHandlingComponent } from './task-overview/material-handling/material-handling.component';
import { JobFitGripStrengthComponent} from './task-overview/grip-strength/grip-strength.component';
import { JobsRiskRatingComponent } from './task-overview/jobs-risk-rating/jobs-risk-rating.component';
import { JobFitPosturalTolerancesComponent } from './task-overview/postural-tolerances/postural-tolerances.component';


@NgModule({
  declarations: [
    SummaryComponent,
    JobFittingComponent,
    PosturalTolerancesComponent,
    MaterialHandlingComponent,
    GripStrengthComponent,
    HealthHygieneComponent,
    HumanFactorsComponent,
    PpeComponent,
    EnvironmentComponent,
    TaskOverviewComponent,
    JobFitPosturalTolerancesComponent,
    JobFitMaterialHandlingComponent,
    JobFitGripStrengthComponent,
    JobsRiskRatingComponent
  ],
  imports: [
    CommonModule,
    JobFittingRoutingModule,
    SharedModule
  ]
})
export class JobFittingModule { }
