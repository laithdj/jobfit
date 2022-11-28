import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { FASearchCriteria, FunctionalAnalysis, FunctionalAnalysisResult } from '../shared/models/functional-analysis.model';
import { Event, SearchCriteria, WorkersSearchCriteria } from '../shared/models/search.criteria.model';
import { CombineOptionsView, HealthHygieneNextAssessmentSchedule, NextAssesmentSchedule, WorkerItem } from '../shared/models/worker.model';
import { AttachmentResult, AttachmentSearchCriteria } from '../shared/models/attachment.result.model';
import { Attachments } from '../shared/models/attachments.model';
import { Note } from '../shared/models/note.model';
import { FlagsTree } from '../shared/models/flags.models';
import { Notes } from '../shared/models/notes.model';
import { NoteType } from '../shared/models/noteType.model';
import { Provider } from '../shared/models/provider.model';
import { Worker } from '../shared/models/worker.model';
import { PosturalToleranceGroup } from '../shared/models/functional-analysis.model';
import { Groups, GroupsTree } from '../shared/models/groups.models';
import { MaterialHandlingGroup } from '../shared/models/materialHandling.model';
import { HealthHygiene, HealthHygieneResult, NextDueDateSetting } from '../shared/models/health-hygeine.model';
import { AppConfig } from '../app.config';
import { HumanFactorTree } from '../shared/models/human-factors.model';
import { EnvironmentalTree } from '../shared/models/enviromental.model';
import { PPETree } from '../shared/models/ppe.model';
import { CheckedEntity } from '../shared/models/checkedEntity.model';
import { GripData, GripItemView } from '../shared/models/grips.model';
import { RiskTool } from '../shared/models/risk.ratings.model';
import { Postural } from '../shared/models/postural-tolerance.model';
import { SiteTree } from '../shared/models/sites.model';
import { DeptTree } from '../shared/models/department.model';
import { EmploymentResultView, EmploymentSearchCriteria, JobFitResultView, JobFitScoreView, JobFitSummaryScoreResult, Roster } from '../shared/models/employment.model';
import { select, Store } from '@ngrx/store';
import { selectFunctionList } from '../store/job-fit.selectors';
import { JobsAppState } from '../store/jobs-store/jobs.reducers';
import { BatchOptionsView } from '../shared/models/batch.model';
import { EFunctions } from '../shared/models/user.model';
import { SetError } from '../app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from '../shared/models/alertPopUp.model';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  workerId = 0;
  menuList: MenuItem[] = [
    {label: 'Worker Details', icon: '',  routerLink: '../workers/workers-details/' + this.workerId},
    {label: 'Employment', icon: '',  routerLink: '../workers/employment/' + this.workerId},
    {label: 'Notes', icon: '',  routerLink: '../workers/notes/' + this.workerId},
    {label: 'Flags', icon: '',  routerLink: '../workers/flags/' + this.workerId},
    {label: 'Groups', icon: '',  routerLink: '../workers/groups/' + this.workerId},
    {label: 'Attachments', icon: '',  routerLink: '../workers/attachments/' + this.workerId},
    {label: ''},
    {label: 'Functional Analysis', icon: '', routerLink: '../workers/functional-analysis/' + this.workerId, disabled:false},
    {label: 'Health and Hygiene', icon: '' , routerLink: '../workers/health-hygiene/'+ this.workerId},
    {label: 'Environment', icon: '',  routerLink: '../workers/environment/' + this.workerId},
    {label: 'PPE ', icon: '', routerLink: '../workers/ppe/'+ this.workerId},
    {label: 'Human Factors ', icon: '', routerLink: '../workers/human-factors/'+ this.workerId},
    {label: 'JobFit Scores', icon: '',  routerLink: '../workers/jobFit-scores/' + this.workerId},
  ];

  private client: HttpClient;
  functionList$ = this.store.pipe(select(selectFunctionList));

  private baseURL: string;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string , @Inject('APP_CONFIG') appConfig: AppConfig,
  private store: Store<JobsAppState>) {
    this.client = http;
    this.baseURL = appConfig.ServiceUrl;
  }

   getWorkerDetails(id: number): Observable<Worker>{
    return this.client.get<Worker>(this.baseURL + 'api/Workers/GetWorkerDetails/' + id).pipe(
      retry(1),
      catchError(this.handleError)
    );
   }
   getSelectedWorkerFAFlags(workerId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Flags/GetSelectedWorkerFAFlagsTree/' + workerId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedWorkerFAFlagsForFA(faId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Flags/GetSelectedWorkerFAFlagsTreeForFA/' + faId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  GetFATreeForWorker(faId:number): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetFATreeForWorker/' + faId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
   viewWorkerDetails(id:  number): Observable <Worker>{
     return this.client.get<Worker>(this.baseURL+ 'Worker' + id).pipe(
       retry(1),
       catchError(this.handleError)
     );
   }
  getGripItems(): Observable<GripItemView[]> {
    return this.client.get<GripItemView[]>(this.baseURL + 'api/FunctionalAnalysis/GetGripItems')
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

  archiveCurrentFunctionalAnalysis(id:number): Observable<any> {
    return this.client.get<any>(this.baseURL + 'api/FunctionalAnalysis/ArchiveFunctionalAnalysis/' + id)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  archiveCurrentFunctionalAnalysisList(ids:number[]): Observable<any> {
    return this.client.post<any>(this.baseURL + 'ArchiveFunctionalAnalysisList/', ids)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
   saveFlags(workerId: number, selectFiles: FlagsTree[]): Observable<boolean>{
     return this.client.post<boolean>(this.baseURL + "api/Flags/SaveWorkerFlags/" + workerId, selectFiles).pipe(
       retry(1),
       catchError(this.handleError)
     );
   };
   getSelectedWorkerFlags(workerId:number): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetSelectedWorkerFlagsTree/' + workerId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedWorkerGroups(workerId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Groups/GetSelectedWorkersGroupsTree/' + workerId, {})
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
  getSelectedWorkerHFTree(workerId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/HumanFactors/GetSelectedWorkersHFTree/' + workerId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedWorkerPPETree(workerId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/PPE/GetSelectedWorkerPPETree/' + workerId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  printList(searchCriteria: WorkersSearchCriteria): Observable<any> {
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
       //'responseType'  : 'blob' as 'json'        //This also worked
    };
    return this.client.post<any>(this.baseURL + 'GetWorkerListReport', searchCriteria, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getSelectedWorkerEnvTree(workerId:number): Observable<any[]> {
    return this.client.post<any[]>(this.baseURL + 'api/Enviromental/GetSelectedWorkerEnvTree/' + workerId, {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveFlagNoteEntity(id:number , flagNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Flags/SaveWorkerJobNote/' + id, flagNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  savefaFlagNoteEntity(id:number , flagNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + "api/Flags/SaveFlagNotes/" + id, flagNote).pipe(
      retry(1),
      catchError(this.handleError)
    );

  };
  getAllFunctionalAnalysisForWorker(workerId:number, criteria: FASearchCriteria): Observable<FunctionalAnalysisResult> {
    return this.client.post<FunctionalAnalysisResult>(this.baseURL + 'api/FunctionalAnalysis/GetPagedFunctionalAnalysisForWorker/' + workerId, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getEvents(): Observable<Event[]> {
    return this.client.get<Event[]>(this.baseURL + 'api/Workers/GetEvents')
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
  saveGroupNote(note:CheckedEntity): Observable<Note> {
    return this.client.post<Note>(this.baseURL + 'groupNotes', note)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  updateGroupNote(noteId: number, note:CheckedEntity): Observable<any> {
    return this.client.put<any>(this.baseURL + 'groupNotes/' + noteId, note , {})
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getWorkerAttachments(id:number, criteria:AttachmentSearchCriteria): Observable<AttachmentResult> {
    return this.client.post<AttachmentResult>(this.baseURL + 'GetWorkerAttachments/' + id, criteria)
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
  getWorkerMainHealthHygieneResults(id:number): Observable<HealthHygieneResult[]> {
    return this.client.get<HealthHygieneResult[]>(this.baseURL + 'api/HealthHygiene/GetWorkersMainHealthHygieneResults/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getWorkerHealthHygieneNextAssessmentSchedule(id:number): Observable<HealthHygieneNextAssessmentSchedule[]> {
    return this.client.get<HealthHygieneNextAssessmentSchedule[]>(this.baseURL + 'api/HealthHygiene/GetWorkerNextAssessmentSchedule/' + id)
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
  getWorkerFAHealthHygieneResults(id:number): Observable<HealthHygieneResult[]> {
    return this.client.get<HealthHygieneResult[]>(this.baseURL + 'api/HealthHygiene/GetWorkersFAHealthHygieneResults/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getNextAssessmentSchedule(id:number | undefined): Observable<NextAssesmentSchedule[]> {
    return this.client.get<NextAssesmentSchedule[]>(this.baseURL + 'api/FunctionalAnalysis/GetNextAssessmentSchedule/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerMainHealthHygieneResult(id:number , result:HealthHygieneResult): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/HealthHygiene/SaveWorkerHealthHygieneResult/' + id , result)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  DeleteHealthHygieneResult(id:number){
    return this.client.get(this.baseURL + 'api/HealthHygiene/DeleteHealthHygieneResults/' + id)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  saveAttachments(id: number, attachment: Attachments): Observable<number>{
    return this.client.post<number>(this.baseURL + 'SaveWorkerAttachments/' + id, attachment).pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  saveFAAttachments(faId: number, attachment: Attachments): Observable<AttachmentResult>{
    return this.client.post<AttachmentResult>(this.baseURL + 'SaveFAAttachments/' + faId, attachment).pipe(
      retry(1),
      catchError(this.handleError)
    );
  };
  getAttachment(id:number): Observable<any> {
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
    };
    return this.client.get<any>(this.baseURL + 'GetAttachment/' + id,httpOptions)
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
  getWorkersList(searchCriteria: WorkersSearchCriteria): Observable<WorkerItem> {
    return this.client.post<WorkerItem>(this.baseURL + 'SearchWorkers', searchCriteria)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getNotes(workerId: number): Observable<Notes[]> {
    return this.client.get<Notes[]>(this.baseURL + 'api/JobFitEntityNote/GetJobFitEntityNotes/' + workerId)
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
  saveWorkerNote(workerId:number , note:Notes): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/JobFitEntityNote/SaveWorkerJobNote/' + workerId, note)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveHumanFactorNoteEntity(id:number , humanFactorNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/HumanFactors/SaveHumanFactorNotes/' + id, humanFactorNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  savePPENoteEntity(id:number , ppeNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/PPE/SavePPENotes/' + id, ppeNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveEnvironmentalNoteEntity(id:number , envNote:CheckedEntity): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Enviromental/SaveEnvironmentalNotes/' + id, envNote)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGroups(): Observable<Groups[]> {
    return this.client.get<Groups[]>(this.baseURL + 'api/Groups/GetWorkersGroupsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerGroups(id:number , groups:GroupsTree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/Groups/SaveWorkerGroups/' + id, groups)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getWorkerGroupsTree(id: number): Observable<GroupsTree[]> {
    return this.client.get<GroupsTree[]>(this.baseURL + 'api/Groups/GetWorkerGroupsTree/' + id)
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
  getSettings(): Observable<any> {
    return this.client.get<any>(this.baseURL + 'api/FunctionalAnalysis/GetSettings')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getWorkerCurrentFunctionalAnalysis(workerId:number): Observable<FunctionalAnalysis> {
    return this.client.get<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/GetWorkersCurrentFunctionalAnalysis/' + workerId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getWorkersFlagTree(): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetWorkersFlagsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getFAWorkerFlagTree(): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetFAWorkersFlagsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getWorkerEmploymentFlagTree(): Observable<FlagsTree[]> {
    return this.client.get<FlagsTree[]>(this.baseURL + 'api/Flags/GetWorkerEmploymentFlagsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getWorkersGroupTree(): Observable<GroupsTree[]> {
    return this.client.get<GroupsTree[]>(this.baseURL + 'api/Groups/GetWorkersGroupsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveWorker(id:number): Observable<Worker> {
    return this.client.get<Worker>(this.baseURL + 'api/Workers/ArchiveWorker/' + id)
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
  archiveNextAssessmentSchedule(id: number): Observable<any>{
    return this.client.get<any>(this.baseURL + 'api/FunctionalAnalysis/ArchiveNextAssessmentSchedule/' + id)
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
  combineWorkers(combineOptions: CombineOptionsView): Observable<CombineOptionsView> {
    return this.client.post<CombineOptionsView>(this.baseURL + 'api/Workers/CombineWorkers' , combineOptions)
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
  saveWorker(worker:Worker): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/Workers/SaveWorker', worker)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  checkDuplicateWorkers(worker:Worker): Observable<WorkerItem> {
    return this.client.post<WorkerItem>(this.baseURL + 'api/Workers/CheckDuplicates', worker)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getHumanFactorTree(): Observable<HumanFactorTree[]> {
    return this.client.get<HumanFactorTree[]>(this.baseURL + 'api/HumanFactors/GetWorkerHumanFactorsTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerHumanFactors(id:number , hf:HumanFactorTree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/HumanFactors/SaveWorkerHumanFactors/' + id, hf)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getEnviromentalTree(): Observable<EnvironmentalTree[]> {
    return this.client.get<EnvironmentalTree[]>(this.baseURL + 'api/Enviromental/GetWorkersEnviromentalTree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerEnvironmentalFactors(id:number , ev:EnvironmentalTree[]): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'api/Enviromental/SaveWorkerEnviromental/' + id, ev)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerPPE(id:number , ppeTree:PPETree[]): Observable<void> {
    return this.client.post<void>(this.baseURL + 'api/PPE/SaveWorkerPPE/' + id, ppeTree)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPPETree(): Observable<PPETree[]> {
    return this.client.get<PPETree[]>(this.baseURL + 'api/PPE/GetWorkerPPETree')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerFunctionalAnalysis(workerId:number, functionalAnalysis:FunctionalAnalysis): Observable<FunctionalAnalysis> {
    return this.client.post<FunctionalAnalysis>(this.baseURL + 'api/FunctionalAnalysis/SaveWorkerCurrentFunctionalAnalysis/' + workerId, functionalAnalysis)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerNextAssessmentSchedule(workerId:number, nextAssessmentSchedule:NextAssesmentSchedule): Observable<NextAssesmentSchedule> {
    return this.client.post<NextAssesmentSchedule>(this.baseURL + 'api/FunctionalAnalysis/SaveNextAssessmentSchedule/' + workerId, nextAssessmentSchedule)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  saveWorkerHealthHygieneNextAssessmentSchedule(workerId:number, nextAssessmentSchedule:HealthHygieneNextAssessmentSchedule): Observable<number> {
    return this.client.post<number>(this.baseURL + 'api/HealthHygiene/SaveWorkerNextAssessmentSchedule/' + workerId, nextAssessmentSchedule)
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
  getJobFitResults(): Observable<JobFitResultView[]> {
    return this.client.get<JobFitResultView[]>(this.baseURL + 'api/Employment/GetJobFitResults')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobFitScores(): Observable<JobFitScoreView[]> {
    return this.client.get<JobFitScoreView[]>(this.baseURL + 'api/Employment/GetJobFitScores')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPagedEmploymentsForWorker(id: number, criteria: EmploymentSearchCriteria): Observable<EmploymentResultView> {
    return this.client.post<EmploymentResultView>(this.baseURL + 'api/Employment/GetPagedEmploymentsForWorker/' + id , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  GetPagedWorkersEmployedInDepartment(departmentId: number, criteria: EmploymentSearchCriteria): Observable<WorkerItem> {
    return this.client.post<WorkerItem>(this.baseURL + 'api/Workers/GetPagedWorkersEmployedInDepartment/' + departmentId , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAllEmploymentsForWorker(id: number, criteria: SearchCriteria): Observable<EmploymentResultView> {
    return this.client.post<EmploymentResultView>(this.baseURL + 'api/Employment/GetAllEmploymentsForWorker/' + id , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getAllEmploymentsForJobs(id: number, criteria: EmploymentSearchCriteria): Observable<EmploymentResultView> {
    return this.client.post<EmploymentResultView>(this.baseURL + 'api/Employment/GetAllEmploymentsForJob/' + id , criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getRosterForOrgEntityTree(id: number): Observable<Roster[]> {
    return this.client.get<Roster[]>(this.baseURL + 'api/Employment/GetRosterForOrgEntityTree/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getDepartment(id: number): Observable<DeptTree> {
    return this.client.get<DeptTree>(this.baseURL + 'api/Employment/GetDepartment/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getJobFitSummaryScoreList(workerId: number, criteria: SearchCriteria): Observable<JobFitSummaryScoreResult> {
    return this.client.post<JobFitSummaryScoreResult>(this.baseURL + 'api/JobFit/GetPagedWorkerJobFitSummaryScores/' + workerId, criteria)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveEmployment(id:number): Observable<boolean> {
    return this.client.get<boolean>(this.baseURL + 'ArchiveEmployment/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveJobFitSummaryScoreList(id: number): Observable<void> {
    return this.client.get<void>(this.baseURL + 'api/JobFit/DeleteJobFitSummaryScore/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  employWorker(id: number): Observable<number> {
    return this.client.get<number>(this.baseURL + 'api/Employment/EmployWorker/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveNote(id:number): Observable<any> {
    return this.client.get<any>(this.baseURL + 'api/JobFitEntityNote/ArchiveNote/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getGripData(workerId: number): Observable<GripData[]>{
    return this.client.get<GripData[]>(this.baseURL + 'api/FunctionalAnalysis/GetGripData/' + workerId)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
   }
   archiveAttachment(id:number): Observable<number> {
    return this.client.get<number>(this.baseURL + 'api/Attachments/ArchiveAttachment/' + id)
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
  setMenu(workerId: number){
    var result = JSON.parse(localStorage.getItem("authorisedList") ?? "");

      this.menuList = [
        {label: 'Worker Details', icon: '', 
          routerLink: result.Function[EFunctions.ViewWorkers] ? '../workers/workers-details/' + workerId : undefined,
          command: () => this.goToRoute('../workers/workers-details/' + workerId, result.Function[EFunctions.ViewWorkers]),
          styleClass: result.Function[EFunctions.ViewWorkers] ? '': 'disabled-side' 
        },
        {label: 'Employment', icon: '',  
          routerLink: result.Function[EFunctions.ViewEmployments] ? '../workers/employment/' + workerId : undefined,
          command: () => this.goToRoute('../workers/employment/' + workerId, result.Function[EFunctions.ViewEmployments]),
          styleClass: result.Function[EFunctions.ViewEmployments] ? '': 'disabled-side' 
        },
        {label: 'Notes', icon: '', 
          routerLink: result.Function[EFunctions.ViewNotes] ? '../workers/notes/' + workerId : undefined,
          command: () => this.goToRoute('../workers/notes/' + workerId, result.Function[EFunctions.ViewNotes]),
          styleClass: result.Function[EFunctions.ViewNotes] ? '': 'disabled-side' 
        },
        {label: 'Flags', icon: '', 
          routerLink: result.Function[EFunctions.ViewFlags] ? '../workers/flags/' + workerId : undefined,
          command: () => this.goToRoute('../workers/flags/' + workerId, result.Function[EFunctions.ViewFlags]),
          styleClass: result.Function[EFunctions.ViewFlags] ? '': 'disabled-side'
        },
        {label: 'Groups', icon: '', 
          routerLink: result.Function[EFunctions.ViewGroups] ? '../workers/groups/' + workerId : undefined,
          command: () => this.goToRoute('../workers/groups/' + workerId, result.Function[EFunctions.ViewGroups]),
          styleClass: result.Function[EFunctions.ViewGroups] ? '': 'disabled-side'
        },
        {label: 'Attachments', icon: '', 
          routerLink: result.Function[EFunctions.ViewAttachments] ? '../workers/attachments/' + workerId : undefined,
          command: () => this.goToRoute('../workers/attachments/' + workerId, result.Function[EFunctions.ViewAttachments]),
          styleClass: result.Function[EFunctions.ViewAttachments] ? '': 'disabled-side'
        },
        {label:''},
        {label: 'Functional Analysis', icon: '', 
          routerLink: result.Function[EFunctions.ViewFunctionalAnalyses] ? '../workers/functional-analysis/' + workerId : undefined,
          command: () => this.goToRoute('../workers/functional-analysis/' + workerId, result.Function[EFunctions.ViewFunctionalAnalyses]),
          styleClass: result.Function[EFunctions.ViewFunctionalAnalyses] ? '': 'disabled-side'
        },
        {label: 'Health and Hygiene', icon: '' , 
          routerLink: result.Function[EFunctions.ViewHealthHygienes] ? '../workers/health-hygiene/' + workerId : undefined,
          command: () => this.goToRoute('../workers/health-hygiene/' + workerId, result.Function[EFunctions.ViewHealthHygienes]),
          styleClass: result.Function[EFunctions.ViewHealthHygienes] ? '': 'disabled-side'
        },
        {label: 'Environment', icon: '',  
          routerLink: result.Function[EFunctions.ViewEnvironmentalFactors] ? '../workers/environment/' + workerId : undefined,
          command: () => this.goToRoute('../workers/environment/' + workerId, result.Function[EFunctions.ViewEnvironmentalFactors]),
          styleClass: result.Function[EFunctions.ViewEnvironmentalFactors] ? '': 'disabled-side'
        },
        {label: 'PPE ', icon: '', 
          routerLink: result.Function[EFunctions.ViewPPEs] ? '../workers/ppe/' + workerId : undefined,
          command: () => this.goToRoute('../workers/ppe/' + workerId, result.Function[EFunctions.ViewPPEs]),
          styleClass: result.Function[EFunctions.ViewPPEs] ? '': 'disabled-side'
        },
        {label: 'Human Factors ', icon: '', 
          routerLink: result.Function[EFunctions.ViewHumanFactors] ? '../workers/human-factors/' + workerId : undefined,
          command: () => this.goToRoute('../workers/human-factors/' + workerId, result.Function[EFunctions.ViewHumanFactors]),
          styleClass: result.Function[EFunctions.ViewHumanFactors] ? '': 'disabled-side'
        },
        {label: 'JobFit Scores', icon: '',  
          routerLink: result.Function[EFunctions.ViewJobFitScores] ? '../workers/jobFit-scores/' + workerId : undefined,
          command: () => this.goToRoute('../workers/jobFit-scores/' + workerId, result.Function[EFunctions.ViewJobFitScores]),
          styleClass: result.Function[EFunctions.ViewJobFitScores] ? '': 'disabled-side'
        },
       ]
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
    }
    return throwError(errorMessage);
  };

}
