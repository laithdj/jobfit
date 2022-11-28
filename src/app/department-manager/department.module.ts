import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentRoutingModule } from './department-routing.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { DepartmentComponent } from './department/department.component';
import { ModalTaskComponent } from './department/modal-task/modal-task.component';
import { ModalWorkerComponent } from './department/modal-worker/modal-worker.component';
import { ModalJobComponent } from './department/modal-job/modal-job.component';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    DepartmentComponent,
    ModalTaskComponent,
    ModalWorkerComponent,
    ModalJobComponent
  ],
  imports: [
    CommonModule,
    DepartmentRoutingModule,
    SharedModule,
  ]
})
export class DepartmentModule { }
