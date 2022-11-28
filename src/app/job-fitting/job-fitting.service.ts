import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { AppConfig } from '../app.config';
import { JobFitSummaryScore } from '../shared/models/employment.model';
import { EnvironmentalTree } from '../shared/models/enviromental.model';
import { HumanFactorTree } from '../shared/models/human-factors.model';
import { JobFitHealthHygiene, JobFitItem, JobFitOptions, JobFitSummary } from '../shared/models/job-fitting.model';
import { PPETree } from '../shared/models/ppe.model';


@Injectable({
  providedIn: 'root'
})
export class JobFittingService {
  jobId = 0;
  workerId = 0;
  summaryOptions = new JobFitOptions();


  menuList = [
    {label: 'Summary', icon: '',  routerLink: '../job-fitting/summary/' + this.workerId + '/' + this.jobId},
    {label: 'Postural Tolerances', icon: '', routerLink: '../job-fitting/postural-tolerances/' + this.workerId + '/' + this.jobId},
    {label: 'Material Handling', icon: '', routerLink: '../job-fitting/material-handling/' + this.workerId + '/' + this.jobId},
    {label: 'Grip Strength', icon: '', routerLink: '../job-fitting/grip-strength/'+ + this.workerId + '/' + this.jobId},
    {label: 'Health & Hygiene', icon: '', routerLink: '../job-fitting/health-hygiene/'+ + this.workerId + '/' + this.jobId},
    {label: 'Human Factors', icon: '', routerLink: '../job-fitting/human-factors/'+ + this.workerId + '/' + this.jobId},
    {label: 'PPE', icon: '', routerLink: '../job-fitting/ppe/'+ this.workerId + '/' + this.jobId},
    {label: 'Environment', icon: '' , routerLink: '../job-fitting/environmental/'+ + this.workerId + '/' + this.jobId},
    {label: 'Task Overview', icon: '', routerLink: '../tasks/environment/'+ + this.workerId + '/' + this.jobId},
  ];

  private client: HttpClient;
  private baseURL: string;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string , appComponent:AppComponent, @Inject('APP_CONFIG') appConfig: AppConfig ) {
    this.client = http;
    this.baseURL =  appConfig.ServiceUrl;
   }

  setMenu(workerId: number, jobId: number) {
    this.menuList = [
      {label: 'Summary', icon: '',  routerLink: '../job-fitting/summary/' + workerId + '/' + jobId},
      {label: 'Postural Tolerances', icon: '', routerLink: '../job-fitting/postural-tolerances/'+ workerId + '/' + jobId},
      {label: 'Material Handling', icon: '', routerLink: '../job-fitting/material-handling/' + workerId + '/' + jobId},
      {label: 'Grip Strength', icon: '', routerLink: '../job-fitting/grip-strength/'+ + workerId + '/' + jobId},
      {label: 'Health & Hygiene', icon: '', routerLink: '../job-fitting/health-hygiene/'+ workerId + '/' + jobId},
      {label: 'Human Factors', icon: '', routerLink: '../job-fitting/human-factors/'+ + workerId + '/' + jobId},
      {label: 'PPE', icon: '', routerLink: '../job-fitting/ppe/'+ + workerId + '/' + jobId},
      {label: 'Environment', icon: '' , routerLink: '../job-fitting/environmental/'+ + workerId + '/' + jobId},
      {label: 'Task Overview', icon: '', routerLink: '../job-fitting/task-overview/'+ workerId + '/' + jobId},
    ];
  }
  getJobFitSummary(workerId:number , options:JobFitOptions): Observable<JobFitSummary[]> {
    return this.client.post<JobFitSummary[]>(this.baseURL + 'api/JobFit/GetJobFitSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPosturalTolerancesJobsSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetPosturalToleranceJobSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPosturalTolerancesTasksSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetPosturalToleranceTaskSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getMaterialHandlingJobsSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetMaterialhandlingJobSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getMaterialHandlingTasksSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetMaterialhandlingTaskSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGripStrengthJobsSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetGripStrengthJobSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGripStrengthTasksSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetGripStrengthTaskSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHealthHygieneTasksSummary(workerId:number , options:JobFitOptions): Observable<JobFitHealthHygiene[]> {
    return this.client.post<JobFitHealthHygiene[]>(this.baseURL + 'api/JobFit/GetHealthHygieneTaskSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHealthHygieneJobsSummary(workerId:number , options:JobFitOptions): Observable<JobFitHealthHygiene[]> {
    return this.client.post<JobFitHealthHygiene[]>(this.baseURL + 'api/JobFit/GetHealthHygieneJobSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveJobFitSummaryScore(jobFitSummaryScore: JobFitSummaryScore): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/JobFit/SaveJobFitSummaryScore', jobFitSummaryScore)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getEnvironmentalFactorTaskSummary(workerId: number, options: JobFitOptions): Observable<EnvironmentalTree[]> {
    return this.client.post<EnvironmentalTree[]>(this.baseURL + 'api/JobFit/GetEnvironmentalFactorTaskSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getEnvironmentalFactorSummary(workerId: number, options: JobFitOptions): Observable<EnvironmentalTree[]> {
    return this.client.post<EnvironmentalTree[]>(this.baseURL + 'api/JobFit/GetEnvironmentalFactorSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobsEnviromentalTreeSummary(workerId: number, options: JobFitOptions): Observable<EnvironmentalTree[]> {
    return this.client.post<EnvironmentalTree[]>(this.baseURL + 'api/JobFit/GetJobsEnvTree/' + workerId , options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getTasksEnviromentalTreeSummary(workerId: number, options: JobFitOptions): Observable<EnvironmentalTree[]> {
    return this.client.post<EnvironmentalTree[]>(this.baseURL + 'api/JobFit/GetTasksEnvTree/' + workerId , options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHumanFactorTreeSummary(workerId: number, options: JobFitOptions): Observable<HumanFactorTree[]> {
    return this.client.post<HumanFactorTree[]>(this.baseURL + 'api/JobFit/GetJobsHumanFactorsTree/' + workerId , options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getTasksHumanFactorsTree(workerId: number, options: JobFitOptions): Observable<HumanFactorTree[]> {
    return this.client.post<HumanFactorTree[]>(this.baseURL + 'api/JobFit/GetTasksHumanFactorsTree/' + workerId , options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobsPPETreeSummary(workerId: number, options: JobFitOptions): Observable<PPETree[]> {
    return this.client.post<PPETree[]>(this.baseURL + 'api/JobFit/GetJobsPPETree/' + workerId , options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getTasksPPETreeSummary(workerId: number, options: JobFitOptions): Observable<PPETree[]> {
    return this.client.post<PPETree[]>(this.baseURL + 'api/JobFit/GetTasksPPETree/' + workerId , options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  
  private handleError(error: any) {
    let errorMessage = '';
    //let errors: any = JSON.stringify(error.json());
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}\nPlease Try again.`;
      console.log(error);
    }
    return throwError(errorMessage);
  };
}
