import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
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
import { DeptTree } from 'src/app/shared/models/department.model';
import { EBiologicalSex } from 'src/app/shared/models/gender.model';
import { WorkersService } from 'src/app/workers/workers.service';
import { TranslateService } from '@ngx-translate/core';
import { FetchWorkerDetails, FetchWorkerFlagTree, FetchWorkerGroupTree } from 'src/app/store/workers-store/workers.actions';
import * as _ from 'lodash';
import { Employment, EmploymentResultView } from 'src/app/shared/models/employment.model';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { EJobFitSideMenu } from 'src/app/shared/models/job-fitting.model';
export class EmpOptions {
  label:string = '';
  id:number =0 ;
  jobId:number = 0;
  group: string = '';
}
export class EmpGroupDropDown{
  label:string = '';
  items:EmpOptions[] = [];
}
@Component({
  selector: 'app-worker-employment',
  templateUrl: './worker-employment.component.html',
  styleUrls: ['./worker-employment.component.css']
})
export class WorkerEmploymentComponent implements OnInit {
  workerId: number = 0;
  selectWorker = false;

  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  advancedSearch = false;
  workersResult: any;
  selectedWorkers:any;
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
  employments: Employment[] = [];
  first:number = 0;
  jobId: number = 0;
  breadCrumbs: MenuItem[] = [];
  selectedSearchFlagOption: number = -1;
  selectedSearchGroupOption: number = -1;
  selectedCombineFlagOption: number = -1;
  selectedCombineGroupOption: number = -1;
  selectedSearchEmploymentFlagOption: number = -1;
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
  selectedSites: DeptTree[] = [];
  empType:number = -1;
  employmentFrom?: Date;
  employmentTo?: Date;
  employmentType = [{label:'Select Employment Type' , id:-1}, {label:'Employment' , id:EmploymentType.Employment} , {label:'Pre-Employment' , id:EmploymentType.PreEmployment}];
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  urlJobId: number = 0;
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
  empGroupOptions: EmpGroupDropDown[] =[];
  destroyed$: Subject<boolean> = new Subject<boolean>();
  isLoaded: boolean = true;
  workerLoaded: boolean = true;
  filtersResult:  string[] = [];
  filters: string = '';
  constructor(private store: Store<JobFitAppState>,
    private jobFitCriteriaService:JobFittingCriteriaService,
    private route:ActivatedRoute,
    private translateService: TranslateService,
    private workersService: WorkersService,
    private titleService: Title,
    private router: Router
) {
  this.quickSearch.field = "FirstName";
  this.getWorkers(1,10);
  this.getFlagsTree();
  this.getGroupsTree();
  this.getEvents();
  this.getFAflagsTree();
  this.getWorkerEmploymentFlagTree();
  this.getProviders();
  this.getSiteTree();
  localStorage.removeItem("additionalTaskSetsList");
  this.translateService.setDefaultLang('en');
  this.translateService.use(localStorage.getItem('lang') || 'en');
    this.store.dispatch(new ShowSideMenu(true));
    this.route.params.subscribe((params: Params) => {
      this.workerId = parseInt(params?.workerId);
      this.urlJobId = parseInt(params?.jobId);
      this.jobFitCriteriaService.setMenu(params?.workerId, params?.jobId, EJobFitSideMenu.WorkerVsEmp);
      this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));

      if (this.workerId > 0) {
        this.setTitle(this.workerId);
        this.getPagedEmployees(this.workerId, 1 , 10);
      }
    });
   }
  ngOnInit(): void {
  }
  onAdvanceSearchClick() {
    this.getWorkers(1,10);
    this.advancedSearch = false;
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
    this.selectWorker = false;
    this.workerId = this.selectedWorkers?.originalRevisionID ?? this.selectedWorkers?.workerId;

    //change url
    this.jobFitCriteriaService.setMenu(this.workerId, this.urlJobId, EJobFitSideMenu.WorkerVsEmp);
    this.store.dispatch(new SetSideMenu(this.jobFitCriteriaService?.menuList));
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["../job-fit-criteria/worker-employment/" + this.workerId + "/" + this.urlJobId])
    );

    history.replaceState(null, "", url);

    this.getPagedEmployees(this.workerId, 1 , 10);

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
  getPagedEmployees(workerId:number , page: number , count:number){
    this.isLoaded = false;
    let criteria = new SearchCriteria();
    criteria.pageNumber = page ;
    criteria.count = count;
    criteria.sortField = 'DisplayGroup asc, StartDate';
    criteria.sortDir = 'desc';

    this.workersService.getAllEmploymentsForWorker(workerId, criteria).subscribe((result) => {
        this.employmentResult = result;
        this.employments = result.employments;
        this.empGroupOptions = [];
        this.empOptions = [];
        this.employments.forEach(element => {
          let employmentOption = new EmpOptions();
          employmentOption.label = element.job.name + " - " + "[" + (element.employmentTypeId === 1 ? "Employment" : "Pre-Employment") + ", "
                            + moment(element.startDate).format("DD-MMM-YYYY") + " - " + (element.stopDate ? moment(element.stopDate).format("DD-MMM-YYYY") : "Unspecified") + "]";
          employmentOption.id = element.id;
          employmentOption.jobId = element.jobId;
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
          this.jobId = this.empOptions[0].jobId;
        }
        this.total = result.listCount;
        this.isLoaded = true;
    });
  }
  setEmployment(e: any){
    this.jobId = e.value;
  }
  performJobFit(){
    let error = '';
    if(!this.selectedWorkers?.workerId){
      error = 'Please select a worker'
    }
    if((this.selectedWorkers?.workerId) && (!this.jobId)){
      error = 'Please select an Employment'
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

}


