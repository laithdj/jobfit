import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { FetchFlagTree, SetSideMenu, ShowSideMenu, SetBreadCrumb } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingCriteriaService } from '../job-fitting-criteria.service';
import { WorkerItem, Worker, CombineOptionsView } from 'src/app/shared/models/worker.model';
import { selectWorkerDetails, selectWorkerFlagTree, selectWorkerGroupTree } from 'src/app/store/workers-store/workers.selectors';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { AdvancedEmploymentSearch, AdvancedWorkerSearch, EmploymentType, Event, FunctionalAnalysisSearch, JobsAdvancedSearch, JobsSearchCriteria, SearchCriteria, WorkerDetailSearchView, WorkersSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { MenuItem } from 'primeng/api';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { Provider } from 'src/app/shared/models/provider.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { EBiologicalSex } from 'src/app/shared/models/gender.model';
import { WorkersService } from 'src/app/workers/workers.service';
import { TranslateService } from '@ngx-translate/core';
import { FetchWorkerDetails, FetchWorkerFlagTree, FetchWorkerGroupTree } from 'src/app/store/workers-store/workers.actions';
import * as _ from 'lodash';
import { selectFlagTree } from 'src/app/store/job-fit.selectors';
import { selectFATaskFlagTree } from 'src/app/store/jobs-store/jobs.selectors';
import { Jobs } from 'src/app/shared/models/jobs.model';
import { JobsService } from 'src/app/jobs/jobs.service';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { Task } from 'src/app/shared/models/task.model';
import * as moment from 'moment';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { EJobFitSideMenu } from 'src/app/shared/models/job-fitting.model';
import { FetchFATaskFlagTree } from 'src/app/store/jobs-store/jobs.actions';

@Component({
  selector: 'app-worker-job',
  templateUrl: './worker-job.component.html',
  styleUrls: ['./worker-job.component.css']
})
export class WorkerJobComponent implements OnInit {
  workerId: number = 0;
  selectWorker = false;
  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  advancedSearch = false;
  jobsAdvancedSearch = false;
  workersResult: any;
  selectedWorkers:any;
  events: Event[] = [];
  workers:Worker[] = [];
  displayError = false;
  errorMessage = '';
  workersList:Worker[] = [];
  total:number = 0;
  combineWorkersBox = false;
  worker: Worker = new Worker();
  groupTree$ = this.store.pipe(select(selectWorkerGroupTree));
  groupTree: GroupsTree[] = [];
  jobGroupTree: GroupsTree[] = [];
  selectedGroupTree: GroupsTree[] = [];
  workerItem: WorkerItem = new WorkerItem();
  quickSearch:QuickSearch = new QuickSearch();
  jobQuickSearch:QuickSearch = new QuickSearch();
  workerDetailsSearch: WorkerDetailSearchView = new WorkerDetailSearchView();
  faSearch: FunctionalAnalysisSearch = new FunctionalAnalysisSearch();
  totalCount: number = 0;
  first:number = 0;
  selectedJobs:any;
  jobs:Jobs[] = [];
  jobId:number = 0;
  employmentId: number = 0;
  breadCrumbs: MenuItem[] = [];
  selectedSearchFlagOption: number = -1;
  selectedSearchGroupOption: number = -1;
  selectedCombineFlagOption: number = -1;
  selectedCombineGroupOption: number = -1;
  selectedSearchEmploymentFlagOption: number = -1;
  flagTree: FlagsTree[] = [];
  jobFlagTree: FlagsTree[] = [];
  FAFlagTree: FlagsTree[] = [];
  employmentFlagTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedJobFlags: FlagsTree[] = [];
  selectedEmploymentFlags: FlagsTree[] = [];
  selectedGroups: GroupsTree[] = [];
  selectedJobGroups: GroupsTree[] = [];
  providers: Provider[] = [];
  workerFlagTree$ = this.store.pipe(select(selectWorkerFlagTree));
  FAflagTree: FlagsTree[] = [];
  taskFAflagTree: FlagsTree[] = [];
  selectedTaskFAFlags: FlagsTree[] = [];
  selectedSites: DeptTree[] = [];
  selectedJobSites: DeptTree[] = [];
  selectedLinkedJobs: Jobs[] = [];
  linkedTasks: Task[] = [];
  allDeptTree: DeptTree[] = [];
  FAflagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  combineOptions: CombineOptionsView = new CombineOptionsView();
  combineFirstName: string = '';
  combineLastName: string = '';
  advancedSearchModel: JobsAdvancedSearch = new JobsAdvancedSearch();
  gender: number = -1;
  taskFlagTree: FlagsTree[] = [];
  taskFlagTree$ = this.store.pipe(select(selectFlagTree));
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  newWorkerBox = false;
  nextDueDateDisable:boolean = false;
  selectedLinkedJobsTree:FlagsTree[] = [];
  selectedReviewDate:string = '';
  freqOptions = [{ID:1 , name: "Essential"},{ID:2 , name: "Non-Essential"}];
  useHomeAddress: boolean = false;
  dob?: Date;
  jobName:string = ''
  empType:number = -1;
  employmentFrom?: Date;
  employmentTo?: Date;
  employmentType = [{label:'Select Employment Type' , id:-1}, {label:'Employment' , id:EmploymentType.Employment} , {label:'Pre-Employment' , id:EmploymentType.PreEmployment}];
  fullName: string = '';
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
  jobField = [
    {name: 'Name', code: 'Name'},
  ];

  genders = [
    {name: 'Select', code: -1},
    {name: 'Female', code: EBiologicalSex.Female},
    {name: 'Male', code: EBiologicalSex.Male},
  ];
  destroyed$: Subject<boolean> = new Subject<boolean>();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  urlJobId: number = 0;
  isLoaded: boolean = true;
  workerLoaded: boolean = true;
  filtersResult:  string[] = [];
  filters: string = '';
  jobFiltersResult:  string[] = [];
  jobFilters: string = '';
  constructor(private store: Store<JobFitAppState>,
    private jobFitCriteriaService:JobFittingCriteriaService,
    private route:ActivatedRoute,
    private translateService: TranslateService,
    private workersService: WorkersService,
    private jobsService: JobsService,
    private tasksService: TasksService,
    private titleService: Title,
    private router: Router
) {
  this.quickSearch.field = "FirstName";
  this.quickSearch.type = QuickSearchType.StartsWith;
  this.jobQuickSearch.field = "Name";
  this.jobQuickSearch.type = QuickSearchType.StartsWith;

  localStorage.removeItem("additionalTaskSetsList");
  this.translateService.setDefaultLang('en');
  this.translateService.use(localStorage.getItem('lang') || 'en');
    this.store.dispatch(new ShowSideMenu(true));
    this.route.params.subscribe((params: Params) => {
      this.workerId = parseInt(params?.workerId);
      this.urlJobId = parseInt(params?.jobId);
      this.jobFitCriteriaService.setMenu(params?.workerId, params?.jobId, EJobFitSideMenu.WorkerVsJob);
      this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
      this.getWorkers(1,10);
      this.getJobs(1,10);
      if (this.workerId > 0) {
        this.setTitle(this.workerId);
      }
    });
   }
  ngOnInit(): void {
  }
  setTitle(workerId:number){
    this.titleService.setTitle("Perform JobFit");
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(worker => {
      if (worker) {
        this.selectedWorkers = _.cloneDeep(worker);
        this.fullName = this.selectedWorkers?.firstName + ' ' + this.selectedWorkers?.lastName;

        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Workers', url: 'workers'},
          {label:worker.fullName, url: `workers/workers-details/${worker.originalRevisionID || worker.workerId}` },
          {label:'Perform JobFit'},
        ];
        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));

        setTimeout(() => {
          this.getFlagsTree();
          this.getGroupsTree();
          this.getEvents();
          this.getFAflagsTree();
          this.getWorkerEmploymentFlagTree();
          this.getProviders();
          this.getSiteTree();
          this.getAllTasks();
          this.getTasksFlagTree();
          this.getTaskFAflagsTree();
          this.getJobGroupsTree();
          this.getJobsFlagTree();
        }, 2000);
      }
    });
  }
  clearSearch(){
    this.advancedSearchModel = new JobsAdvancedSearch();
    this.jobName = '';
    this.selectedJobFlags = [];
    this.selectedJobGroups = [];
    this.selectedJobSites = [];
    this.selectedTaskFAFlags = [];
    this.selectedLinkedJobsTree = [];
    this.filtersResult = [];
    this.filters = '';
    this.getJobs(1,10);
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
  getTasksFlagTree() {
    this.store.dispatch(new FetchFlagTree());
    this.taskFlagTree$.subscribe(result => {
      this.taskFlagTree = _.cloneDeep(result);
    });
  }
  selectWorkerBtn(){
    this.workerId = this.selectedWorkers?.originalRevisionID ?? this.selectedWorkers?.workerId;
    this.fullName = this.selectedWorkers?.firstName + ' ' + this.selectedWorkers?.lastName;
    this.selectWorker = false;

    //change url
    this.jobFitCriteriaService.setMenu(this.workerId, this.urlJobId, EJobFitSideMenu.WorkerVsJob);

    this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["../job-fit-criteria/worker-jobs/" + this.workerId + "/" + this.urlJobId])
    );

    history.replaceState(null, "", url);
  }
  populateJobAdvancedSearch(){
    this.selectedJobFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedTaskFAFlags.forEach(element => {
      element.parent = undefined;
    });
    this.selectedJobGroups.forEach(element => {
      element.parent = undefined;
    });
    this.selectedJobSites.forEach(element => {
      element.parent = undefined;
    });
    this.selectedLinkedJobsTree.forEach(element => {
      element.parent = undefined;
    });
    this.advancedSearchModel.name = this.jobName;
    this.advancedSearchModel.flags = this.selectedJobFlags;
    this.advancedSearchModel.groups = this.selectedJobGroups;
    this.advancedSearchModel.tasks.flags = this.selectedLinkedJobsTree;
    this.advancedSearchModel.sites = this.selectedJobSites;
    this.advancedSearchModel.functionalAnalysis.flagSearch = this.selectedTaskFAFlags;

    this.jobFiltersResult = [];
    this.jobFilters = '';
    if (this.advancedSearchModel.name != "") {
      this.jobFiltersResult.push("Details");
    }
    if(this.selectedJobFlags.length > 0 && this.advancedSearchModel.flagsOption > 0) {
      this.jobFiltersResult.push("Flags");
    }
    if (this.selectedJobGroups.length > 0 && this.advancedSearchModel.groupsOption > 0) {
      this.jobFiltersResult.push("Groups");
    }
    if (this.advancedSearchModel.tasks.tasks.length > 0 || this.advancedSearchModel.tasks.frequency.ID > 0 || (this.selectedLinkedJobsTree.length > 0 && this.advancedSearchModel.tasks.searchOption)) {
      this.jobFiltersResult.push("Tasks");
    }
    if (this.selectedJobSites.length > 0) {
      this.jobFiltersResult.push("Sites/Departments");
    }
    if ((this.advancedSearchModel.functionalAnalysis.from != null && this.advancedSearchModel.functionalAnalysis.to != null) ||
      this.advancedSearchModel.functionalAnalysis.providers.length > 0 || this.advancedSearchModel.functionalAnalysis.events.length > 0 ||
      (this.selectedTaskFAFlags.length > 0 && this.advancedSearchModel.functionalAnalysis.flagsOption > 0 )) {
      this.jobFiltersResult.push("Functional Analysis");
    }
    if (this.jobFiltersResult.length > 0) {
      this.jobFilters = "Results filtered by: " + this.jobFiltersResult.join(", ");
    }
    this.getJobs(1,10);
    this.jobsAdvancedSearch = false;
  }
  getJobs(pageNumber:number , count:number, quickSearch?:boolean){
    let s = new JobsSearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'Name';
    s.quickSearch = this.jobQuickSearch;
    if(quickSearch){
      s.advancedSearch = null;

    } else {
      s.advancedSearch = this.advancedSearchModel;
    }
    this.isLoaded = false;
    this.jobsService.getJobsList(s).subscribe(result => {
      this.totalCount = result.listCount;
      this.jobs = result.jobs;
      this.isLoaded = true;
    });

  }
  setEmployment(e: any){
    this.workerId = this.selectedWorkers?.workerId;
    this.employmentId = e.value;
  }
  performJobFit(){
    this.jobId = this.selectedJobs?.originalRevisionId ?? this.selectedJobs?.id;

    let error = '';
    if(!this.worker){
      error = 'Please select a worker'
    }
    if(!this.jobId){
      error = 'Please select a Job'
    }
    if(error.length > 0){
      this.errorMessage = error;
      this.displayError = true;
    } else {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["/job-fitting/summary/" + this.workerId + "/" + this.jobId])
      );
      window.open(url);
    }

  }
  getProviders(){
    this.workersService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getSiteTree(){
    this.workersService.getSitesTree([]).subscribe(result => {
      this.allDeptTree = _.cloneDeep(result);
    });
  }
  getJobGroupsTree() {
    this.jobsService.getJobsGroupTree().subscribe(result => {
      this.jobGroupTree = _.cloneDeep(result);
    });
  }
  getFAflagsTree() {
    this.workersService.getFAWorkerFlagTree().subscribe(result => {
      this.FAFlagTree = _.cloneDeep(result);
    });
  }
  getTaskFAflagsTree() {
    this.store.dispatch(new FetchFATaskFlagTree([]));
    this.FAflagTree$.subscribe(result => {
      this.taskFAflagTree = _.cloneDeep(result);
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
  getJobsFlagTree() {
    this.jobsService.getJobsFlagTree().subscribe(result => {
      this.jobFlagTree = _.cloneDeep(result);
    });
  }
  onPageChange(e:any) {
    this.first = e.first;
    this.getWorkers(e.page + 1,10);
  }
  onJobPageChange(e:any){
    this.first = e.first;
    this.getJobs(e.page + 1,10);
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
      this.workers = _.cloneDeep(result.workers);
      this.workersList = _.cloneDeep(result.workers);
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
      this.faSearch.from = this.faSearch.from ? new Date(moment(this.faSearch.from).format('YYYY-MM-DD')): undefined;
      this.faSearch.to = this.faSearch.to ? new Date(moment(this.faSearch.to).format('YYYY-MM-DD')): undefined ;
      this.workerDetailsSearch.dobFrom = this.workerDetailsSearch.dobFrom ? new Date(moment(this.workerDetailsSearch.dobFrom).format('YYYY-MM-DD')): undefined;
      this.workerDetailsSearch.dobTo = this.workerDetailsSearch.dobTo ? new Date(moment(this.workerDetailsSearch.dobTo).format('YYYY-MM-DD')): undefined;
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
      a.advancedEmploymentSearch.pastEmploymentFrom = this.employmentFrom ? new Date(moment(this.employmentFrom).format('YYYY-MM-DD')): undefined;
      a.advancedEmploymentSearch.pastEmploymentTo = this.employmentTo ? new Date(moment(this.employmentTo).format('YYYY-MM-DD')): undefined;
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
  advancedJobSearchToggle(){
    this.jobsAdvancedSearch = !this.jobsAdvancedSearch;
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
      this.selectedFAFlags = [];
      this.selectedSites = [];
      this.selectedSearchGroupOption = -1;
      this.empType = 0;
      this.selectedSearchEmploymentFlagOption = -1;
      this.employmentFrom = undefined;
      this.employmentTo = undefined;
      this.selectedEmploymentFlags = [];
      this.faSearch = new FunctionalAnalysisSearch();
      this.filtersResult = [];
      this.filters = '';
      this.getWorkers(1,10);
  }
  onAdvanceSearchClick() {
    this.getWorkers(1,10);
    this.advancedSearch = false;
  }

}
