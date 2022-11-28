import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { MenuItem, TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { JobsService } from 'src/app/jobs/jobs.service';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { JobFitScoreView, JobFitSummaryScore } from 'src/app/shared/models/employment.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { JobFitOptions, JobFitSummary } from 'src/app/shared/models/job-fitting.model';
import { CombineOptionsView, Jobs, SupplementaryEntity } from 'src/app/shared/models/jobs.model';
import { Provider } from 'src/app/shared/models/provider.model';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { AdvancedSearch, Event, SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Task, TaskItem } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { FetchFlagTree, FetchGroupTree, FetchSiteTree, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFlagTree, selectFunctionList, selectGroupTree, selectSiteTree } from 'src/app/store/job-fit.selectors';
import { FetchFATaskFlagTree, FetchJobFlagTree } from 'src/app/store/jobs-store/jobs.actions';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectFATaskFlagTree, selectJobFlagTree } from 'src/app/store/jobs-store/jobs.selectors';
import { FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { WorkersService } from 'src/app/workers/workers.service';
import { JobFittingService } from '../job-fitting.service';
export class SummaryOptions{
  FaAssumptionsFitting: string = '';
  FaAssumptionsFittingDate: Date = new Date();
  faRecords:boolean = false;
  faRecordsDate: Date = new Date();
}
export class TaskFilterOption {
  groupName = '';
}
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})

export class SummaryComponent implements OnInit , OnDestroy {
  jobFitSummary: JobFitSummary[] = [];
  jobFitSummaryJobs: JobFitSummary[] = [];
  jobFitSummaryTasks: JobFitSummary[] = [];
  visibleSidebar4 = false;
  jobFitSummaryTasksIncluded: JobFitSummary[] = [];
  jobFitSummaryTasksExcluded: JobFitSummary[] = [];
  jobFitSummaryTasksAdded: JobFitSummary[] = [];
  jobFitSummaryScore : JobFitSummaryScore = new JobFitSummaryScore();
  jobFitScores:JobFitScoreView[] = [];
  jobId: number = 0;
  options = new JobFitOptions();
  expandedRows: any = {};
  taskFilterGroups: TaskFilterOption[] = [{groupName:'Existing Task Associations'}, {groupName:'Additional Task Associations'}];
  optionsBox = false;
  actionsList = [{name: 'Tick All Tasks' , id:1},{name: 'Tick All Essential Tasks' , id:2},{name: 'Tick All Essential Tasks' , id:3},
  {name: 'Tick All Non-Essential Tasks' , id:4},
  {name: 'Untick All Tasks' , id:1},{name: 'Untick All Essential Tasks' , id:1},
  {name: 'Untick All Non-Essential Tasks' , id:1}];
  summaryFilterOptions = [{name:'Show all task associations' , id:1},{name:'Show only task associations that fit' , id:3},
  {name:'Show only task associations that dont fit' , id:2}]
  workerId:number = 0;
  disableScore = false;
  summaryOptions: SummaryOptions = new SummaryOptions();
  loaded = false;
  selectTask = false;
  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  advancedSearch = false;
  selectedTasks: any[] = [];
  combineTasksBox = false;
  tasksList: Task[] = [];
  selectedFlagOption: string = '';
  selectedGroupOption: string = '';
  files3: TreeNode[] = [];
  selectedFiles2: TreeNode | undefined;
  taskResult: any;
  tasks:Task[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  task: Task = new Task();
  taskItem: TaskItem = new TaskItem();
  taskId: any;
  breadCrumbs: MenuItem[] = [];
  quickSearch:QuickSearch = new QuickSearch();
  totalCount: number = 0;
  flagTree: FlagsTree[] = [];
  FAflagTree: FlagsTree[] = [];
  groupTree: GroupsTree[] = [];
  siteTree: DeptTree[] = [];
  jobsFlagTree: FlagsTree[] = [];
  selectedFiles: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  selectedGroups: GroupsTree[] = [];
  showNoResults = false;
  selectedSites: DeptTree[] = [];
  selectedLinkedJobs: Jobs[] = [];
  advancedSearchModel: AdvancedSearch = new AdvancedSearch();
  selectedLinkedJobsTree:FlagsTree[] = [];
  first:number = 0;
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  freqOptions = [{ID:1 , name: "Essential"},{ID:2 , name: "Non-Essential"}];
  newTaskBox = false;
  combineOptions: CombineOptionsView = new CombineOptionsView();
  flagTree$ = this.store.pipe(select(selectFlagTree));
  FAflagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  groupTree$ = this.store.pipe(select(selectGroupTree));
  siteTree$ = this.store.pipe(select(selectSiteTree))
  linkedJobs: Jobs[] = [];
  jobFlagTree$ = this.jobsStore.pipe(select(selectJobFlagTree));
  jobFlagTree: FlagsTree[] = [];
  errorMessage = '';
  providers: Provider[] = [];
  events: Event[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  displayError = false;
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  showArchiveTask= false;
  faaYes = false;
  faaNo = false;
  taskFilter = false;
  includedTaskAssociation: number[] = [];
  addedTaskAssociation: number[] = [];
  type = [
    {name: 'Starts With', code: QuickSearchType.StartsWith},
    {name: 'Ends With', code: QuickSearchType.EndsWith},
    {name: 'Contains', code: QuickSearchType.Contains},
  ];
  field = [
    {name: 'Name', code: 'Name'},
  ];
  workerName: string = '';
  destroyed$: Subject<boolean> = new Subject<boolean>();
  deptId: number = 0;
  empLoaded = false;

  constructor(private store: Store<JobFitAppState>,
    private jobFitService:JobFittingService,
    private route:ActivatedRoute,
    private jobsStore: Store<JobsAppState>,
    private jobService: JobsService,
    private router: Router,
    private translateService: TranslateService,
    private tasksService: TasksService,
    private workerService:WorkersService,
    private titleService: Title,
    private jobFittingService: JobFittingService) {

    this.summaryOptions.FaAssumptionsFitting = 'faaNo';
    this.store.dispatch(new ShowSideMenu(true));
    this.route.params.subscribe((params: Params) => {
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewJobFit]) {
          if ((params?.workerId) && (params?.jobId)) {
            if((localStorage.getItem("JobId") !== params.jobId.toString()) && (localStorage.getItem("JobId") !== params.workerId.toString)){
              localStorage.removeItem("includedTaskAssociation")
              localStorage.removeItem("TaskFilter");
              localStorage.removeItem("JobId");
              localStorage.removeItem("WorkerId");
              localStorage.removeItem("addedTaskAssociation");
            }
            if(localStorage.getItem("includedTaskAssociation") !== null){
              this.includedTaskAssociation = JSON.parse(localStorage.getItem("includedTaskAssociation") ?? "");
            }
            if(localStorage.getItem("addedTaskAssociation") !== null){
              this.addedTaskAssociation = JSON.parse(localStorage.getItem("addedTaskAssociation") ?? "");
            }
            this.jobId = params?.jobId;
            this.jobFitService.setMenu(params?.workerId, params?.jobId);
            this.store.dispatch(new SetSideMenu(this.jobFitService?.menuList));
            this.workerId = params?.workerId;
            this.deptId = params?.deptId;
            this.getJobFitSummary(params?.workerId,params?.jobId);
            this.getJobFitScores();
            this.setTitle(parseInt(params.jobId), params.workerId);
            this.translateService.setDefaultLang('en');
            this.translateService.use(localStorage.getItem('lang') || 'en');
           }
           this.store.dispatch(new FetchFlagTree());
           this.store.dispatch(new FetchFATaskFlagTree([]));
           this.store.dispatch(new FetchGroupTree());
           this.jobsStore.dispatch(new FetchJobFlagTree());
           this.jobsStore.dispatch(new FetchSiteTree([]));
           this.getAllTasks();
           this.getSiteTree();
           this.getEvents();
           this.getProviders();
           this.getAllJobs();
           this.getTasks(1,10);
           this.translateService.setDefaultLang('en');
           this.translateService.use(localStorage.getItem('lang') || 'en');
           this.jobFitService.summaryOptions.additionalTaskSetsList = [];
           this.jobFitService.summaryOptions.suitableTaskIds = [];
        } else {
          this.empLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }
      

    });

   }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getWDetails(workerId:number){

  }
  setAction(e: any){
    let actionValue = e.value;

      this.jobFitSummaryTasks.forEach(element => {
        element.isActive = false;
      });
  }
  setTitle(jobId: number, workerId:number){
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.pipe(takeUntil(this.destroyed$)).subscribe(worker => {
      if (worker) {
        this.jobService.getJob(jobId).subscribe((result:any) => {
          if(jobId === 2147483646){
            this.titleService.setTitle(worker.fullName  + ' vs ' + 'Tasks');
            this.breadCrumbs = [
              {icon: 'pi pi-home', url: 'home'},
              {label:'Perform JobFit', url: `job-fit-criteria/worker-tasks/${worker.originalRevisionID || worker.workerId}/0`},
              {label:'JobFit Result - ' + worker.fullName  + ' vs ' + 'Tasks'},
            ];
          } else if(jobId === 2147483645){
            this.titleService.setTitle(worker.fullName  + ' vs ' + 'Departments');
            this.breadCrumbs = [
              {icon: 'pi pi-home', url: 'home'},
              {label:'Perform JobFit', url: `job-fit-criteria/worker-dept/${worker.originalRevisionID || worker.workerId}/0`},
              {label:'JobFit Result - ' + worker.fullName  + ' vs ' + 'Departments'},
            ];
          } else {
            this.titleService.setTitle(worker.fullName  + ' vs ' + result.name);
            this.breadCrumbs = [
              {icon: 'pi pi-home', url: 'home'},
              {label:'Perform JobFit', url: `job-fit-criteria/worker-jobs/${worker.originalRevisionID || worker.workerId}/${jobId}`},
              {label:'JobFit Result - ' + worker.fullName  + ' vs ' + result.name},
            ];
          }
          if (worker.fullName != '') {
            this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
          }
        });
      }
    });
  }
  goToJobDetails(id: number){
    let jobId = id ?? 0;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['../jobs/jobs-details/' + jobId])
    );
    window.open(url);
  }
  saveJobFitSummaryScore(){
    if (this.jobFitSummaryScore.date == null) {
      this.errorMessage = "JobFit Score Date is required";
      this.displayError = true;
    } else {
      this.jobFitSummaryScore.jobId = this.jobId;
      this.jobFitSummaryScore.workerId = this.workerId;
      this.jobFitSummaryScore.isActive = true;


      this.jobFittingService.saveJobFitSummaryScore(this.jobFitSummaryScore).subscribe(result => {
      if(result){
        this.disableScore = true;
      }
    });
    }

  }
  goToTaskOverview(id: number | undefined){
    this.router.navigate(['./job-fitting/task-overview/' + this.workerId + '/' + this.jobId + '/' + id ?? 0]);
  }
  saveOptions(){
    this.summaryOptions
    this.options.jobId = this.jobId;
    this.options.workerId = this.workerId;
    if(this.summaryOptions.FaAssumptionsFitting === 'faaNo'){
      this.options.useAssumptionFit = false;
    } else{
      this.options.useAssumptionFit = true;
    }
    this.options.assumptionFitDate = this.summaryOptions.FaAssumptionsFittingDate;
    this.options.minFARecordDate = this.summaryOptions.faRecordsDate;
    this.getJobFitSummary(this.workerId , this.jobId);
    this.optionsBox = false;

  }
  getJobFitScores(){
    this.workerService.getJobFitScores().subscribe(response => {
      if(response){
        this.jobFitScores = response;
        var pendingScoreId = this.jobFitScores.find(x=> x.name == "Pending")?.id;
        this.jobFitSummaryScore.jobFitScoreId = pendingScoreId ?? -1;
      }
    });
  }
  selectTaskBtn(){
    this.jobFitSummaryTasksAdded = this.jobFitSummaryTasks.filter((item) => (this.addedTaskAssociation.indexOf(item.taskSetId) > -1));
    this.selectTask = false;
  }
  getJobFitSummary(workerId:number , jobId:number, filter?:any){
    this.loaded = false;
    this.options.associatedId = jobId;
    if(localStorage.getItem("additionalTaskSetsList") !== null){
      this.options.additionalTaskSetsList = JSON.parse(localStorage.getItem("additionalTaskSetsList") ?? "");
    }
    this.options.deptId = this.deptId;
    this.options.workerId = workerId;
    this.jobFittingService.getJobFitSummary(workerId,this.options).subscribe(result => {
      if(result){
        this.jobFitSummary = result;
        this.jobFitSummaryJobs = _.cloneDeep(result.filter((x) => x.isJob));
        this.jobFitSummaryTasks = _.cloneDeep(result.filter((x) => !x.isJob));

        if(filter?.value === 2){ // fit
          let i = 0;
          let fitArray:JobFitSummary[] = [];
          this.jobFitSummaryTasks.forEach(element => {
            let fail = false
            if(element.gripStrength.fail > 0){
              fail = true;
            }
            if(element.humanFactors.fail > 0){
              fail = true;
            }
            if(element.materialHandlings.fail > 0){
              fail = true;
            }
            if(element.posturalTolerances.fail > 0){
              fail = true;
            }
            if(element.healthHygiene.fail > 0){
              fail = true;
            }
            if(element.humanFactors.fail > 0){
              fail = true;
            }
            if(element.ppe.fail > 0){
              fail = true;
            }
            if(element.environmentalFactors.fail > 0){
              fail = true;
            }
            if(fail){
            fitArray.push(element);
            this.jobFitSummaryTasks = fitArray;
            }
          });
        } else if(filter?.value === 3){
            let i = 0;
            let nonFitArray:JobFitSummary[] = [];

            this.jobFitSummaryTasks.forEach(element => {
              let pass = false
              if(element.gripStrength.fail > 0){
                pass = true;
              }
              if(element.humanFactors.fail > 0){
                pass = true;
              }
              if(element.materialHandlings.fail > 0){
                pass = true;
              }
              if(element.posturalTolerances.fail > 0){
                pass = true;
              }
              if(element.healthHygiene.fail > 0){
                pass = true;
              }
              if(element.humanFactors.fail > 0){
                pass = true;
              }
              if(element.ppe.fail > 0){
                pass = true;
              }
              if(element.environmentalFactors.fail > 0){
                pass = true;
              }
              if(!pass){
              nonFitArray.push(element);
              this.jobFitSummaryTasks = nonFitArray;
              }
            });
        }
        let taskFilter = localStorage.getItem("TaskFilter");
        if(taskFilter === 'True'){
          this.jobFitSummaryTasksIncluded = this.jobFitSummaryTasks.filter((item) => (this.includedTaskAssociation.indexOf(item.taskSetId) > -1));
          this.jobFitSummaryTasksExcluded = this.jobFitSummaryTasks.filter((item) => (this.includedTaskAssociation.indexOf(item.taskSetId) < 0));
          this.jobFitSummaryTasksAdded = this.jobFitSummaryTasks.filter((item) => (this.addedTaskAssociation.indexOf(item.taskSetId) > -1));

        } else{
          if (this.options.additionalTaskSetsList.length > 0 || this.options.deptId > 0) {
            this.jobFitSummaryTasksIncluded = [];
            this.jobFitSummaryTasksExcluded = [];
            this.jobFitSummaryTasksAdded = this.jobFitSummaryTasks;
          } else {
            this.jobFitSummaryTasksIncluded = this.jobFitSummaryTasks;
            this.jobFitSummaryTasksExcluded = [];
            this.jobFitSummaryTasksAdded = [];
          }
        }
        this.loaded = true;
      }
    });
  }
  updateSuitableTask(e: any, taskId: number) {
    if (e.checked) {
      this.jobFitService.summaryOptions.suitableTaskIds.push(taskId);
      this.options.suitableTaskIds.push(taskId);
    } else {
      const updatedSuitableTaskIds = this.jobFitService.summaryOptions.suitableTaskIds.filter(id => id !== taskId);
      this.jobFitService.summaryOptions.suitableTaskIds = updatedSuitableTaskIds;
      this.options.suitableTaskIds = updatedSuitableTaskIds;
    }
  }
  goToReport() {
    this.router.navigate([`../reports/jobfit/${this.workerId}/${this.jobId}`]);
  }
  cancelAdvanceSearch(){
    this.advancedSearchModel = new AdvancedSearch();
    this.advancedSearch = !this.advancedSearch;
    this.quickSearch.value = '';
    this.getTasks(1,10);
  }
  getJobsFlagTree() {
    this.jobFlagTree$.subscribe(result => {
      this.jobFlagTree = _.cloneDeep(result);
    });
  }
  getTasks(pageNumber:number , count:number, quickSearch?:boolean){
    let s = new SearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'Name';
    s.quickSearch = this.quickSearch;
    if(quickSearch){
      s.advancedSearch = null;

    } else {
      s.advancedSearch = this.advancedSearchModel;
    }
    this.tasksService.getTaskList(s).subscribe(result => {
      this.taskResult = result;
      this.totalCount = result.listCount;
      this.tasks = result.tasks;
      if(this.tasks.length == 0){
        this.showNoResults = true;
      }
    });
  }
  getProviders(){
    this.tasksService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getEvents(){
    this.tasksService.getEvents().subscribe(result => {
      this.events = result;
    });
  }
  getAllTasks(){
    this.tasksService.quickSearchTasks('%20').subscribe(response => {
      if(response){
        this.tasksList = response;
      }
    });
  }
  check(){
  }
  getAllJobs(){
    this.tasksService.quickSearchJobs('%20').subscribe(response => {
      if(response){
        this.linkedJobs = response;
      }
    });
  }
  clearSearch(){
    this.quickSearch.value = '';
    this.getTasks(1,10);
  }
  populateAdvancedSearch(){
    this.selectedFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedFAFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedGroups.forEach(element => {
      element.parent = undefined;
    });
    this.selectedSites.forEach(element => {
      element.parent = undefined;
    });
    this.selectedLinkedJobsTree.forEach(element => {
      element.parent = undefined;
    });

    this.advancedSearchModel.flags = this.selectedFlags;
    this.advancedSearchModel.groups = this.selectedGroups;
    this.advancedSearchModel.jobs.flags = this.selectedLinkedJobsTree;
    this.advancedSearchModel.sites = this.selectedSites;
    this.advancedSearchModel.functionalAnalysis.flagSearch = this.selectedFAFlags;
    this.getTasks(1,10);
  }
  printList(){
    let s: SearchCriteria = new SearchCriteria;
    s.advancedSearch = this.advancedSearchModel;
    this.tasksService.printList(s).subscribe(result => {
      let file = new Blob([result], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
  });
  }
  goToTaskDetails(taskId:number) {
    this.tasksService.setMenu(taskId);
  //  this.router.navigate(['../tasks/tasks-details/' + taskId]);
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['../tasks/tasks-details/' + taskId])
    );
    window.open(url);
  }
  advancedSearchToggle(){
    this.advancedSearch = !this.advancedSearch;
  }
  onPageChange(e:any){
    this.first = e.first;
    this.getTasks(e.page + 1,10);
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  saveTask(task: Task){
    if(this.task.name == ""){
      this.errorMessage = "A Task Name is Required";
      this.displayError = true;
    }
    else{
      this.tasksService.saveTask(task).subscribe(result => {
        if(result){
          this.router.navigate(['../tasks/tasks-details/' + result]);
        }
      });
    }
  }
  getFlagsTree() {
    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
    });
  }
  getFAflagsTree() {
    this.FAflagTree$.subscribe(result => {
      this.FAflagTree = _.cloneDeep(result);
    });
  }
  getGroupsTree() {
    this.groupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
    });
  }
  getSiteTree(){
    this.siteTree$.subscribe(result => {
      this.siteTree = _.cloneDeep(result);
    });
  }
  combineTasks(){
    if (this.combineOptions.firstEntityId == 0){
      this.errorMessage = "A Combine Selection is Required";
      this.displayError = true;
    }
    else if (this.combineOptions.secondEntityId == 0){
      this.errorMessage = "A With Selection is Required";
      this.displayError = true;
    }
    else if (this.task.name == ""){
      this.errorMessage = "A Combined Task Name is Required";
      this.displayError = true;
    }
    else{
      var flagsEntityArray: SupplementaryEntity[] = [];
      var groupsEntityArray: SupplementaryEntity[] = [];

      this.selectedFlags.forEach(element => {
        let entity = new SupplementaryEntity();
        entity.Id = element.id;
        flagsEntityArray.push(entity);
      });
      this.selectedGroups.forEach(element => {
        let entity = new SupplementaryEntity();
        entity.Id = element.id;
        groupsEntityArray.push(entity);
      });
      if(this.selectedGroupOption === '1'){
        this.combineOptions.groupsToSet = groupsEntityArray;
      } else {
        this.combineOptions.groupsToRemove = groupsEntityArray;
      }
      if(this.selectedFlagOption === '1'){
        this.combineOptions.flagsToSet = flagsEntityArray;
      } else {
        this.combineOptions.flagsToRemove = flagsEntityArray;
      }
      this.tasksService.combineTasks(this.combineOptions).subscribe(response => {
        if(response){
          this.combineTasksBox = false;
          this.getTasks(1,10);
        }
      });
    }
  }
  findGroup(groupName:string): JobFitSummary[] {
    if(groupName === 'Existing Task Associations'){
      this.jobFitSummaryTasks.forEach(element => {
        let indx = this.jobFitSummaryTasksIncluded.findIndex((x) => x.taskSetId === element.taskSetId);
        if(indx > -1){
        //  element.isActive = true;
        }
      });
      return this.jobFitSummaryTasks;
    } else {
      return this.jobFitSummaryTasksAdded;
    }
  }
  archiveTask(){
    this.selectedTasks.forEach(element => {
      this.tasksService.archiveTask(element.id).subscribe(result => {
        this.getTasks(1,10);
      });
    });
    this.showArchiveTask = false;
  }
  addToIncluded(e:any , taskItemId: number){
    if(e.checked){
      let indx = this.includedTaskAssociation.findIndex((x) => x === taskItemId);
      if(indx < 0){
        this.includedTaskAssociation.push(taskItemId);
      }
    } else{
      let indx = this.includedTaskAssociation.findIndex((x) => x === taskItemId);
      if(indx > -1){
        this.includedTaskAssociation.splice(indx,1);
      }
    }

  }
  addToAdded(e:any , taskItemId: number){

    if(e.checked){
      let indx = this.addedTaskAssociation.findIndex((x) => x === taskItemId);
      if(indx < 0){
        this.addedTaskAssociation.push(taskItemId);
      }
    } else{
      let indx = this.addedTaskAssociation.findIndex((x) => x === taskItemId);
      if(indx > -1){
        this.addedTaskAssociation.splice(indx,1);
      }
    }

  }
  saveTaskFilter(){
    localStorage.setItem("includedTaskAssociation", JSON.stringify(this.includedTaskAssociation));
    localStorage.setItem("addedTaskAssociation", JSON.stringify(this.addedTaskAssociation));
    localStorage.setItem("TaskFilter", 'True');
    localStorage.setItem("JobId", this.jobId.toString());
    localStorage.setItem("WorkerId", this.workerId.toString());
    this.loaded = false;
    this.getJobFitSummary(this.workerId,this.jobId);
    this.taskFilter = false;
  //  JSON.parse(localStorage.getItem("includedTaskAssociation") ?? "");
  }
}
