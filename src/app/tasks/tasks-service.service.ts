import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { SetError } from '../app-store/app-ui-state.actions';
import { AppConfig } from '../app.config';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from '../shared/models/alertPopUp.model';
import { AssociatedJob, TaskJobs } from '../shared/models/associatedjobs.model';
import { AttachmentResult, AttachmentSearchCriteria } from '../shared/models/attachment.result.model';
import { AttachmentImage, Attachments } from '../shared/models/attachments.model';
import { BatchOptionsView } from '../shared/models/batch.model';
import { CheckedEntity } from '../shared/models/checkedEntity.model';
import { DeptTree } from '../shared/models/department.model';
import { EnvironmentalTree } from '../shared/models/enviromental.model';
import { Flags, FlagsTree } from '../shared/models/flags.models';
import { CustomerCompanySettings, FASearchCriteria, FunctionalAnalysis, FunctionalAnalysisResult, PosturalToleranceGroup } from '../shared/models/functional-analysis.model';
import { GripItemView } from '../shared/models/grips.model';
import { Groups, GroupsTree } from '../shared/models/groups.models';
import { HealthHygiene, HealthHygieneInputItemView, HealthHygieneResult, HealthHygieneResults, NextDueDateSetting } from '../shared/models/health-hygeine.model';
import { HealthHygieneCriteria, HHCriteriaResult, Operators } from '../shared/models/health-hygiene-criteri.model';
import { HumanFactorTree } from '../shared/models/human-factors.model';
import { JobListName } from '../shared/models/job.list.names.model';
import { CombineOptionsView, Jobs } from '../shared/models/jobs.model';
import { MaterialHandlingFrequency, MaterialHandlingGroup } from '../shared/models/materialHandling.model';
import { Note, NotesResult } from '../shared/models/note.model';
import { Notes } from '../shared/models/notes.model';
import { NoteType } from '../shared/models/noteType.model';
import { Postural } from '../shared/models/postural-tolerance.model';
import { PPETree } from '../shared/models/ppe.model';
import { Provider } from '../shared/models/provider.model';
import { RiskTool } from '../shared/models/risk.ratings.model';
import { Event, NoteSearchCriteriaView, SearchCriteria } from '../shared/models/search.criteria.model';
import { SiteTree } from '../shared/models/sites.model';
import { TaskDetails } from '../shared/models/task.details.model';
import { Task, TaskItem, NextAssesmentSchedule, HealthHygieneNextAssessmentSchedule, Flag} from '../shared/models/task.model';
import { EFunctions, User } from '../shared/models/user.model';
import { selectFunctionList } from '../store/job-fit.selectors';
import { JobsAppState } from '../store/jobs-store/jobs.reducers';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  taskId = 0;
  private _cachedUser: User | null = null;

  menuList:MenuItem[] = [
    {label: 'Task Details', icon: '',  routerLink: '../tasks/tasks-details/' + this.taskId},
    {label: 'Associated Jobs', icon: '', routerLink: '../tasks/associated-jobs/' + this.taskId},
    {label: 'Notes', icon: '' , routerLink: '../tasks/notes/'+ this.taskId},
    {label: 'Flags', icon: '', routerLink: '../tasks/flags/'+ this.taskId},
    {label: 'Groups', icon: '', routerLink: '../tasks/groups/'+ this.taskId},
    {label: 'Attachments', icon: '', routerLink: '../tasks/attachments/'+ this.taskId},
    {label: 'Functional Analysis', icon: '', routerLink: '../tasks/functional-analysis/'+ this.taskId, disabled:false},
    {label: 'Health and Hygiene', icon: '' , routerLink: '../tasks/health-hygiene/'+ this.taskId},
    {label: 'H&H Criteria', icon: '', routerLink: '../tasks/health-hygiene-criteria/'+ this.taskId},
    {label: 'Environment', icon: '', routerLink: '../tasks/environment/'+ this.taskId},
    {label: 'PPE ', icon: '', routerLink: '../tasks/ppe/'+ this.taskId},
    {label: 'Human Factors ', icon: '', routerLink: '../tasks/human-factors/'+ this.taskId},
  ];

  private client: HttpClient;
  functionList$ = this.store.pipe(select(selectFunctionList));

  private baseURL: string;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string , @Inject('APP_CONFIG') appConfig: AppConfig,
  private store: Store<JobsAppState>
   ) {
    this.client = http;
    this.baseURL =  appConfig.ServiceUrl;
   }
   getTaskList(searchCriteria: SearchCriteria): Observable<TaskItem> {
    return this.client.post<TaskItem>(this.baseURL + 'SearchTasks', searchCriteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getUserDetails(): Observable<User> {
    if (!this._cachedUser) {
      return this.client.get<User>(this.baseURL + 'GetUserDetails')
        .pipe(
          retry(1),
          tap(u => {
            if (u.id > 0) {
              this._cachedUser = u;
            }
          }),
          catchError(this.handleError)
        );
    } else {
      return new Observable<User>((observer: any) => {
        observer.next(this._cachedUser);
      });
    }
  };
  saveFAAttachments(faId: number, attachment: Attachments): Observable<AttachmentResult>{
    return this.client.post<AttachmentResult>(this.baseURL + 'SaveFAAttachments/' + faId, attachment).pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  getTaskDetails(id:number): Observable<TaskDetails> {
    return this.client.get<TaskDetails>(this.baseURL + 'api/Task/TaskDetails/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveHHCriteria(id:number): Observable<void> {
    return this.client.get<void>(this.baseURL + 'DeleteHealthHygieneCriteria/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHealthHygieneResults(id:number, criteria: SearchCriteria): Observable<HealthHygieneInputItemView[]> {
    return this.client.post<HealthHygieneInputItemView[]>(this.baseURL + 'api/HealthHygiene/GetPagedHealthHygieneResults/' + id, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveHealthHygieneCriteria(mac:HealthHygieneCriteria): Observable<number> {
    return this.client.post<number>(this.baseURL + 'SaveHealthHygieneCriteria/', mac)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAllMainHealthHygieneBy(): Observable<HealthHygiene[]> {
    return this.client.get<HealthHygiene[]>(this.baseURL + 'api/HealthHygiene/GetAllMainHealthHygiene')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getOperators(id:number): Observable<Operators[]> {
    return this.client.get<Operators[]>(this.baseURL + 'GetOperators/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedFlags(taskId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Flags/GetSelectedFlagsTree/' + taskId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedPPE(taskId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/PPE/GetSelectedPPETree/' + taskId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedEnv(taskId:number): Observable<EnvironmentalTree[]> {
    return this.client.post<EnvironmentalTree[]>(this.baseURL + 'api/Enviromental/GetSelectedEnvTree/' + taskId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAllFunctionalAnalysisForTask(taskId:number, criteria: FASearchCriteria): Observable<FunctionalAnalysisResult> {
    return this.client.post<FunctionalAnalysisResult>(this.baseURL + 'api/FunctionalAnalysis/GetPagedFunctionalAnalysisForTask/' + taskId, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  getSelectedGroups(taskId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Groups/GetSelectedGroupsTree/' + taskId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedHFTree(taskId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/HumanFactors/GetSelectedHFTree/' + taskId, {})
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
  saveBatchSites(batchOptions: BatchOptionsView): Observable<string[]> {
    return this.client.post<string[]>(this.baseURL + 'api/BatchFunctions/SaveBatchOrgEntities' , batchOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveBatchRename(batchOptions: BatchOptionsView): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/BatchFunctions/SaveBatchRename' , batchOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveBatchCopy(batchOptions: BatchOptionsView): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/BatchFunctions/SaveBatchCopy' , batchOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getTask(id:number): Observable<Task> {
    return this.client.get<Task>(this.baseURL + 'api/Task/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getMainHealthHygieneByType(type:string): Observable<HealthHygiene[]> {
    return this.client.get<HealthHygiene[]>(this.baseURL + 'api/HealthHygiene/GetMainHealthHygiene/' + type)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getMainHealthHygieneResults(id:number): Observable<HealthHygieneResult[]> {
    return this.client.get<HealthHygieneResult[]>(this.baseURL + 'api/HealthHygiene/GetTaskMainHealthHygieneResults/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveMainHealthHygieneResult(id:number , result:HealthHygieneResult): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/HealthHygiene/SaveTaskHealthHygieneResults/' + id , result)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveFAHealthHygieneResult(id: number, result: HealthHygieneResult): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/HealthHygiene/SaveFAHealthHygieneResult/' + id , result)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveHealthHygiene(id:number): Observable<number> {
    return this.client.get<number>(this.baseURL + 'api/HealthHygiene/DeleteHealthHygieneResults/' + id)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  getAttachments(id:number, criteria:AttachmentSearchCriteria): Observable<AttachmentResult> {
    return this.client.post<AttachmentResult>(this.baseURL + 'GetAttachments/' + id, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAttachmentsOverview(id:number, criteria:AttachmentSearchCriteria): Observable<AttachmentResult> {
    return this.client.post<AttachmentResult>(this.baseURL + 'GetAttachmentsOverview/' + id, criteria)
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
  getAttachmentImages(ids:number[]): Observable<AttachmentImage[]> {
    return this.client.post<AttachmentImage[]>(this.baseURL + 'GetImageAttachments', ids)
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
  getEvents(): Observable<Event[]> {
    return this.client.get<Event[]>(this.baseURL + 'api/Task/GetEvents')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedTaskFAFlagsForFA(faId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Flags/GetSelectedTaskFAFlagsTreeForFA/' + faId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  GetFATreeForTask(faId:number): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetFATreeForTask/' + faId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAssociatedJobsForTask(taskId:number, criteria:SearchCriteria): Observable<AssociatedJob> {
    return this.client.post<AssociatedJob>(this.baseURL + 'api/AssociatedJobs/AssociatedJobsForTask/' + taskId , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPagedTaskSetsForJob(jobId:number, criteria:SearchCriteria): Observable<AssociatedJob> {
    return this.client.post<AssociatedJob>(this.baseURL + 'api/Task/GetPagedTaskSetsForJob/' + jobId, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPagedTaskSetsForJobDepartment(deptId:number, criteria:SearchCriteria): Observable<AssociatedJob> {
    return this.client.post<AssociatedJob>(this.baseURL + 'api/Task/GetPagedTaskSetsForJobDepartment/' + deptId, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedAssociatedTasksFlagsTree(taskId:number, criteria:SearchCriteria): Observable<FlagsTree[]> {
    return this.client.post<FlagsTree[]>(this.baseURL + 'api/Flags/GetSelectedAssociatedTasksFlagsTree/' + taskId , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedAssociatedTasksJobsFlagsTree(jobId:number, criteria:SearchCriteria): Observable<FlagsTree[]> {
    return this.client.post<FlagsTree[]>(this.baseURL + 'api/Flags/GetSelectedAssociatedTasksFlagsTree/' + jobId , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAllAssociatedTasksFlagsTree(): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetAssociatedTasksFlagsTree/')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getCurrentFunctionalAnalysis(taskId:number): Observable<FunctionalAnalysis> {
    return this.client.get<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/GetCurrentFunctionalAnalysis/' + taskId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFunctionalAnalysisList(taskId:number): Observable<FunctionalAnalysisResult> {
    return this.client.get<FunctionalAnalysisResult>(this.baseURL + 'api/FunctionalAnalysis/GetPagedFunctionalAnalysisForTask/' + taskId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFunctionalAnalysis(faId:number): Observable<FunctionalAnalysis> {
    return this.client.get<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/getFunctionalAnalysis/' + faId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTaskFunctionalAnalysis(taskId:number, functionalAnalysis:FunctionalAnalysis): Observable<FunctionalAnalysis> {
    return this.client.post<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/SaveTaskCurrentFunctionalAnalysis/' + taskId, functionalAnalysis)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveTaskFunctionalAnalysis(taskId:number): Observable<any>{
    return this.client.get<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/ArchiveFunctionalAnalysis/' + taskId)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  archiveTask(id:number): Observable<any> {
    return this.client.get<any>(this.baseURL + 'api/Task/ArchiveTask/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveNote(id:number): Observable<Jobs> {
    return this.client.get<Jobs>(this.baseURL + 'api/JobFitEntityNote/ArchiveNote/' + id)
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
  getMaterialHandlingGroups(): Observable<MaterialHandlingGroup[]> {
    return this.client.get<MaterialHandlingGroup[]>(this.baseURL + 'api/FunctionalAnalysis/GetMaterialHandlingGroups')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getMaterialHandlingFrequencies(): Observable<MaterialHandlingFrequency[]> {
    return this.client.get<MaterialHandlingFrequency[]>(this.baseURL + 'api/FunctionalAnalysis/GetMaterialHandlingFrequencies')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSettings(): Observable<any> {
    return this.client.get<any>(this.baseURL + 'api/FunctionalAnalysis/GetSettings')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getNotesList(id:number , criteria: NoteSearchCriteriaView): Observable<NotesResult> {
    return this.client.post<NotesResult>(this.baseURL + 'GetNotesList/' + id , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGripItems(): Observable<GripItemView[]> {
    return this.client.get<GripItemView[]>(this.baseURL + 'api/FunctionalAnalysis/GetGripItems')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGroupsTree(): Observable<GroupsTree[]> {
    return this.client.post<GroupsTree[]>(this.baseURL + 'api/Groups/GetGroupsTree', {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFlagsTree(): Observable<FlagsTree[]> {
    return this.client.post<FlagsTree[]>(this.baseURL + 'api/Flags/GetFlagsTree', {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPPETree(): Observable<PPETree[]> {
    return this.client.get<PPETree[]>(this.baseURL + 'api/PPE/GetPPETree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHumanFactorTree(): Observable<HumanFactorTree[]> {
    return this.client.get<HumanFactorTree[]>(this.baseURL + 'api/HumanFactors/GetHumanFactorsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getEnviromentalTree(jobId: number): Observable<EnvironmentalTree[]> {
    return this.client.get<EnvironmentalTree[]>(this.baseURL + 'api/Enviromental/GetEnviromentalTree' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSitesTree(sites:SiteTree[]): Observable<DeptTree[]> {
    return this.client.post<DeptTree[]>(this.baseURL + 'api/Company/GetAvailableDeptTree', sites)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getTaskSitesTree(): Observable<SiteTree[]> {
    return this.client.post<any[]>(this.baseURL + 'api/OrgEntity/GetAvailableSiteTree', {})
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  getSiteTreeForTask(taskId:number): Observable<SiteTree[]> {
    return this.client.get<SiteTree[]>(this.baseURL + 'api/OrgEntity/GetSiteTreeForTask/' + taskId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedTaskSiteTree(taskId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/OrgEntity/GetSelectedTaskSiteTree/' + taskId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTask(task:Task): Observable<Task> {
    return this.client.post<Task>(this.baseURL + 'api/Task/SaveTask', task)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  printList(searchCriteria: SearchCriteria): Observable<any> {
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
       //'responseType'  : 'blob' as 'json'        //This also worked
    };
    return this.client.post<any>(this.baseURL + 'GetTaskListReport', searchCriteria, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  quickSearchJobs(term:string): Observable<Jobs[]> {
    return this.client.get<Jobs[]>(this.baseURL + 'api/Jobs/QuickSearchJobs/' + term)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  quickSearchTasks(term:string): Observable<Task[]> {
    return this.client.get<Task[]>(this.baseURL + 'api/Task/QuickSearchJobs/' + term)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTaskSet(task:TaskJobs): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/AssociatedJobs/SaveTaskSet', task)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  combineTasks(combineOptions: CombineOptionsView): Observable<CombineOptionsView> {
    return this.client.post<CombineOptionsView>(this.baseURL + 'api/Task/CombineTasks' , combineOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveAssociatedJob(id:number) {
    return this.client.get<number>(this.baseURL + 'api/AssociatedJobs/ArchiveAssociatedJob/' + id, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  saveTaskNote(taskID:number, note:Notes): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/JobFitEntityNote/SaveTaskJobNote/' + taskID, note)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveAttachment(id:number ,attachment:Attachments): Observable<number> {
    return this.client.post<number>(this.baseURL + 'SaveTaskAttachments/' + id, attachment)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  updateAttachment(id:number , attachment:Attachments): Observable<number> {
    return this.client.post<number>(this.baseURL + 'UpdateAttachment/' + id, attachment)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAttachment(id:number): Observable<any> {
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
       //'responseType'  : 'blob' as 'json'        //This also worked
    };
    return this.client.get<any>(this.baseURL + 'GetAttachment/' + id,httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getRiskTools(id:number): Observable<RiskTool[]> {
    return this.client.get<RiskTool[]>(this.baseURL + 'api/FunctionalAnalysis/GetRiskTools/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFunctionalAnalysisForRisks(id:number): Observable<FunctionalAnalysis> {
    return this.client.get<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/GetFunctionalAnalysisForRisks/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTaskFlags(id:number , flags:FlagsTree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Flags/SaveFlags/' + id, flags)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedTaskFAFlags(taskId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Flags/GetSelectedTasksFAFlagsTree/' + taskId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  saveTaskGroups(id:number , groups:GroupsTree[]): Observable<any> {
    return this.client.post<any>(this.baseURL + 'api/Groups/SaveGroups/' + id, groups)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTaskPPE(id:number , ppeTree:PPETree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/PPE/SavePPE/' + id, ppeTree)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTaskHumanFactors(id:number , hf:HumanFactorTree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/HumanFactors/SaveHumanFactors/' + id, hf)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveFlagNoteEntity(id:number , flagNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Flags/SaveFlagNotes/' + id, flagNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveGroupNoteEntity(id:number , groupNote:CheckedEntity): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/Groups/SaveGroupNotes/' + id, groupNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveEnvNoteEntity(id:number , envNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Enviromental/SaveEnvNotes/' + id, envNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  getFlagForEntity(flagId:number , type:CheckedEntity): Observable<FlagsTree[]> {
    return this.client.post<FlagsTree[]>(this.baseURL + 'api/Flags/GetFlagsForEntity/' + flagId, type)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  saveFlagNote(note:Note): Observable<Note> {
    return this.client.post<Note>(this.baseURL + 'flagNotes', note)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveTaskEnvironmentalFactors(id:number , ev:EnvironmentalTree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Enviromental/SaveEnviromental/' + id, ev)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  savePPENoteEntity(id:number , ppeNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/PPE/SavePPENotesEntity/' + id, ppeNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveHFNoteEntity(id:number , hfNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/HumanFactors/SaveHFNotesEntity/' + id, hfNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

///////////////////////////////////////////////////////////////

  getTasks(): Observable<Task[]> {
    return this.client.get<Task[]>(this.baseURL + 'tasks')
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
  getPosturalAssessment(id: number): Observable<Postural> {
    return this.client.get<Postural>(this.baseURL + 'postural')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getTreeExample(): Observable<any> {
    return this.client.get<any[]>('https://primeng-treeselection-demo.stackblitz.io/assets/files.json')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAssociatedJobs(taskId: number): Observable<any> {
    return this.client.get<Task[]>(this.baseURL + 'associated-jobs/?taskId=' + taskId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAssociatedJob(jobId: number): Observable<TaskJobs> {
    return this.client.get<TaskJobs>(this.baseURL + 'associated-jobs/?jobId=' + jobId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveAssociatedJob(job: TaskJobs): Observable<any> {
    return this.client.post(this.baseURL + 'associated-jobs', job).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  updateAssociatedJob(jobId: number, job:TaskJobs): Observable<any> {
    return this.client.put<any>(this.baseURL + 'associated-jobs/' + jobId, job , {}).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  updateTask(taskId: number, task:Task | undefined): Observable<any> {
    return this.client.put<any>(this.baseURL + 'tasks/' + taskId, task , {}).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  updateTaskNote(note:Notes): Observable<any> {
    return this.client.post<any>(this.baseURL + 'api/JobFitEntityNote/UpdateJobFitNote', note).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getNotes(taskId: number): Observable<Notes[]> {
    return this.client.get<Notes[]>(this.baseURL + 'api/JobFitEntityNote/GetJobFitentityNotes/' + taskId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getProviders(): Observable<Provider[]> {
    return this.client.get<Provider[]>(this.baseURL + 'providers')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getProvider(id: number): Observable<Provider> {
    return this.client.get<Provider>(this.baseURL + 'api/Task/GetProvider/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  getFlags(): Observable<Flags[]> {
    return this.client.get<Flags[]>(this.baseURL + 'available-flags')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGroups(): Observable<Groups[]> {
    return this.client.get<Groups[]>(this.baseURL +  'available-groups')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobListNames(): Observable<JobListName[]> {
    return this.client.get<JobListName[]>(this.baseURL + 'jobListNames')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFlagNote(flagId: string): Observable<any> {
    return this.client.get<any>(this.baseURL + 'flagNotes/?flagId=' + flagId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  updateFlagNote(noteId: number, note:Note): Observable<any> {
    return this.client.put<any>(this.baseURL + 'flagNotes/' + noteId, note , {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGroupNote(groupId: string): Observable<any> {
    return this.client.get<any>(this.baseURL + 'groupNotes/?groupId=' + groupId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveGroupNote(note:Note): Observable<Note> {
    return this.client.post<Note>(this.baseURL + 'groupNotes', note)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  updateGroupNote(noteId: number, note:Note): Observable<any> {
    return this.client.put<any>(this.baseURL + 'groupNotes/' + noteId, note , {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getCustomerSettings(): Observable<CustomerCompanySettings> {
    return this.client.get<CustomerCompanySettings>(this.baseURL + 'api/FunctionalAnalysis/GetSettingsView')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
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
  setMenu(taskId: number) {
    var result = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      this.menuList = [
        {label: 'Task Details', icon: '',  
          routerLink: result.Function[EFunctions.ViewTasks] ? '../tasks/tasks-details/' + taskId : undefined,
          command: () => this.goToRoute('../tasks/tasks-details/' + taskId, result.Function[EFunctions.ViewTasks]),
          styleClass: result.Function[EFunctions.ViewTasks] ? '': 'disabled-side' 
        },
        {label: 'Associated Jobs', icon: '', 
          routerLink: result.Function[EFunctions.ViewJobs] ? '../tasks/associated-jobs/' + taskId: undefined, 
          command: () => this.goToRoute('../tasks/associated-jobs/' + taskId, result.Function[EFunctions.ViewJobs]),
          styleClass: result.Function[EFunctions.ViewTasks] ? '': 'disabled-side' 
        },
        {label: 'Notes', icon: '' , 
          routerLink: result.Function[EFunctions.ViewNotes] ? '../tasks/notes/' + taskId: undefined, 
          command: () => this.goToRoute('../tasks/notes/' + taskId, result.Function[EFunctions.ViewNotes]),
          styleClass: result.Function[EFunctions.ViewNotes] ? '': 'disabled-side' 
        },
        {label: 'Flags', icon: '', 
          routerLink: result.Function[EFunctions.ViewFlags] ? '../tasks/flags/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/flags/'+ taskId, result.Function[EFunctions.ViewFlags]),
          styleClass: result.Function[EFunctions.ViewFlags] ? '': 'disabled-side' 
        },
        {label: 'Groups', icon: '', 
          routerLink: result.Function[EFunctions.ViewGroups] ? '../tasks/groups/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/groups/'+ taskId, result.Function[EFunctions.ViewGroups]),
          styleClass: result.Function[EFunctions.ViewGroups] ? '': 'disabled-side' 
        },
        {label: 'Attachments', icon: '', 
          routerLink: result.Function[EFunctions.ViewAttachments] ? '../tasks/attachments/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/attachments/'+ taskId, result.Function[EFunctions.ViewAttachments]),
          styleClass: result.Function[EFunctions.ViewAttachments] ? '': 'disabled-side' 
        },
        {label: 'Functional Analysis', icon: '', 
          routerLink: result.Function[EFunctions.ViewFunctionalAnalyses] ? '../tasks/functional-analysis/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/functional-analysis/'+ taskId, result.Function[EFunctions.ViewFunctionalAnalyses]),
          styleClass: result.Function[EFunctions.ViewFunctionalAnalyses] ? '': 'disabled-side' 
        },
        {label: 'Health and Hygiene', icon: '' , 
          routerLink: result.Function[EFunctions.ViewHealthHygienes] ? '../tasks/health-hygiene/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/health-hygiene/'+ taskId, result.Function[EFunctions.ViewHealthHygienes]),
          styleClass: result.Function[EFunctions.ViewHealthHygienes] ? '': 'disabled-side' 
        },
        {label: 'H&H Criteria', icon: '', 
          routerLink: result.Function[EFunctions.ViewHealthHygienes] ? '../tasks/health-hygiene-criteria/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/health-hygiene-criteria/'+ taskId, result.Function[EFunctions.ViewHealthHygienes]),
          styleClass: result.Function[EFunctions.ViewHealthHygienes] ? '': 'disabled-side' 
        },
        {label: 'Environment', icon: '', 
          routerLink: result.Function[EFunctions.ViewEnvironmentalFactors] ? '../tasks/environment/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/environment/'+ taskId, result.Function[EFunctions.ViewEnvironmentalFactors]),
          styleClass: result.Function[EFunctions.ViewEnvironmentalFactors] ? '': 'disabled-side' 
        },
        {label: 'PPE ', icon: '', 
          routerLink: result.Function[EFunctions.ViewPPEs] ? '../tasks/ppe/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/ppe/'+ taskId, result.Function[EFunctions.ViewPPEs]),
          styleClass: result.Function[EFunctions.ViewPPEs] ? '': 'disabled-side' 
        },
        {label: 'Human Factors ', icon: '', 
          routerLink: result.Function[EFunctions.ViewHumanFactors] ? '../tasks/human-factors/'+ taskId: undefined, 
          command: () => this.goToRoute('../tasks/human-factors/'+ taskId, result.Function[EFunctions.ViewHumanFactors]),
          styleClass: result.Function[EFunctions.ViewHumanFactors] ? '': 'disabled-side' 
        },
      ];
  }
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
  getNextAssessmentSchedule(id:number | undefined): Observable<NextAssesmentSchedule[]> {
    return this.client.get<NextAssesmentSchedule[]>(this.baseURL + 'api/FunctionalAnalysis/GetNextAssessmentSchedule/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHealthHygieneCriteriaList(id:number, searchCriteria: SearchCriteria): Observable<HHCriteriaResult> {
    return this.client.post<HHCriteriaResult>(this.baseURL + 'GetHealthHygieneCriterias/' + id, searchCriteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  getHealthHygienes(searchCriteria: SearchCriteria): Observable<HealthHygieneResults> {
    return this.client.post<HealthHygieneResults>(this.baseURL + 'api/HealthHygiene/GetPagedHealthHygiene/', searchCriteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveNextAssessmentSchedule(id: number): Observable<any>{
    return this.client.get<any>(this.baseURL + 'api/FunctionalAnalysis/ArchiveNextAssessmentSchedule/' + id)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  saveNextAssessmentSchedule(taskId:number, nextAssessmentSchedule:NextAssesmentSchedule): Observable<NextAssesmentSchedule> {
    return this.client.post<NextAssesmentSchedule>(this.baseURL + 'api/FunctionalAnalysis/SaveNextAssessmentScheduleTask/' + taskId, nextAssessmentSchedule)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getTaskHealthHygieneNextAssessmentSchedule(id:number): Observable<HealthHygieneNextAssessmentSchedule[]> {
    return this.client.get<HealthHygieneNextAssessmentSchedule[]>(this.baseURL + 'api/HealthHygiene/GetTaskNextAssessmentSchedule/' + id)
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
  saveTaskHealthHygieneNextAssessmentSchedule(taskId:number, nextAssessmentSchedule:HealthHygieneNextAssessmentSchedule): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/HealthHygiene/SaveTaskNextAssessmentSchedule/' + taskId, nextAssessmentSchedule)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFANextDueDateSetting(type:string): Observable<NextDueDateSetting> {
    return this.client.get<NextDueDateSetting>(this.baseURL + 'api/FunctionalAnalysis/GetNextDueDateSetting/' + type)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
}
