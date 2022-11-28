import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { JobsService } from 'src/app/jobs/jobs.service';
import { DeptTree } from 'src/app/shared/models/department.model';
import { Employment, EmploymentSearchCriteria } from 'src/app/shared/models/employment.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { EBiologicalSex } from 'src/app/shared/models/gender.model';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { Provider } from 'src/app/shared/models/provider.model';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { AdvancedEmploymentSearch, AdvancedWorkerSearch, EmploymentType, Event, FunctionalAnalysisSearch, WorkerDetailSearchView, WorkersSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Worker } from 'src/app/shared/models/worker.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { FetchWorkerFlagTree, FetchWorkerGroupTree } from 'src/app/store/workers-store/workers.actions';
import { selectWorkerFlagTree, selectWorkerGroupTree } from 'src/app/store/workers-store/workers.selectors';
import { WorkersService } from 'src/app/workers/workers.service';


@Component({
  selector: 'app-modal-worker',
  templateUrl: './modal-worker.component.html',
  styleUrls: ['./modal-worker.component.css']
})
export class ModalWorkerComponent implements OnInit {
  @Input() selectedDept: any;
  @Input() modalHeader: string = "";
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<boolean>();

  modalTableItems: any[] = [];
  modalTotalCount: number = 0;
  modalFirst: number = 0;
  selectedModalTableItems: any[] = [];

  isAdvancedSearch: boolean = false;
  advancedWorkerSearchModel: AdvancedWorkerSearch = new AdvancedWorkerSearch();
  quickSearch: QuickSearch = new QuickSearch();
  currentPage = 0;
  rowCount = 10;
  type = [
    { name: 'Starts With', code: QuickSearchType.StartsWith },
    { name: 'Ends With', code: QuickSearchType.EndsWith },
    { name: 'Contains', code: QuickSearchType.Contains },
  ];
  field = [
    { name: 'First Name', code: 'FirstName' },
    { name: 'Last Name', code: 'LastName' },
    { name: 'Employee Id', code: 'EmployeeId' },
  ];
  searchOptions = [{ id: 1, name: "Must Contain at least 1" }, { id: 2, name: "Must Contain all selected" }];
  freqOptions = [{ ID: 1, name: "Essential" }, { ID: 2, name: "Non-Essential" }];

  flagTree$ = this.store.pipe(select(selectWorkerFlagTree));
  flagTree: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];

  groupTree$ = this.store.pipe(select(selectWorkerGroupTree));
  groupTree: GroupsTree[] = [];
  selectedGroups: GroupsTree[] = [];

  siteTree: DeptTree[] = [];
  selectedSites: DeptTree[] = [];

  FAflagTree: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  providers: Provider[] = [];
  events: Event[] = [];

  selectedEmploymentFlags: FlagsTree[] = [];
  selectedSearchEmploymentFlagOption: number = -1;
  employmentFrom?: Date;
  employmentTo?: Date;
  empType: number = -1;
  workerDetailsSearch: WorkerDetailSearchView = new WorkerDetailSearchView();
  selectedSearchFlagOption: number = -1;
  selectedSearchGroupOption: number = -1;
  selectedCombineFlagOption: number = -1;
  selectedCombineGroupOption: number = -1;
  faSearch: FunctionalAnalysisSearch = new FunctionalAnalysisSearch();

  employmentType = [
    { label: 'Select Employment Type', id: -1 },
    { label: 'Employment', id: EmploymentType.Employment },
    { label: 'Pre-Employment', id: EmploymentType.PreEmployment }
  ];
  employmentFlagTree: FlagsTree[] = [];
  gender: number = -1;
  genders = [
    { name: 'Select', code: -1 },
    { name: 'Female', code: EBiologicalSex.Female },
    { name: 'Male', code: EBiologicalSex.Male },
  ];
  filtersResult:  string[] = [];
  filters: string = '';
  rowOptions = [10,20,30];
  first:number = 0;
  isWorkerLoaded: boolean = false;
  isSaved: boolean = true;
  showNoResults: boolean = false;
  totalCount: number = 0;
  advanceSearchLoaded = false;
  selectedItems: any[] = [];
  constructor(
    private store: Store<JobFitAppState>,
    private jobsService: JobsService,
    private workersService: WorkersService,
    private translateService: TranslateService,
  ) {
    this.translateService.setDefaultLang('en');
    this.translateService.use(localStorage.getItem('lang') || 'en');
    this.quickSearch.type = QuickSearchType.StartsWith;
    this.quickSearch.field = "FirstName";
    setTimeout(() => {
      this.getFlagsTree();
      this.getGroupsTree();
      this.getSiteTree();
      this.getFAflagsTree();
      this.getEvents();
      this.getProviders();
      this.getWorkerEmploymentFlagTree();      
      this.advanceSearchLoaded = true;
    }, 2000);
  }

  ngOnInit(): void {
  }

  onShowDialog() {
    this.isWorkerLoaded = false;
    this.modalTableItems = [];
    this.currentPage = 1;
    this.rowCount = 10;
    this.first = 0;
    this.quickSearch.value = "";
    this.getExistingEmployment();
  }

  getExistingEmployment() {
    let searchCriteria = new EmploymentSearchCriteria();
    searchCriteria.pageNumber = 1;
    searchCriteria.count = 1000;
    searchCriteria.sortField = 'LastName';
    searchCriteria.sortDir = "asc";
    searchCriteria.departmentId = this.selectedDept.parentId;
    this.workersService.getAllEmploymentsForJobs(this.selectedDept.id, searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.employments);
      this.selectedItems = [];
      for (const emp of results) {

        const workerIdExistsInTable = this.selectedItems.find((x: any) => x.workerId === emp.workerId && x.employmentTypeId === emp.employmentTypeId);
        if (!workerIdExistsInTable) {
          this.selectedItems.push(emp);
        }
      }
      this.totalCount = result.listCount;
      this.clearAdvancedWorkerSearch();
      this.showNoResults = false;   
    });

  }

  onModalSave() {
    this.isSaved = false;
    const jobId = this.selectedDept.id;
    const deptId = this.selectedDept.parentId;
    const employments = this.selectedModalTableItems.map(worker => {
      let employment = new Employment();
      employment.workerId = worker.workerId;
      employment.jobId = jobId;
      employment.orgEntityId = deptId;
      employment.isActive = true;
      return employment;
    });

    forkJoin(
      employments.map(employment => this.jobsService.saveEmployment(employment))
    ).subscribe(result => {
      this.isSaved = true;
      this.onModalClose();
      this.onSave.emit(true);
    });
  }
  onModalClose() {
    this.selectedItems = [];
    this.modalTableItems = [];
    this.selectedModalTableItems = [];
    this.showModal = false;
    this.showModalChange.emit(false);
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getWorkers();
  }
  getWorkers() {
    this.isWorkerLoaded = false;
    this.modalTableItems = []
    let searchCriteria = new WorkersSearchCriteria();
    searchCriteria.pageNumber = this.currentPage;
    searchCriteria.count = this.rowCount;
    searchCriteria.sortField = 'LastName';
    searchCriteria.quickSearch = { ...this.quickSearch };
    searchCriteria.advancedWorkerSearch = this.populateAdvancedSearch();

    this.workersService.getWorkersList(searchCriteria).subscribe(result => {
      if(result){
        this.totalCount = result.listCount;
        const workers = result.workers;
        if(workers.length == 0){
          this.showNoResults = true;
        }
        const workersAlreadyAdded = workers.filter(worker => this.selectedItems?.some((tableItem: any) => tableItem.workerId === worker.originalRevisionID || tableItem.workerId === worker.workerId));
        this.selectedModalTableItems = workersAlreadyAdded;
        this.modalTableItems = _.cloneDeep(workers);
        this.modalTotalCount = this.totalCount;
        this.isWorkerLoaded = true;
      }
    });
  }

  toggleAdvancedSearch() {
    this.isAdvancedSearch = !this.isAdvancedSearch;
  }
  onAdvanceSearchClick() {
    this.getWorkers();
    this.isAdvancedSearch = false;
  }
  selectRow(e:any, worker: Worker) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.addRemoveSelected(worker, isSelected);
  }

  selectAllRows(e:any) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.modalTableItems.forEach((item) => {
      this.addRemoveSelected(item, isSelected);
    });
    
  }
  addRemoveSelected(worker: Worker, isSelected: boolean) {
    var index = this.selectedItems.findIndex((tableItem: any) =>  tableItem.workerId === worker.originalRevisionID || tableItem.workerId === worker.workerId);
    if (isSelected && index == -1) {
      this.selectedItems.push(worker);      
    }
    if (!isSelected && index > -1) {
      this.selectedItems.splice(index, 1);
    }
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
    this.getWorkers();
  }
  setRows(e: any){
    this.currentPage = 1;
    this.first = 0;
    this.rowCount = e.value
    this.getWorkers();
  }
  setGenderSearchField(e: any) {
    this.workerDetailsSearch.isMale = undefined;
    var gender = e?.value;
    if (gender != -1) {
      this.workerDetailsSearch.isMale = gender == EBiologicalSex.Male ? true : false;
    }
  }

  getFlagsTree() {
    this.store.dispatch(new FetchWorkerFlagTree());
    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
    });
  }
  getGroupsTree() {
    this.store.dispatch(new FetchWorkerGroupTree());
    this.groupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
    });
  }
  getSiteTree() {
    this.workersService.getSitesTree([]).subscribe(result => {
      this.siteTree = _.cloneDeep(result);
    });
  }
  getFAflagsTree() {
    this.workersService.getFAWorkerFlagTree().subscribe(result => {
      this.FAflagTree = _.cloneDeep(result);
    });
  }
  getProviders() {
    this.workersService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getEvents() {
    this.workersService.getEvents().subscribe(result => {
      this.events = result;
    });
  }
  getWorkerEmploymentFlagTree() {
    this.workersService.getWorkerEmploymentFlagTree().subscribe(result => {
      this.employmentFlagTree = _.cloneDeep(result);
    });
  }
}
