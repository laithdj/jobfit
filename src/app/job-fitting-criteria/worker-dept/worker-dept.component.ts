import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { DeptTree } from 'src/app/shared/models/department.model';
import { selectDeptTree } from 'src/app/store/jobs-store/jobs.selectors';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SetSideMenu, ShowSideMenu, SetBreadCrumb } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingCriteriaService } from '../job-fitting-criteria.service';
import { WorkerItem, Worker, CombineOptionsView } from 'src/app/shared/models/worker.model';
import { selectFAWorkerFlagTree, selectWorkerDetails, selectWorkerFlagTree, selectWorkerGroupTree } from 'src/app/store/workers-store/workers.selectors';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { AdvancedEmploymentSearch, AdvancedWorkerSearch, EmploymentType, Event, FunctionalAnalysisSearch, SearchCriteria, WorkerDetailSearchView, WorkersSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { MenuItem } from 'primeng/api';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { Provider } from 'src/app/shared/models/provider.model';
import { EBiologicalSex } from 'src/app/shared/models/gender.model';
import { WorkersService } from 'src/app/workers/workers.service';
import { TranslateService } from '@ngx-translate/core';
import { FetchWorkerDetails, FetchWorkerFlagTree, FetchWorkerGroupTree } from 'src/app/store/workers-store/workers.actions';
import { EmploymentResultView } from 'src/app/shared/models/employment.model';
import { FetchDeptTree } from 'src/app/store/jobs-store/jobs.actions';
import { JobFittingService } from 'src/app/job-fitting/job-fitting.service';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EJobFitSideMenu } from 'src/app/shared/models/job-fitting.model';

@Component({
  selector: 'app-worker-dept',
  templateUrl: './worker-dept.component.html',
  styleUrls: ['./worker-dept.component.css']
})
export class WorkerDeptComponent implements OnInit {
  deptTree$ = this.store.pipe(select(selectDeptTree));
  deptTree: DeptTree[] = [];
  selectedDepartmentNode: DeptTree | undefined;
  selectedWorkers:any;
  selectWorker = false;
  workerId: number = 0;
  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  advancedSearch = false;
  workersResult: any;
  events: Event[] = [];
  workers:Worker[] = [];
  displayError = false;
  errorMessage = '';
  employmentResult:EmploymentResultView = new EmploymentResultView();
  workersList:Worker[] = [];
  total:number = 0;
  combineWorkersBox = false;
  worker: Worker = new Worker();
  groupTree$ = this.store.pipe(select(selectWorkerGroupTree));
  groupTree: GroupsTree[] = [];
  selectedGroupTree: GroupsTree[] = [];
  workerItem: WorkerItem = new WorkerItem();
  quickSearch:QuickSearch = new QuickSearch();
  workerDetailsSearch: WorkerDetailSearchView = new WorkerDetailSearchView();
  faSearch: FunctionalAnalysisSearch = new FunctionalAnalysisSearch();
  totalCount: number = 0;
  first:number = 0;
  employmentId: number = 0;
  breadCrumbs: MenuItem[] = [];
  selectedSearchFlagOption: number = -1;
  selectedSearchGroupOption: number = -1;
  selectedCombineFlagOption: number = -1;
  selectedCombineGroupOption: number = -1;
  selectedSearchEmploymentFlagOption: number = -1;
  flagTree: FlagsTree[] = [];
  FAFlagTree: FlagsTree[] = [];
  employmentFlagTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedEmploymentFlags: FlagsTree[] = [];
  selectedGroups: GroupsTree[] = [];
  providers: Provider[] = [];
  workerFlagTree$ = this.store.pipe(select(selectWorkerFlagTree));
  FAflagTree$ = this.store.pipe(select(selectFAWorkerFlagTree));
  combineOptions: CombineOptionsView = new CombineOptionsView();
  combineFirstName: string = '';
  combineLastName: string = '';
  gender: number = -1;
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  newWorkerBox = false;
  nextDueDateDisable:boolean = false;
  selectedReviewDate:string = '';
  useHomeAddress: boolean = false;
  dob?: Date;
  allDeptTree: DeptTree[] = [];
  jobId:number = 0;
  selectedSites: DeptTree[] = [];
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

  genders = [
    {name: 'Select', code: -1},
    {name: 'Female', code: EBiologicalSex.Female},
    {name: 'Male', code: EBiologicalSex.Male},
  ];
  destroyed$: Subject<boolean> = new Subject<boolean>();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  urlJobId: number = 0;
  isLoaded: boolean = false;
  workerLoaded: boolean = true;
  filtersResult:  string[] = [];
  filters: string = '';
  constructor(private store: Store<JobFitAppState>,
    private jobFitCriteriaService:JobFittingCriteriaService,
    private route:ActivatedRoute,
    private translateService: TranslateService,
    private workersService: WorkersService,
    private summaryService: JobFittingService,
    private router: Router,
    private titleService: Title
) {
  this.quickSearch.field = "FirstName";

  this.getDeptTree();
  setTimeout(() => {
    this.getWorkers(1,10);
    this.getFlagsTree();
    this.getGroupsTree();
    this.getEvents();
    this.getFAflagsTree();
    this.getWorkerEmploymentFlagTree();
    this.getProviders();
    this.getSiteTree();
  }, 2000);


  this.summaryService.summaryOptions.additionalTaskSetsList = [];
  localStorage.removeItem("additionalTaskSetsList");
  this.translateService.setDefaultLang('en');
  this.translateService.use(localStorage.getItem('lang') || 'en');
    this.store.dispatch(new ShowSideMenu(true));
    this.route.params.subscribe((params: Params) => {
      this.workerId = parseInt(params?.workerId);
      this.urlJobId = parseInt(params?.jobId);
      this.jobFitCriteriaService.setMenu(params?.workerId, params?.jobId, EJobFitSideMenu.WorkerVsDept);
      this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
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
  getDeptTree() {
    this.store.dispatch(new FetchDeptTree());
    this.isLoaded = false;
    this.deptTree$.subscribe(result => {
      this.deptTree = _.cloneDeep(result);
      this.isLoaded = true;
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
  selectWorkerBtn(){
    this.workerId = this.selectedWorkers?.originalRevisionID ?? this.selectedWorkers?.workerId;
    this.selectWorker = false;

    //change url
    this.jobFitCriteriaService.setMenu(this.workerId, this.urlJobId, EJobFitSideMenu.WorkerVsDept);

    this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["../job-fit-criteria/worker-dept/" + this.workerId + "/" + this.urlJobId])
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
    else if(this.selectedDepartmentNode == undefined){
      error = 'Please select a Department.'
    }
    if(error.length > 0){
      this.errorMessage = error;
      this.displayError = true;
    } else if (this.selectedDepartmentNode) {
      this.jobId = 2147483646; // designed job ID
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["/job-fitting/summary/" + this.workerId + "/" + this.jobId + "/" + this.selectedDepartmentNode.id])
      );
      window.open(url);
    }


  }
  selectedDept(e: any){
    this.summaryService.summaryOptions.deptId = e?.node?.id;
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
  getIndexIcon(type: number) : string{
    if(type === 2){ // company
      return 'fas fa-building';
    } else if(type === 3){  // division
      return 'pi pi-th-large';
    } else if(type === 8){ // departments
      return 'pi pi-briefcase';
    } else if(type === 7){ // site
      return 'pi pi-sitemap';
    } else if(type === 0){ // job
      return 'fas fa-clipboard-list';
    }
    return '';
  }
  onPageChange(e:any) {
    this.first = e.first;
    this.getWorkers(e.page + 1,10);
  }
  getWorkers(pageNumber:number , count:number){
    this.workerLoaded = false;
    let s = new WorkersSearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'LastName';
    s.quickSearch = this.quickSearch;
    let a = this.populateAdvancedSearch();
    s.advancedWorkerSearch = a;
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
  onAdvanceSearchClick() {
    this.getWorkers(1,10);
    this.advancedSearch = false;
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
    this.filtersResult = [];
    this.filters = '';
    this.faSearch = new FunctionalAnalysisSearch();
  }

}
