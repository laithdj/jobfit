import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { AppConfig } from '../app.config';
import { JobFitSummaryScore } from '../shared/models/employment.model';
import { EJobFitSideMenu, JobFitItem, JobFitOptions, JobFitSummary } from '../shared/models/job-fitting.model';


@Injectable({
  providedIn: 'root'
})
export class JobFittingCriteriaService {
  jobId = 0;
  workerId = 0;

  menuList = [
    {label: 'Worker vs Pre/Emp', icon: '',  routerLink: '../job-fit-criteria/worker-employment/' + this.workerId + "/" + this.jobId, styleClass: ''},
    {label: 'Worker vs Job', icon: '', routerLink: '../job-fit-criteria/worker-jobs/' + this.workerId + "/" + this.jobId, styleClass: ''},
    {label: 'Worker vs Tasks', icon: '', routerLink: '../job-fit-criteria/worker-tasks/' + this.workerId + "/" + this.jobId, styleClass: ''},
    {label: 'Worker vs Dept', icon: '', routerLink: '../job-fit-criteria/worker-dept/'+ this.workerId + "/" + this.jobId, styleClass: ''},
    {label: '', icon: ''},
    {label: 'Job vs Pre/Emp', icon: '', routerLink: '../job-fit-criteria/job-employment/' + this.workerId + "/" + this.jobId, styleClass: ''},
    {label: 'Job vs Worker', icon: '', routerLink: '../job-fit-criteria/job-worker/'+ this.workerId + "/" + this.jobId, styleClass: ''},
  ];

  private client: HttpClient;
  private baseURL: string;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string , appComponent:AppComponent, @Inject('APP_CONFIG') appConfig: AppConfig ) {
    this.client = http;
    this.baseURL =  appConfig.ServiceUrl;
   }

  setMenu(workerId: number, jobId:number, activeIndex?:number) {
    this.menuList = [
      {label: 'Worker vs Pre/Emp', icon: '',  routerLink: '../job-fit-criteria/worker-employment/' + workerId + "/" + jobId, styleClass: activeIndex == EJobFitSideMenu.WorkerVsEmp? 'p-menuitem-link-active' :''},
      {label: 'Worker vs Job', icon: '', routerLink: '../job-fit-criteria/worker-jobs/' + workerId + "/" + jobId, styleClass: activeIndex == EJobFitSideMenu.WorkerVsJob? 'p-menuitem-link-active' :''},
      {label: 'Worker vs Tasks', icon: '', routerLink: '../job-fit-criteria/worker-tasks/' + workerId + "/" + jobId, styleClass: activeIndex == EJobFitSideMenu.WorkerVsTasks? 'p-menuitem-link-active' :''},
      {label: 'Worker vs Dept', icon: '', routerLink: '../job-fit-criteria/worker-dept/'+ workerId + "/" + jobId, styleClass: activeIndex == EJobFitSideMenu.WorkerVsDept? 'p-menuitem-link-active' :''},
      {label: '', icon: ''},
      {label: 'Job vs Pre/Emp', icon: '', routerLink: '../job-fit-criteria/job-employment/' + workerId + "/" + jobId, styleClass: activeIndex == EJobFitSideMenu.JobVsEmp? 'p-menuitem-link-active' :''},
      {label: 'Job vs Worker', icon: '', routerLink: '../job-fit-criteria/job-worker/'+ workerId + "/" + jobId, styleClass: activeIndex == EJobFitSideMenu.JobVsWorker? 'p-menuitem-link-active' :''},
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
  getHealthHygieneTasksSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetHealthHygieneTaskSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHealthHygieneJobsSummary(workerId:number , options:JobFitOptions): Observable<JobFitItem[]> {
    return this.client.post<JobFitItem[]>(this.baseURL + 'api/JobFit/GetHealthHygieneJobSummary/' + workerId, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveJobFitSummaryScore(jobFitSummaryScore: JobFitSummaryScore): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/JobFit/GetGripStrengthTaskSummary', jobFitSummaryScore)
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
