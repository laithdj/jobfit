import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { FetchFlagTree, FetchGroupTree, SetSideMenu, ShowSideMenu, SetBreadCrumb } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingCriteriaService } from '../job-fitting-criteria.service';
import { WorkerItem, Worker, CombineOptionsView } from 'src/app/shared/models/worker.model';
import { selectWorkerDetails, selectWorkerFlagTree, selectWorkerGroupTree } from 'src/app/store/workers-store/workers.selectors';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { AdvancedEmploymentSearch, AdvancedSearch, AdvancedWorkerSearch, EmploymentType, Event, FunctionalAnalysisSearch, JobsAdvancedSearch, JobsSearchCriteria, SearchCriteria, WorkerDetailSearchView, WorkersSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { MenuItem } from 'primeng/api';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { Provider } from 'src/app/shared/models/provider.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { EBiologicalSex } from 'src/app/shared/models/gender.model';
import { WorkersService } from 'src/app/workers/workers.service';
import { TranslateService } from '@ngx-translate/core';
import { FetchWorkerDetails, FetchWorkerFlagTree, FetchWorkerGroupTree } from 'src/app/store/workers-store/workers.actions';
import * as _ from 'lodash';
import { selectFlagTree, selectGroupTree } from 'src/app/store/job-fit.selectors';
import { selectFATaskFlagTree, selectJobFlagTree } from 'src/app/store/jobs-store/jobs.selectors';
import { Jobs } from 'src/app/shared/models/jobs.model';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { Task } from 'src/app/shared/models/task.model';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { JobFittingService } from 'src/app/job-fitting/job-fitting.service';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EJobFitSideMenu } from 'src/app/shared/models/job-fitting.model';
import { FetchFATaskFlagTree, FetchJobFlagTree } from 'src/app/store/jobs-store/jobs.actions';

@Component({
  selector: 'app-worker-task',
  templateUrl: './worker-task.component.html',
  styleUrls: ['./worker-task.component.css']
})
export class WorkerTaskComponent implements OnInit {

  workerId: number = 0;
  selectWorker = false;

  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  advancedSearch = false;
  advancedTaskSearch = false;
  workersResult: any;
  selectedWorkers:any;
  events: Event[] = [];
  workers:Worker[] = [];
  jobId:number = 0;
  linkedJobs: Jobs[] = [];
  displayError = false;
  errorMessage = '';
  workersList:Worker[] = [];
  taskResult: any;
  total:number = 0;
  selectedTasks: Task[] =[];
  combineWorkersBox = false;
  worker: Worker = new Worker();
  groupTree$ = this.store.pipe(select(selectWorkerGroupTree));
  groupTree: GroupsTree[] = [];
  taskGroupTree$ = this.store.pipe(select(selectGroupTree));
  taskGroupTree: GroupsTree[] = [];
  selectedGroupTree: GroupsTree[] = [];
  workerItem: WorkerItem = new WorkerItem();
  quickSearch:QuickSearch = new QuickSearch();
  taskQuickSearch:QuickSearch = new QuickSearch();
  workerDetailsSearch: WorkerDetailSearchView = new WorkerDetailSearchView();
  faSearch: FunctionalAnalysisSearch = new FunctionalAnalysisSearch();
  totalCount: number = 0;
  first:number = 0;
  taskId:number =0;
  tasks:Task[] = [];
  employmentId: number = 0;
  jobFlagTree$ = this.jobsStore.pipe(select(selectJobFlagTree));
  jobFlagTree: FlagsTree[] = [];
  breadCrumbs: MenuItem[] = [];
  selectedSearchFlagOption: number = -1;
  selectedSearchGroupOption: number = -1;
  selectedCombineFlagOption: number = -1;
  selectedCombineGroupOption: number = -1;
  selectedSearchEmploymentFlagOption: number = -1;
  flagTree: FlagsTree[] = [];
  FAFlagTree: FlagsTree[] = [];
  taskFAflagTree: FlagsTree[] = [];
  employmentFlagTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  selectedTaskFAFlags: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedTaskFlags: FlagsTree[] = [];
  selectedEmploymentFlags: FlagsTree[] = [];
  selectedGroups: GroupsTree[] = [];
  selectedTaskGroups: GroupsTree[] = [];
  providers: Provider[] = [];
  workerFlagTree$ = this.store.pipe(select(selectWorkerFlagTree));
  FAflagTree: FlagsTree[] = [];
  selectedSites: DeptTree[] = [];
  selectedTaskSites: DeptTree[] = [];
  linkedTasks: Task[] = [];
  selectedLinkedJobsTree:FlagsTree[] = [];
  siteTree: DeptTree[] = [];
  FAflagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  combineOptions: CombineOptionsView = new CombineOptionsView();
  combineFirstName: string = '';
  combineLastName: string = '';
  advancedSearchModel: AdvancedSearch = new AdvancedSearch();
  gender: number = -1;
  taskFlagTree: FlagsTree[] = [];
  taskFlagTree$ = this.store.pipe(select(selectFlagTree));
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  newWorkerBox = false;
  nextDueDateDisable:boolean = false;
  selectedReviewDate:string = '';
  freqOptions = [{ID:1 , name: "Essential"},{ID:2 , name: "Non-Essential"}];
  useHomeAddress: boolean = false;
  dob?: Date;
  empType:number = -1;
  employmentFrom?: Date;
  employmentTo?: Date;
  employmentType = [{label:'Select Employment Type' , id:-1}, {label:'Employment' , id:EmploymentType.Employment} , {label:'Pre-Employment' , id:EmploymentType.PreEmployment}];
  type = [
    {name: 'Starts With', code: QuickSearchType.StartsWith},
    {name: 'Ends With', code: QuickSearchType.EndsWith},
    {name: 'Contains', code: QuickSearchType.Contains},
  ];

  field = [
    {name: 'First Name', code: 'FirstName'},
    {name: 'Last Name', code: 'LastName'},
    {name: 'Employee Id', code: 'EmployeeId'},
  ];
  taskField = [
    {name: 'Name', code: 'Name'},
  ];

  genders = [
    {name: 'Select', code: -1},
    {name: 'Female', code: EBiologicalSex.Female},
    {name: 'Male', code: EBiologicalSex.Male},
  ];
  taskName: string = '';
  destroyed$: Subject<boolean> = new Subject<boolean>();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  urlJobId: number = 0;
  isLoaded: boolean = true;
  workerLoaded: boolean = true;
  filtersResult:  string[] = [];
  filters: string = '';
  taskFiltersResult:  string[] = [];
  taskFilters: string = '';
  constructor(private store: Store<JobFitAppState>,
    private jobFitCriteriaService:JobFittingCriteriaService,
    private route:ActivatedRoute,
    private translateService: TranslateService,
    private workersService: WorkersService,
    private tasksService: TasksService,
    private summaryService: JobFittingService,
    private jobsStore: Store<JobsAppState>,
    private router: Router,
    private titleService: Title
) {
  this.quickSearch.field = "FirstName";
  this.taskQuickSearch.field = "Name";
  this.taskQuickSearch.type = QuickSearchType.StartsWith;

  setTimeout(() => {
    this.getFlagsTree();
    this.getGroupsTree();
    this.getEvents();
    this.getFAflagsTree();
    this.getWorkerEmploymentFlagTree();
    this.getProviders();
    this.getSiteTree();
    this.getAllJobs();
    this.getJobsFlagTree();
    this.gettaskFAflagsTree();
    this.getTaskFlagsTree();
    this.getTaskGroupsTree();
  }, 2000);
  this.getWorkers(1,10);
  this.getTasks(1,10);

  localStorage.removeItem("additionalTaskSetsList");
  this.selectedTasks = [];
  this.summaryService.summaryOptions.additionalTaskSetsList = [];
  this.translateService.setDefaultLang('en');
  this.translateService.use(localStorage.getItem('lang') || 'en');
    this.store.dispatch(new ShowSideMenu(true));
    this.route.params.subscribe((params: Params) => {
      this.workerId = parseInt(params?.workerId);
      this.urlJobId = parseInt(params?.jobId);
      this.jobFitCriteriaService.setMenu(params?.workerId, params?.jobId, EJobFitSideMenu.WorkerVsTasks);
      this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
      if (this.workerId > 0) {
        this.setTitle(this.workerId);
      }
    });
   }
   setTitle(workerId:number){
    this.titleService.setTitle("Perform JobFit");
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.pipe(takeUntil(this.destroyed$)).subscribe(worker => {
      if (worker) {
        this.selectedWorkers = _.cloneDeep(worker);

        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Workers', url: 'workers'},
          {label:worker.fullName, url: `workers/workers-details/${worker.originalRevisionID || worker.workerId}` },
          {label:'Perform JobFit'},
        ];
        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      }
    });
  }
  ngOnInit(): void {
  }
  getAllJobs(){
    this.tasksService.quickSearchJobs('%20').subscribe(response => {
      if(response){
        this.linkedJobs = response;
      }
    });
  }
  getJobsFlagTree() {
    this.jobsStore.dispatch(new FetchJobFlagTree());
    this.jobFlagTree$.subscribe(result => {
      this.jobFlagTree = _.cloneDeep(result);
    });
  }
  getTaskGroupsTree() {
    this.store.dispatch(new FetchGroupTree());
    this.taskGroupTree$.subscribe(result => {
      this.taskGroupTree = _.cloneDeep(result);
    });
  }
  getTaskFlagsTree() {
    this.store.dispatch(new FetchFlagTree());
    this.taskFlagTree$.subscribe(result => {
      this.taskFlagTree = _.cloneDeep(result);
    });
  }
  gettaskFAflagsTree() {
    this.store.dispatch(new FetchFATaskFlagTree([]));
    this.FAflagTree$.subscribe(result => {
      this.taskFAflagTree = _.cloneDeep(result);
    });
  }
  getGroupsTree() {
    this.store.dispatch(new FetchWorkerGroupTree());
    this.groupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
      this.selectedGroupTree = _.cloneDeep(result);
    });
  }
  getWorkerEmploymentFlagTree() {
    this.workersService.getWorkerEmploymentFlagTree().subscribe(result => {
      this.employmentFlagTree = _.cloneDeep(result);
    });
  }
  getAllTasks(){
    this.tasksService.quickSearchTasks('%20').subscribe(response => {
      if(response){
        this.linkedTasks = response;
      }
    });
  }
  selectWorkerBtn(){
    this.workerId = this.selectedWorkers?.originalRevisionID ?? this.selectedWorkers?.workerId;
    this.selectWorker = false;

    //change url
    this.jobFitCriteriaService.setMenu(this.workerId, this.urlJobId, EJobFitSideMenu.WorkerVsTasks);
    this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["../job-fit-criteria/worker-tasks/" + this.workerId + "/" + this.urlJobId])
    );
    history.replaceState(null, "", url);
  }

  setEmployment(e: any){
    this.workerId = this.selectedWorkers?.workerId;
    this.employmentId = e.value;
  }
  performJobFit(){
    let error = '';
    if(!this.selectedWorkers){
      error = 'Please select a worker'
    }
    else if(this.selectedTasks.length == 0){
      error = 'Please select Task/s to use for performing a JobFit.'
    }
    if(error.length > 0){
      this.errorMessage = error;
      this.displayError = true;
    } else {
      this.jobId = 2147483645; // designed job ID
      this.summaryService.summaryOptions.additionalTaskSetsList = [];
      this.selectedTasks.forEach((element: { id: number; }) => {
        this.summaryService.summaryOptions.additionalTaskSetsList.push(element.id);
      });
      localStorage.removeItem("additionalTaskSetsList");
      localStorage.setItem("additionalTaskSetsList", JSON.stringify(this.summaryService.summaryOptions.additionalTaskSetsList));
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["/job-fitting/summary/" + this.workerId + "/" + this.jobId])
      );
      window.open(url);
    }
  }
  clearTaskSearch(){
    this.advancedSearchModel = new AdvancedSearch();
    this.taskName = '';
    this.selectedTaskFlags = [];
    this.selectedTaskGroups = [];
    this.selectedLinkedJobsTree = [];
    this.selectedTaskSites = [];
    this.selectedTaskFAFlags = [];
    this.taskFilters = '';
    this.taskFiltersResult = [];
    this.getTasks(1,10);
  }
  populateTaskAdvancedSearch(){
    this.selectedTaskFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedTaskFAFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedTaskGroups.forEach(element => {
      element.parent = undefined;
    });
    this.selectedTaskSites.forEach(element => {
      element.parent = undefined;
    });
    this.selectedLinkedJobsTree.forEach(element => {
      element.parent = undefined;
    });
    this.advancedSearchModel.name = this.taskName;
    this.advancedSearchModel.flags = this.selectedTaskFlags;
    this.advancedSearchModel.groups = this.selectedTaskGroups;
    this.advancedSearchModel.jobs.flags = this.selectedLinkedJobsTree;
    this.advancedSearchModel.sites = this.selectedTaskSites;
    this.advancedSearchModel.functionalAnalysis.flagSearch = this.selectedTaskFAFlags;
    this.taskFiltersResult = [];
    this.taskFilters = '';
    if (this.advancedSearchModel.name != "") {
      this.taskFiltersResult.push("Details");
    }
    if(this.selectedTaskFlags.length > 0 && this.advancedSearchModel.flagsOption > 0) {
      this.taskFiltersResult.push("Flags");
    }
    if (this.selectedTaskGroups.length > 0 && this.advancedSearchModel.groupsOption > 0) {
      this.taskFiltersResult.push("Groups");
    }
    if (this.advancedSearchModel.jobs.jobs.length > 0 || this.advancedSearchModel.jobs.frequency.ID > 0 || this.selectedLinkedJobsTree.length > 0) {
      this.taskFiltersResult.push("Jobs");
    }
    if (this.selectedTaskSites.length > 0) {
      this.taskFiltersResult.push("Sites");
    }
    if ((this.advancedSearchModel.functionalAnalysis.from != null && this.advancedSearchModel.functionalAnalysis.to != null) ||
      this.advancedSearchModel.functionalAnalysis.providers.length > 0 || this.advancedSearchModel.functionalAnalysis.events.length > 0 ||
      (this.selectedTaskFAFlags.length > 0 && this.advancedSearchModel.functionalAnalysis.flagsOption > 0 )) {
      this.taskFiltersResult.push("Functional Analysis");
    }

    if (this.taskFiltersResult.length > 0) {
      this.taskFilters = "Results filtered by: " + this.taskFiltersResult.join(", ");
    }
    this.getTasks(1,10);
    this.advancedTaskSearch = false;
  }
  getTasks(pageNumber:number , count:number, quickSearch?:boolean){
    localStorage.removeItem("additionalTaskSetsList");
    this.selectedTasks = [];
    this.summaryService.summaryOptions.additionalTaskSetsList = [];
    let s = new SearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'Name';
    s.quickSearch = this.taskQuickSearch;
    if(quickSearch){
      s.advancedSearch = null;

    } else {
      s.advancedSearch = this.advancedSearchModel;
    }
    this.isLoaded = false;
    this.tasksService.getTaskList(s).subscribe(result => {
      this.taskResult = result;
      this.totalCount = result.listCount;
      this.tasks = result.tasks;
      this.isLoaded = true;
    });
  }
  getProviders(){
    this.workersService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getSiteTree(){
    this.workersService.getSitesTree([]).subscribe(result => {
      this.siteTree = _.cloneDeep(result);
    });
  }
  getFAflagsTree() {
    this.workersService.getFAWorkerFlagTree().subscribe(result => {
      this.FAFlagTree = _.cloneDeep(result);
    });
  }
  getEvents(){
    this.workersService.getEvents().subscribe(result => {
      this.events = result;
    });
  }
  getFlagsTree() {
    this.store.dispatch(new FetchWorkerFlagTree());
    this.workerFlagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
      this.selectedFlagTree = _.cloneDeep(result);
    });
  }
  onPageChange(e:any) {
    this.first = e.first;
    this.getWorkers(e.page + 1,10);
  }
  onAdvanceSearchClick() {
    this.getWorkers(1,10);
    this.advancedSearch = false;
  }

  getWorkers(pageNumber:number , count:number){
    let s = new WorkersSearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'LastName';
    s.quickSearch = this.quickSearch;
    let a = this.populateAdvancedSearch();
    s.advancedWorkerSearch = a;
    this.workerLoaded = false;
    this.workersService.getWorkersList(s).subscribe((result:any) => {
      this.workersResult = result;
      this.totalCount = result.listCount;
      this.workers = result.workers;
      this.workersList = result.workers;
      let workerFind = this.workers.findIndex((x) => x.workerId === this.workerId || x.originalRevisionID === this.workerId);
      if(workerFind > -1){
        this.selectedWorkers = this.workers[workerFind];
      }
      this.workerLoaded = true;
    });
  }
  openWorkerList(){
    this.selectWorker = true;
  }
  populateAdvancedSearch(): AdvancedWorkerSearch {
    let a = new AdvancedWorkerSearch();
    this.selectedFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedGroups.forEach(element => {
      element.parent = undefined;
    });
    this.selectedFAFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedEmploymentFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedSites.forEach(element => {
      element.parent = undefined;
    });
    this.faSearch.flagSearch = this.selectedFAFlags;
    a.WorkerDetailSearch = this.workerDetailsSearch;
    a.flagsOption = this.selectedSearchFlagOption;
    a.flags = this.selectedFlags;
    a.groups = this.selectedGroups;
    a.groupsOption = this.selectedSearchGroupOption;
    a.functionalAnalysis = this.faSearch;
    a.advancedEmploymentSearch = new AdvancedEmploymentSearch();
    a.advancedEmploymentSearch.sites = this.selectedSites;
    a.advancedEmploymentSearch.flags = this.selectedEmploymentFlags;
    a.advancedEmploymentSearch.flagsOption = this.selectedSearchEmploymentFlagOption;
    a.advancedEmploymentSearch.pastEmploymentFrom = this.employmentFrom;
    a.advancedEmploymentSearch.pastEmploymentTo = this.employmentTo;
    if(this.empType === EmploymentType.PreEmployment) {
      a.advancedEmploymentSearch.preEmployment = true;
    } else if (this.empType === EmploymentType.Employment) {
      a.advancedEmploymentSearch.preEmployment = false;
    }

    this.filtersResult = [];
    this.filters = '';
    if(this.workerDetailsSearch.employeeId != "" || this.workerDetailsSearch.firstName != "" || this.workerDetailsSearch.lastName != "" ||
      this.workerDetailsSearch.isMale != null || (this.workerDetailsSearch.ageFrom != null && this.workerDetailsSearch.ageTo != null) ||
      (this.workerDetailsSearch.dobFrom != null && this.workerDetailsSearch.dobTo != null)) {
        this.filtersResult.push("Details");
    }
    if(this.selectedFlags.length > 0 && this.selectedSearchFlagOption > 0) {
      this.filtersResult.push("Flags");
    }
    if (this.selectedGroups.length > 0 && this.selectedSearchGroupOption > 0) {
      this.filtersResult.push("Groups");
    }
    if (this.selectedSites.length > 0 || this.empType > 0|| (this.employmentFrom != null && this.employmentTo != null) ||
    (this.selectedEmploymentFlags.length > 0 && this.selectedSearchEmploymentFlagOption > 0) ) {
      this.filtersResult.push("Employment");
    }
    if ((this.faSearch.from != null && this.faSearch.to != null) || this.faSearch.providers.length > 0 || this.faSearch.events.length > 0 ||
    (this.selectedFAFlags.length > 0 && this.faSearch.flagsOption > 0) ) {
      this.filtersResult.push("Functional Analysis");
    }
    if (this.filtersResult.length > 0) {
      this.filters = "Results filtered by: " + this.filtersResult.join(", ");
    }
    return a;
  }
  advancedSearchToggle(){
    this.advancedSearch = !this.advancedSearch;
  }
  advancedTaskSearchToggle(){
    this.advancedTaskSearch = !this.advancedTaskSearch;
  }
  setGenderSearchField(e : any){
    this.workerDetailsSearch.isMale = undefined;
    var gender = e?.value;
    if (gender != -1) {
      this.workerDetailsSearch.isMale = gender == EBiologicalSex.Male ? true: false;
    }
  }

  clearAdvancedWorkerSearch() {
    this.workerDetailsSearch = new WorkerDetailSearchView();
    this.selectedSearchFlagOption = -1;
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.selectedSearchGroupOption = -1;
    this.filters = "";
    this.filtersResult = [];
    this.faSearch = new FunctionalAnalysisSearch();
  }


}
