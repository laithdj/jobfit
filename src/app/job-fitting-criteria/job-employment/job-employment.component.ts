import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { FetchFlagTree, SetSideMenu, ShowSideMenu, SetBreadCrumb } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingCriteriaService } from '../job-fitting-criteria.service';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { EmploymentType, Event, FunctionalAnalysisSearch, JobsAdvancedSearch, JobsSearchCriteria, SearchCriteria, WorkerDetailSearchView, WorkersSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { MenuItem } from 'primeng/api';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { Provider } from 'src/app/shared/models/provider.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { WorkersService } from 'src/app/workers/workers.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Employment, EmploymentResultView, EmploymentSearchCriteria } from 'src/app/shared/models/employment.model';
import * as moment from 'moment';
import { selectFlagTree } from 'src/app/store/job-fit.selectors';
import { selectFATaskFlagTree, selectJobDetails, selectJobFlagTree, selectJobGroupTree } from 'src/app/store/jobs-store/jobs.selectors';
import { Jobs } from 'src/app/shared/models/jobs.model';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { JobsService } from 'src/app/jobs/jobs.service';
import { Task } from 'src/app/shared/models/task.model';
import { EJobFitSideMenu } from 'src/app/shared/models/job-fitting.model';
import { Title } from '@angular/platform-browser';
import { FetchFATaskFlagTree, FetchJobDetails, FetchJobFlagTree, FetchJobGroupTree } from 'src/app/store/jobs-store/jobs.actions';
export class EmpOptions {
  label:string = '';
  id:number =0 ;
  employmentWorkerId:number = 0;
  group: string = '';
}
export class EmpGroupDropDown{
  label:string = '';
  items:EmpOptions[] = [];
}
@Component({
  selector: 'app-job-employment',
  templateUrl: './job-employment.component.html',
  styleUrls: ['./job-employment.component.css']
})
export class JobEmploymentComponent implements OnInit {
  selectedJobs:any;
  workerId: number = 0;
  employmentWorkerId: number =0;
  selectJob = false;
  freqOptions = [{ID:1 , name: "Essential"},{ID:2 , name: "Non-Essential"}];
  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  advancedSearch = false;
  workersResult: any;
  selectedWorkers:any;
  events: Event[] = [];
  workers:Worker[] = [];
  displayError = false;
  errorMessage = '';
  jobField = [
    {name: 'Name', code: 'Name'},
  ];
  jobs:Jobs[] = [];
  FAflagTree: FlagsTree[] = [];
  FAflagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  taskFlagTree: FlagsTree[] = [];
  taskFlagTree$ = this.store.pipe(select(selectFlagTree));
  employmentResult:EmploymentResultView = new EmploymentResultView();
  selectedLinkedJobsTree:FlagsTree[] = [];
  total:number = 0;
  combineWorkersBox = false;
  linkedTasks: Task[] = [];
  advancedSearchModel: JobsAdvancedSearch = new JobsAdvancedSearch();
  groupTree: GroupsTree[] = [];
  selectedGroupTree: GroupsTree[] = [];
  quickSearch:QuickSearch = new QuickSearch();
  faSearch: FunctionalAnalysisSearch = new FunctionalAnalysisSearch();
  totalCount: number = 0;
  employments: Employment[] = [];
  first:number = 0;
  employmentId: number = 0;
  breadCrumbs: MenuItem[] = [];
  selectedSearchFlagOption: number = -1;
  selectedSearchGroupOption: number = -1;
  selectedCombineFlagOption: number = -1;
  selectedCombineGroupOption: number = -1;
  selectedSearchEmploymentFlagOption: number = -1;
  jobFlagTree$ = this.store.pipe(select(selectJobFlagTree));
  flagTree: FlagsTree[] = [];
  FAFlagTree: FlagsTree[] = [];
  empOptions: EmpOptions[] = [];
  employmentFlagTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedEmploymentFlags: FlagsTree[] = [];
  selectedGroups: GroupsTree[] = [];
  providers: Provider[] = [];
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  siteTree: DeptTree[] = [];
  selectedSites: DeptTree[] = [];
  empType:number = -1;
  employmentFrom?: Date;
  jobId: number = 0;
  employmentTo?: Date;
  employmentType = [{label:'Select Employment Type' , id:-1}, {label:'Employment' , id:EmploymentType.Employment} , {label:'Pre-Employment' , id:EmploymentType.PreEmployment}];
  type = [
    {name: 'Starts With', code: QuickSearchType.StartsWith},
    {name: 'Ends With', code: QuickSearchType.EndsWith},
    {name: 'Contains', code: QuickSearchType.Contains},
  ];

  empGroupOptions: EmpGroupDropDown[] =[];
  advanceSearchLoaded = false;
  jobName: string = "";
  jobNameHeading: string = "";
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  groupTree$ = this.store.pipe(select(selectJobGroupTree));
  isLoaded: boolean = true;
  jobLoaded: boolean = true;
  jobFiltersResult:  string[] = [];
  jobFilters: string = '';
  constructor(private store: Store<JobFitAppState>,
    private jobFitCriteriaService:JobFittingCriteriaService,
    private route:ActivatedRoute,
    private translateService: TranslateService,
    private tasksService: TasksService,
    private jobsService: JobsService,
    private workersService: WorkersService,
    private router: Router,
    private titleService: Title
) {
  this.quickSearch.field = "Name";
  setTimeout(() => {
    this.getFlagsTree();
    this.getGroupsTree();
    this.getEvents();
    this.getFAflagsTree();
    this.getJobsFAflagsTree();
    this.getProviders();
    this.getSiteTree();
    this.getAllTasks();
    this.getTasksFlagTree();
    this.advanceSearchLoaded = true;
  }, 2000);

  localStorage.removeItem("additionalTaskSetsList");

  this.breadCrumbs = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'Perform JobFit'}
  ];
  this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));

  this.translateService.setDefaultLang('en');
  this.translateService.use(localStorage.getItem('lang') || 'en');
    this.store.dispatch(new ShowSideMenu(true));
    this.route.params.subscribe((params: Params) => {
      this.getJobs(1,10);
      this.workerId = parseInt(params?.workerId);
      this.jobId = parseInt(params?.jobId);
      this.jobFitCriteriaService.setMenu(params?.workerId, params?.jobId, EJobFitSideMenu.JobVsEmp);
      this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
      if (this.jobId > 0) {
        this.isLoaded = false;
         this.getPagedEmployees(parseInt(params?.jobId), 1 , 10);
         this.setTitle(this.jobId);
      }
    });
   }
  ngOnInit(): void {
  }
  setTitle(jobId:number){
    this.isLoaded = false;
    this.titleService.setTitle("Perform JobFit");
    this.store.dispatch(new FetchJobDetails(jobId));
    this.jobDetails$.subscribe(result => {
      if (result) {
        this.jobNameHeading = result.mainDescriptionHeading;
      }
      this.isLoaded = true;
    });
  }
  getTasksFlagTree() {
    this.store.dispatch(new FetchFlagTree());
    this.taskFlagTree$.subscribe(result => {
      this.taskFlagTree = _.cloneDeep(result);
    });
  }
  getGroupsTree() {
    this.store.dispatch(new FetchJobGroupTree([]));
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
  selectJobBtn(){
    this.selectJob = false;
    this.jobNameHeading = this.selectedJobs.name;
    this.jobId = this.selectedJobs?.originalRevisionId ?? this.selectedJobs?.id
    this.getPagedEmployees(this.jobId, 1 , 10);
    //change url
    this.jobFitCriteriaService.setMenu(this.workerId, this.jobId, EJobFitSideMenu.JobVsEmp);
    this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["../job-fit-criteria/job-employment/" + this.workerId + "/" + this.jobId])
    );

    history.replaceState(null, "", url);

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
    this.advancedSearchModel.name = this.jobName;
    this.advancedSearchModel.flags = this.selectedFlags;
    this.advancedSearchModel.groups = this.selectedGroups;
    this.advancedSearchModel.tasks.flags = this.selectedLinkedJobsTree;
    this.advancedSearchModel.sites = this.selectedSites;
    this.advancedSearchModel.functionalAnalysis.flagSearch = this.selectedFAFlags;

    this.jobFiltersResult = [];
    this.jobFilters = '';
    if (this.advancedSearchModel.name != "") {
      this.jobFiltersResult.push("Details");
    }
    if(this.selectedFlags.length > 0 && this.advancedSearchModel.flagsOption > 0) {
      this.jobFiltersResult.push("Flags");
    }
    if (this.selectedGroups.length > 0 && this.advancedSearchModel.groupsOption > 0) {
      this.jobFiltersResult.push("Groups");
    }
    if (this.advancedSearchModel.tasks.tasks.length > 0 || this.advancedSearchModel.tasks.frequency.ID > 0 || (this.selectedLinkedJobsTree.length > 0 && this.advancedSearchModel.tasks.searchOption)) {
      this.jobFiltersResult.push("Tasks");
    }
    if (this.selectedSites.length > 0) {
      this.jobFiltersResult.push("Sites/Departments");
    }
    if ((this.advancedSearchModel.functionalAnalysis.from != null && this.advancedSearchModel.functionalAnalysis.to != null) ||
      this.advancedSearchModel.functionalAnalysis.providers.length > 0 || this.advancedSearchModel.functionalAnalysis.events.length > 0 ||
      (this.selectedFAFlags.length > 0 && this.advancedSearchModel.functionalAnalysis.flagsOption > 0 )) {
      this.jobFiltersResult.push("Functional Analysis");
    }
    if (this.jobFiltersResult.length > 0) {
      this.jobFilters = "Results filtered by: " + this.jobFiltersResult.join(", ");
    }
    this.getJobs(1,10);
    this.advancedSearch = false;
  }
  clearSearch(){
    this.jobName = '';
    this.advancedSearchModel = new JobsAdvancedSearch();
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.selectedSites = [];
    this.selectedFAFlags = [];
    this.selectedLinkedJobsTree = [];
    this.populateAdvancedSearch();
  }
  getPagedEmployees(jobId:number , page: number , count:number){
    let criteria = new EmploymentSearchCriteria();
    criteria.pageNumber = page ;
    criteria.count = count;
    criteria.sortField = 'Id';
    criteria.sortDir = 'asc';
    criteria.departmentId = undefined;
    this.empOptions = [];
    this.isLoaded = false;
    this.workersService.getAllEmploymentsForJobs(jobId, criteria).subscribe((result) => {
        this.employmentResult = result;
        this.employments = result.employments;

        this.empGroupOptions = [];
        this.empOptions = [];
        this.employments.forEach(element => {
          let employmentOption = new EmpOptions();
          employmentOption.label = element.lastName + ", " + element.firstName + " - " + "[" + (element.employmentTypeId === 1 ? "Employment" : "Pre-Employment") + ", "
                            + moment(element.startDate).format("DD-MMM-YYYY") + " - " + (element.stopDate ? moment(element.stopDate).format("DD-MMM-YYYY") : "Unspecified") + "]";
          employmentOption.id = element.id;
          employmentOption.employmentWorkerId = element.workerId;
          employmentOption.group = element.displayGroup;
          this.empOptions.push(employmentOption);
        });

        var current = this.empOptions.filter(x=> x.group == 'Current');
        var future = this.empOptions.filter(x=> x.group == 'Future');
        var history = this.empOptions.filter(x=> x.group == 'History');
        if (current.length > 0) {
          this.empGroupOptions.push({label: "Current", items: current});
        }
        if (future.length > 0) {
          this.empGroupOptions.push({label: "Future", items: future});
        }
        if (history.length > 0) {
          this.empGroupOptions.push({label: "History", items: history});
        }
        if (this.empOptions.length > 0) {
          this.employmentWorkerId = this.empOptions[0].employmentWorkerId;
        }
        this.total = result.listCount;
        this.isLoaded = true;
    });
  }
  setEmployment(e: any){
    this.employmentWorkerId = e.value;
  }
  getAllTasks(){
    this.tasksService.quickSearchTasks('%20').subscribe(response => {
      if(response){
        this.linkedTasks = response;
      }
    });
  }
  performJobFit(){
    let error = '';
    if(this.jobId == 0){
      error = 'Please select a Job'
    }
    if(!this.employmentWorkerId){
      error = 'Please select an Employment'
    }
    if(error.length > 0){
      this.errorMessage = error;
      this.displayError = true;
    } else {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["/job-fitting/summary/" + this.employmentWorkerId + "/" + this.jobId])
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
      this.siteTree = _.cloneDeep(result);
    });
  }
  getJobsFAflagsTree() {
    this.store.dispatch(new FetchFATaskFlagTree([]));
    this.FAflagTree$.subscribe(result => {
      this.FAflagTree = _.cloneDeep(result);
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
    this.store.dispatch(new FetchJobFlagTree());
      this.jobFlagTree$.subscribe(result => {
        this.flagTree = _.cloneDeep(result);
        this.selectedFlagTree = _.cloneDeep(result);
      });
  }
  onPageChange(e:any) {
    this.first = e.first;
    this.getJobs(e.page + 1,10);
  }
  getJobs(pageNumber:number , count:number, quickSearch?:boolean){
    this.jobLoaded = false;
    let s = new JobsSearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'Name';
    s.quickSearch = this.quickSearch;
    if(quickSearch){
      s.advancedSearch = null;

    } else {
      s.advancedSearch = this.advancedSearchModel;
    }
    this.jobsService.getJobsList(s).subscribe(result => {
      this.totalCount = result.listCount;
      this.jobs = result.jobs;
      let indx = this.jobs.find((x) => x.id === this.jobId || x.originalRevisionId == this.jobId);
      if(indx){
        this.selectedJobs = indx;
      }
      this.jobLoaded = true;
    });
  }
  openWorkerList(){
    this.selectJob = true;
  }

  advancedSearchToggle(){
    this.advancedSearch = !this.advancedSearch;
  }


}
