import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AssociatedTask, BatchAssociatedTasks, JobTask } from '../shared/models/associatedtasks.model';
import { AttachmentSearchCriteria, AttachmentResult } from '../shared/models/attachment.result.model';
import { Attachments } from '../shared/models/attachments.model';
import { EnvironmentalTree } from '../shared/models/enviromental.model';
import { FlagsTree } from '../shared/models/flags.models';
import { FunctionalAnalysis, PosturalToleranceGroup } from '../shared/models/functional-analysis.model';
import { GroupsTree } from '../shared/models/groups.models';
import { HealthHygiene, HealthHygieneResult } from '../shared/models/health-hygeine.model';
import { BatchCopyOptions, CombineOptionsView, HealthHygieneNextAssessmentSchedule, JobItem, JobPosition, Jobs, JobsDetails } from '../shared/models/jobs.model';
import { Notes } from '../shared/models/notes.model';
import { Postural } from '../shared/models/postural-tolerance.model';
import { JobsSearchCriteria, SearchCriteria } from '../shared/models/search.criteria.model';
import { PPETree } from '../shared/models/ppe.model';
import { HumanFactorTree } from '../shared/models/human-factors.model'
import { DeptTree } from '../shared/models/department.model';
import { Employment, EmploymentResultView, EmploymentSearchCriteria } from '../shared/models/employment.model';
import { AppConfig } from '../app.config';
import { NoteType } from '../shared/models/noteType.model';
import { Provider } from '../shared/models/provider.model';
import { select, Store } from '@ngrx/store';
import { selectFunctionList } from '../store/job-fit.selectors';
import { JobsAppState } from '../store/jobs-store/jobs.reducers';
import { BatchOptionsView } from '../shared/models/batch.model';
import { EFunctions } from '../shared/models/user.model';
import { MenuItem } from 'primeng/api';
import { SetError } from '../app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from '../shared/models/alertPopUp.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  jobId = 0;
  menuList:MenuItem[] = [
    {label: 'Job Details', icon: '',  routerLink: '../jobs/jobs-details/' + this.jobId, disabled: false},
    {label: 'Associated Tasks', icon: '', routerLink: '../jobs/associated-tasks/' + this.jobId , disabled: false},
    {label: 'Departments', icon: '', routerLink: '../jobs/departments/' + this.jobId, disabled: false},
    {label: 'Pre/Employment', icon: '', routerLink: '../jobs/employment/' + this.jobId, disabled: false},
    {label: 'Notes', icon: '' , routerLink: '../jobs/notes/'+ this.jobId, disabled: false},
    {label: 'Flags', icon: '', routerLink: '../jobs/flags/'+ this.jobId , disabled: false},
    {label: 'Groups', icon: '', routerLink: '../jobs/groups/'+ this.jobId, disabled: false},
    {label: 'Attachments', icon: '', routerLink: '../jobs/attachments/'+ this.jobId, disabled: false},
    {label: 'Functional Analysis', icon: '', routerLink: '../jobs/functional-analysis/'+ this.jobId, disabled: false},
    {label: 'Health and Hygiene', icon: '' , routerLink: '../jobs/health-hygiene/'+ this.jobId, disabled: false},
    {label: 'Environment', icon: '', routerLink: '../jobs/environment/'+ this.jobId, disabled: false},
    {label: 'PPE', icon: '', routerLink: '../jobs/ppe/'+ this.jobId, disabled: false},
    {label: 'Human Factors', icon: '', routerLink: '../jobs/human-factors/'+ this.jobId,disabled: false},
  ];

  private client: HttpClient;
  private baseURL: string;
  functionList$ = this.store.pipe(select(selectFunctionList));

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string , @Inject('APP_CONFIG') appConfig: AppConfig,
  private store: Store<JobsAppState> ) {
    this.client = http;
    this.baseURL =  appConfig.ServiceUrl;
    //  this.baseURL = appComponent.baseUrl;
    //  this.baseURL = 'https://localhost:44330/'
  }
  saveJobsPPE(id:number , ppeTree:PPETree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/PPE/SavePPE/' + id, ppeTree)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  getJobsHumanFactorsTree(): Observable<HumanFactorTree[]> {
    return this.client.get<HumanFactorTree[]>(this.baseURL + 'api/HumanFactors/GetJobsHumanFactorsTree/')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobFlags(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Flags/GetSelectedJobFlagsTree/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobFAFlags(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Flags/GetSelectedJobsFAFlagsTree/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobsDeptTree(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/OrgEntity/GetSelectedJobsDeptTree/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveEmployment(employee:Employment): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/Employment/SaveEmployment/', employee)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveBatchFlags(batchOptions: BatchOptionsView): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/BatchFunctions/SaveBatchFlags' , batchOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveBatchGroups(batchOptions: BatchOptionsView): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/BatchFunctions/SaveBatchGroups' , batchOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveBatchDept(batchOptions: BatchOptionsView): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/BatchFunctions/SaveBatchOrgEntities' , batchOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobGroups(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Groups/GetSelectedJobsGroupsTree/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobCombinedGroups(jobId:number): Observable<any[]> {
    return this.client.get<any[]>(this.baseURL + 'api/Groups/GetJobCombinedGroups/' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobCombinedFlags(jobId:number): Observable<any[]> {
    return this.client.get<any[]>(this.baseURL + 'api/Flags/GetJobCombinedFlags/' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobCombinedFAFlags(jobId:number): Observable<any[]> {
    return this.client.get<any[]>(this.baseURL + 'api/Flags/GetJobCombinedFlags/' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  getJobsPPETree(jobId:number): Observable<PPETree[]> {
    return this.client.get<PPETree[]>(this.baseURL + 'api/PPE/GetJobsPPETree/' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  getJobsList(searchCriteria: JobsSearchCriteria): Observable<JobItem> {
    return this.client.post<JobItem>(this.baseURL + 'SearchJobs', searchCriteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobsDetails(id:number): Observable<JobsDetails> {
    return this.client.get<JobsDetails>(this.baseURL + 'api/Jobs/JobDetails/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPagedJobsForOrg(id: number, criteria: JobsSearchCriteria): Observable<JobItem> {
    return this.client.post<JobItem>(this.baseURL + 'api/Jobs/GetJobsForOrgEntity/' + id , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getMainHealthHygieneResults(id:number): Observable<HealthHygieneResult[]> {
    return this.client.get<HealthHygieneResult[]>(this.baseURL + 'api/HealthHygiene/GetJobsMainHealthHygieneResults/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getEnviromentalTree(jobId: number): Observable<EnvironmentalTree[]> {
    return this.client.get<EnvironmentalTree[]>(this.baseURL + 'api/Enviromental/GetJobsEnviromentalTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  GetJobsEnvTree(jobId: number): Observable<EnvironmentalTree[]> {
    return this.client.get<EnvironmentalTree[]>(this.baseURL + 'api/Enviromental/GetJobsEnvTree/' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  saveMainHealthHygieneResult(id:number , result:HealthHygieneResult): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/HealthHygiene/SaveHealthHygieneResults/' + id , result)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getMainHealthHygiene(type:string): Observable<HealthHygiene[]> {
    return this.client.get<HealthHygiene[]>(this.baseURL + 'api/HealthHygiene/GetMainHealthHygiene/' + type)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPosturalToleranceGroups(): Observable<PosturalToleranceGroup[]> {
    return this.client.get<PosturalToleranceGroup[]>(this.baseURL + 'api/FunctionalAnalysis/GetPosturalTolerancesGroups')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPosturalAssessment(id: number): Observable<Postural> {
    return this.client.get<Postural>(this.baseURL + 'postural')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAssociatedTasksForJob(id:number , searchCriteria: SearchCriteria): Observable<AssociatedTask> {
    return this.client.post<AssociatedTask>(this.baseURL + 'api/AssociatedJobs/AssociatedTasks/' + id , searchCriteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTaskSet(task:JobTask): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/AssociatedJobs/SaveJobTaskSet', task)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveBatchTaskSet(batchTask:BatchAssociatedTasks): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/AssociatedJobs/SaveBatchAssociatedTask', batchTask)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveJobsToDepartment(deptId:number, jobIds: number[]): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/OrgEntity/SaveJobsToDepartment/' + deptId, jobIds)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobsFlagTree(): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetJobsFlagsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getDepartmentsTree(): Observable<DeptTree[]> {
    return this.client.get<DeptTree[]>(this.baseURL + 'api/OrgEntity/GetDepartmentsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getDeptTreeForJob(jobId:number): Observable<DeptTree[]> {
    return this.client.get<DeptTree[]>(this.baseURL + 'api/OrgEntity/GetDeptTreeForJob/' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobDeptTreeForDepartment(departmentId:number): Observable<DeptTree[]> {
    return this.client.get<DeptTree[]>(this.baseURL + 'api/OrgEntity/GetSelectedJobDeptTreeForDepartment/' + departmentId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveDepartmentsTree(jobId: number , deptIds: number[]): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/OrgEntity/SaveDepartmentsTree/' + jobId , deptIds)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFATaskFlagTree(): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetFATasksFlagsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobsGroupTree(): Observable<GroupsTree[]> {
    return this.client.get<GroupsTree[]>(this.baseURL + 'api/Groups/GetJobsGroupsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobsEmployment(jobsId: number , empSearchCriteria:EmploymentSearchCriteria): Observable<EmploymentResultView> {
    return this.client.post<EmploymentResultView>(this.baseURL + 'GetJobEmployments/' + jobsId , empSearchCriteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobPosition(id: number): Observable<JobPosition> {
    return this.client.get<JobPosition>(this.baseURL + 'GetJobPosition/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  updateJobPosition(jobPosition: JobPosition): Observable<number> {
    return this.client.post<number>(this.baseURL + 'UpdateJobPosition' , jobPosition)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  combineJobs(combineOptions: CombineOptionsView): Observable<CombineOptionsView> {
    return this.client.post<CombineOptionsView>(this.baseURL + 'api/Jobs/CombineJobs' , combineOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  copyJobs(copyOptions: BatchCopyOptions): Observable<BatchCopyOptions> {
    return this.client.post<BatchCopyOptions>(this.baseURL + 'api/Jobs/CopyJobs' , copyOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJob(id:number): Observable<Jobs> {
    return this.client.get<Jobs>(this.baseURL + 'api/Jobs/GetJob/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveJob(id:number): Observable<boolean> {
    return this.client.get<boolean>(this.baseURL + 'api/Jobs/ArchiveJob/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveJob(job:Jobs): Observable<Jobs> {
    return this.client.post<Jobs>(this.baseURL + 'api/Jobs/SaveJob', job)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  newNote(noteId: number, note: Notes): Observable<any> {
    return this.client.post<any>(this.baseURL + 'notes/' + noteId, note, {}).pipe(
      retry(1),
      catchError(this.handleError)
    )
  }
  getNotes(jobId: number): Observable<Notes[]> {
    return this.client.get<Notes[]>(this.baseURL + 'notes/?jobId=' + jobId)
  }
  getProviders(): Observable<Provider[]> {
    return this.client.get<Provider[]>(this.baseURL + 'providers')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getNoteProviders(): Observable<Provider[]> {
    return this.client.get<Provider[]>(this.baseURL + 'api/JobFitEntityNote/GetProviders')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getNoteTypes(): Observable<NoteType[]> {
    return this.client.get<NoteType[]>(this.baseURL + 'api/JobFitEntityNote/GetNoteTypes')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveJobsFlag(id:number , flags:FlagsTree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Flags/SaveJobFlags/' + id, flags)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveJobsGroup(id:number , flags:GroupsTree[]): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/Groups/SaveJobGroups/' + id, flags)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobAttachments(id:number, criteria:AttachmentSearchCriteria): Observable<AttachmentResult> {
    return this.client.post<AttachmentResult>(this.baseURL + 'GetJobAttachments/' + id, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveAttachments(id: number, attachment: Attachments): Observable<AttachmentResult>{
    return this.client.post<AttachmentResult>(this.baseURL + 'SaveJobAttachments/' + id, attachment).pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  printList(searchCriteria: JobsSearchCriteria): Observable<any> {
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
       //'responseType'  : 'blob' as 'json'        //This also worked
    };
    return this.client.post<any>(this.baseURL + 'GetJobListReport', searchCriteria, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  saveJobsEnvironmentalFactors(id:number, EnvironmentalFactors:EnvironmentalTree[]):Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Groups/SaveJobEnvironmentalFactors/' + id, EnvironmentalFactors)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getJobsEnvironmentalFactors(id:number):Observable<EnvironmentalTree[]> {
    return this.client.get<EnvironmentalTree[]>(this.baseURL + 'api/Groups/SaveJobEnvironmentalFactors/' + id)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getSelectedJobsHFTree(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/HumanFactors/GetSelectedJobsHFTree/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobsPPETree(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/PPE/GetSelectedJobPPETree/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobsJobFitPPETree(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/PPE/GetJobFitPPEJob/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedJobsEnviromentalTree(jobId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Enviromental/GetSelectedJobEnvTree/' + jobId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveJobNote(jobId:number , note:Notes): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/JobFitEntityNote/SaveJobJobFitNote/' + jobId, note)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  updateNote(note:Notes): Observable<any> {
    return this.client.post<any>(this.baseURL + 'api/JobFitEntityNote/UpdateJobFitNote/', note).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  archiveNote(id:number): Observable<Jobs> {
    return this.client.get<Jobs>(this.baseURL + 'api/JobFitEntityNote/ArchiveNote/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveAttachment(id:number): Observable<number> {
    return this.client.get<number>(this.baseURL + 'api/Attachments/ArchiveAttachment/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveAssociatedTask(id: number): Observable<number> {
    return this.client.get<number>(this.baseURL + 'api/AssociatedJobs/ArchiveAssociatedTask/' + id, {})
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
    }
    return throwError(errorMessage);
  };
  getJobCurrentFunctionalAnalysis(jobId:number): Observable<FunctionalAnalysis> {
    return this.client.get<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/GetJobsCurrentFunctionalAnalysis/' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  setMenu(jobId: number) {
    var result = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      this.menuList = [
        {label: 'Job Details', icon: '',  
          routerLink: result.Function[EFunctions.ViewJobs] ? '../jobs/jobs-details/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/jobs-details/' + jobId, result.Function[EFunctions.ViewJobs]),
          styleClass: result.Function[EFunctions.ViewJobs] ? '': 'disabled-side'
        },
        {label: 'Associated Tasks', icon: '', 
          routerLink: result.Function[EFunctions.ViewTasks] ? '../jobs/associated-tasks/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/associated-tasks/' + jobId, result.Function[EFunctions.ViewTasks]),
          styleClass: result.Function[EFunctions.ViewTasks] ? '': 'disabled-side'
        },
        {label: 'Departments', icon: '', 
          routerLink: result.Function[EFunctions.ViewDepartments] ? '../jobs/departments/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/departments/' + jobId, result.Function[EFunctions.ViewDepartments]),
          styleClass: result.Function[EFunctions.ViewDepartments] ? '': 'disabled-side'
        },
        {label: 'Pre/Employment', icon: '', 
          routerLink: result.Function[EFunctions.ViewEmployments] ? '../jobs/employment/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/employment/' + jobId, result.Function[EFunctions.ViewEmployments]),
          styleClass: result.Function[EFunctions.ViewEmployments] ? '': 'disabled-side'
        },
        {label: 'Notes', icon: '' , 
          routerLink: result.Function[EFunctions.ViewNotes] ? '../jobs/notes/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/notes/' + jobId, result.Function[EFunctions.ViewNotes]),
          styleClass: result.Function[EFunctions.ViewNotes] ? '': 'disabled-side'
        },
        {label: 'Flags', icon: '', 
          routerLink: result.Function[EFunctions.ViewFlags] ? '../jobs/flags/' + jobId : undefined, 
          command: () => this.goToRoute('../jobs/flags/' + jobId, result.Function[EFunctions.ViewFlags]),
          styleClass: result.Function[EFunctions.ViewFlags] ? '': 'disabled-side'
        },
        {label: 'Groups', icon: '', 
          routerLink: result.Function[EFunctions.ViewGroups] ? '../jobs/groups/' + jobId : undefined, 
          command: () => this.goToRoute('../jobs/groups/'+ jobId, result.Function[EFunctions.ViewGroups]),
          styleClass: result.Function[EFunctions.ViewGroups] ? '': 'disabled-side'
        },
        {label: 'Attachments', icon: '', 
          routerLink: result.Function[EFunctions.ViewAttachments] ? '../jobs/attachments/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/attachments/'+ jobId, result.Function[EFunctions.ViewAttachments]),
          styleClass: result.Function[EFunctions.ViewAttachments] ? '': 'disabled-side'
        },
        {label: 'Functional Analysis', icon: '', 
          routerLink: result.Function[EFunctions.ViewFunctionalAnalyses] ? '../jobs/functional-analysis/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/functional-analysis/' + jobId, result.Function[EFunctions.ViewFunctionalAnalyses]),
          styleClass: result.Function[EFunctions.ViewFunctionalAnalyses] ? '': 'disabled-side'
        },
        {label: 'Health and Hygiene', icon: '' , 
          routerLink: result.Function[EFunctions.ViewHealthHygienes] ? '../jobs/health-hygiene/' + jobId : undefined,
          command: () => this.goToRoute('../jobs/health-hygiene/' + jobId, result.Function[EFunctions.ViewHealthHygienes]),
          styleClass: result.Function[EFunctions.ViewHealthHygienes] ? '': 'disabled-side'
        },
        {label: 'Environment', icon: '', 
          routerLink: result.Function[EFunctions.ViewEnvironmentalFactors] ? '../jobs/environment/' + jobId : undefined, 
          command: () => this.goToRoute('../jobs/environment/' + jobId, result.Function[EFunctions.ViewEnvironmentalFactors]),
          styleClass: result.Function[EFunctions.ViewEnvironmentalFactors] ? '': 'disabled-side'
        },
        {label: 'PPE', icon: '', 
          routerLink: result.Function[EFunctions.ViewPPEs] ? '../jobs/ppe/' + jobId: undefined, 
          command: () => this.goToRoute('../jobs/ppe/' + jobId, result.Function[EFunctions.ViewPPEs]),
          styleClass: result.Function[EFunctions.ViewPPEs] ? '': 'disabled-side'
        },
        {label: 'Human Factors', icon: '', 
          routerLink: result.Function[EFunctions.ViewHumanFactors] ? '../jobs/human-factors/' + jobId : undefined,
          command: () => this.goToRoute('../jobs/human-factors/' + jobId, result.Function[EFunctions.ViewHumanFactors]),
          styleClass: result.Function[EFunctions.ViewHumanFactors] ? '': 'disabled-side' 
        },
      ];
  }
  goToRoute(url:string, isAuthorised:boolean) {
    if (isAuthorised) {
      if(url.length > 0){
        window.open(url, "_self");
      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
  }
  getJobHealthHygieneNextAssessmentSchedule(id:number): Observable<HealthHygieneNextAssessmentSchedule[]> {
    return this.client.get<HealthHygieneNextAssessmentSchedule[]>(this.baseURL + 'api/HealthHygiene/GetJobNextAssessmentSchedule/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveHealthHygieneNextAssessmentSchedule(id: number): Observable<any>{
    return this.client.get<any>(this.baseURL + 'api/HealthHygiene/ArchiveNextAssessmentSchedule/' + id)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  saveJobHealthHygieneNextAssessmentSchedule(jobId:number, nextAssessmentSchedule:HealthHygieneNextAssessmentSchedule): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/HealthHygiene/SaveJobNextAssessmentSchedule/' + jobId, nextAssessmentSchedule)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
}
