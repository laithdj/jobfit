import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticatedGuard } from './auth/authentication.guard';

const appRoutes: Routes = [
  {
    path: 'home',
    
    loadChildren: () => import('./home-page/home-page.module').then((m) => m.HomePageModule),
  },

  {
    path: 'job-fit-criteria',
    loadChildren: () => import('./job-fitting-criteria/job-fitting-criteria.module').then((m) => m.JobFittingCriteriaModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'home',
    loadChildren: () => import('./api-authorization/api-authorization.module').then((m) => m.ApiAuthorizationModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'tasks',
    loadChildren: () => import('./tasks/tasks.module').then((m) => m.TasksModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'job-fitting',
    loadChildren: () => import('./job-fitting/job-fitting.module').then((m) => m.JobFittingModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'jobs',
    loadChildren: () => import('./jobs/jobs.module').then((m) => m.JobsModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then((m) => m.ReportsModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'workers',
    loadChildren: () => import('./workers/workers.module').then((m) => m.WorkersModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'risks',
    loadChildren: () => import('./risks/risks-search.module').then((m) => m.RisksSearchModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'departments',
    loadChildren: () => import('./department-manager/department.module').then((m) => m.DepartmentModule),
    canActivate: [AuthenticatedGuard],
  },
 // { path: '**', redirectTo: 'home' },
  { path: '', pathMatch:'full', redirectTo: 'home'   },


];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }