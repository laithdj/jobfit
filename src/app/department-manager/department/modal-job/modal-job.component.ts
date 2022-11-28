import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { JobsService } from 'src/app/jobs/jobs.service';
import { DeptTree } from 'src/app/shared/models/department.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { Jobs } from 'src/app/shared/models/jobs.model';
import { Provider } from 'src/app/shared/models/provider.model';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { Event, JobsAdvancedSearch, JobsSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Task } from 'src/app/shared/models/task.model';
import { FetchFlagTree, FetchSiteTree } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFlagTree, selectSiteTree } from 'src/app/store/job-fit.selectors';
import { FetchFATaskFlagTree, FetchJobFlagTree, FetchJobGroupTree } from 'src/app/store/jobs-store/jobs.actions';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectFATaskFlagTree, selectJobFlagTree, selectJobGroupTree } from 'src/app/store/jobs-store/jobs.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';


@Component({
  selector: 'app-modal-job',
  templateUrl: './modal-job.component.html',
  styleUrls: ['./modal-job.component.css']
})
export class ModalJobComponent implements OnInit {
  @Input() selectedDept: any;
  @Input() modalHeader: string = "";
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() onSaveJobs = new EventEmitter<Jobs[]>();
  selectedItems: any[] = [];
  modalTableItems: any[] = [];
  modalTotalCount: number = 0;
  modalFirst: number = 0;
  selectedModalTableItems: Jobs[] = [];
  jobs:Jobs[] = [];
  isAdvancedSearch: boolean = false;
  advancedSearchModel: JobsAdvancedSearch = new JobsAdvancedSearch();
  filtersResult:  string[] = [];
  filters: string = '';
  isSaved: boolean = true;
  isJobsLoaded: boolean = false;
  currentPage = 1;
  first:number = 0;
  rowCount = 10;
  quickSearch: QuickSearch = new QuickSearch();
  showNoResults = false;
  linkedTasks: Task[] = [];
  jobResult:any;
  totalCount: number = 0;
  advanceSearchLoaded = false;
  rowOptions = [10,20,30];
  type = [
    { name: 'Starts With', code: QuickSearchType.StartsWith },
    { name: 'Ends With', code: QuickSearchType.EndsWith },
    { name: 'Contains', code: QuickSearchType.Contains },
  ];
  displayMessage: string = "Unable to remove this job to the department.  Job should be associated to at least one department"
  jobMessage: string = "Unselecting jobs remove the association of job to the department.  Job should be associated to at least one department.";
  field = [{ name: 'Name', code: 'Name' }];
  searchOptions = [{ id: 1, name: "Must Contain at least 1" }, { id: 2, name: "Must Contain all selected" }];
  freqOptions = [{ ID: 1, name: "Essential" }, { ID: 2, name: "Non-Essential" }];

  flagTree$ = this.store.pipe(select(selectJobFlagTree));
  flagTree: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];

  groupTree$ = this.store.pipe(select(selectJobGroupTree));
  groupTree: GroupsTree[] = [];
  selectedGroups: GroupsTree[] = [];

  linkedJobs: Jobs[] = [];
  selectedLinkedJobsTree: FlagsTree[] = [];

  siteTree$ = this.store.pipe(select(selectSiteTree))
  siteTree: DeptTree[] = [];
  selectedSites: DeptTree[] = [];

  FAflagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  FAflagTree: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  providers: Provider[] = [];
  events: Event[] = [];

  taskFlagTree: FlagsTree[] = [];
  taskFlagTree$ = this.store.pipe(select(selectFlagTree));
  checked: boolean = true;

  constructor(
    private store: Store<JobFitAppState>,
    private jobsStore: Store<JobsAppState>,
    private jobsService: JobsService,
    private tasksService: TasksService,
    private translateService: TranslateService,
  ) {
    this.quickSearch.type = QuickSearchType.StartsWith;
    this.quickSearch.field = "Name";    

    setTimeout(() => {
      this.store.dispatch(new FetchFlagTree());
      this.store.dispatch(new FetchJobFlagTree());
      this.store.dispatch(new FetchJobGroupTree([]));
      this.store.dispatch(new FetchFATaskFlagTree([]));
      this.jobsStore.dispatch(new FetchSiteTree([]));
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');

      this.getFlagsTree();
      this.getGroupsTree();
      this.getAllJobs();
      this.getSiteTree();
      this.getFAflagsTree();
      this.getEvents();
      this.getProviders();
      this.getAllTasks();
      this.getTasksFlagTree();
      this.advanceSearchLoaded = true;
    }, 2000);
  }

  ngOnInit(): void {
    
  }

  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page;
    this.getJobs(e.page + 1,this.rowCount);
  }
  selectRow(e:any, job: Jobs) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.addRemoveSelected(job, isSelected);
  }

  selectAllRows(e:any) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.modalTableItems.forEach((item) => {
      this.addRemoveSelected(item, isSelected);
    });
  }
  addRemoveSelected(job: Jobs, isSelected: boolean) {
    var index = this.selectedItems.findIndex((tableItem: any) => tableItem.id === job.id || tableItem.id == job.originalRevisionId);
    if (isSelected && index == -1) {
      this.selectedItems.push(job);      
    }
    
    if (!isSelected && index > -1 && (this.selectedItems[index].departments.length > 1) || (this.selectedItems[index]?.departments.length == 1 && this.selectedItems[index]?.departments[0].id != this.selectedDept.id)) {
      this.selectedItems.splice(index, 1);
    }
  }
  onShowDialog() {
    this.isJobsLoaded = false;
    this.currentPage = 1;
    this.rowCount = 10;
    this.first = 0;
    this.getExistingJobs();
  }
  getExistingJobs() {
    let searchCriteria = new JobsSearchCriteria();
    searchCriteria.pageNumber = 1;
    searchCriteria.count = 1000;
    searchCriteria.sortField = 'Name';
    
    this.jobsService.getPagedJobsForOrg(Number(this.selectedDept.id), searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.jobs);
      this.selectedItems = [];
      for (const job of results) {
        const jobIdExistsInTable = this.selectedItems.find((x: any) => x.id === job.id);
        if (!jobIdExistsInTable) {
          this.selectedItems.push(job);
        }
      }
      this.totalCount = result.listCount;
      this.showNoResults = false;
      this.quickSearch.value = "";
      this.clearSearch();
    })
  }
  onModalSave() {
    this.isSaved = false;
    var selectedJobs: Jobs[] = [];
    this.selectedItems.forEach((j:any) => {
      var job = new Jobs();
      job = _.cloneDeep(j);
      selectedJobs.push(job);
    });
    const deptJobs = this.selectedItems.map((job:any) => {
      return job.originalRevisionId ?? job.id;
    });

    this.jobsService.saveJobsToDepartment(this.selectedDept.id, deptJobs).subscribe(result => {
      this.isSaved = true;
      this.onSaveJobs.emit(selectedJobs);
      this.onModalClose();
    });
  }
  onModalClose() {
    this.modalTableItems = [];
    this.selectedItems = [];
    this.selectedModalTableItems = [];
    this.showModal = false;
    this.showModalChange.emit(false);
  }

  getAllTasks(){
    this.tasksService.quickSearchTasks('%20').subscribe(response => {
      if(response){
        this.linkedTasks = response;
      }
    });
  }
  getTasksFlagTree() {
    this.taskFlagTree$.subscribe(result => {
      this.taskFlagTree = _.cloneDeep(result);
    });
  }
  toggleAdvancedSearch() {
    this.isAdvancedSearch = !this.isAdvancedSearch;
  }
  populateAdvancedSearch() {
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
    this.advancedSearchModel.tasks.flags = this.selectedLinkedJobsTree;
    this.advancedSearchModel.sites = this.selectedSites;
    this.advancedSearchModel.functionalAnalysis.flagSearch = this.selectedFAFlags;

    this.filtersResult = [];
    this.filters = '';
    if (this.advancedSearchModel.name != "") {
      this.filtersResult.push("Details");
    }
    if(this.selectedFlags.length > 0 && this.advancedSearchModel.flagsOption > 0) {
      this.filtersResult.push("Flags");
    }
    if (this.selectedGroups.length > 0 && this.advancedSearchModel.groupsOption > 0) {
      this.filtersResult.push("Groups");
    }
    if (this.advancedSearchModel.tasks.tasks.length > 0 || this.advancedSearchModel.tasks.frequency.ID > 0 || (this.selectedLinkedJobsTree.length > 0 && this.advancedSearchModel.tasks.searchOption)) {
      this.filtersResult.push("Tasks");
    }
    if (this.selectedSites.length > 0) {
      this.filtersResult.push("Sites/Departments");
    }
    if ((this.advancedSearchModel.functionalAnalysis.from != null && this.advancedSearchModel.functionalAnalysis.to != null) ||
      this.advancedSearchModel.functionalAnalysis.providers.length > 0 || this.advancedSearchModel.functionalAnalysis.events.length > 0 ||
      (this.selectedFAFlags.length > 0 && this.advancedSearchModel.functionalAnalysis.flagsOption > 0 )) {
      this.filtersResult.push("Functional Analysis");
    }
    if (this.filtersResult.length > 0) {
      this.filters = "Results filtered by: " + this.filtersResult.join(", ");
    }
    this.getJobs(this.currentPage,this.rowCount);
    this.isAdvancedSearch = false;
  }
  clearSearch() {
    this.advancedSearchModel = new JobsAdvancedSearch();
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.selectedSites = [];
    this.selectedFAFlags = [];
    this.selectedLinkedJobsTree = [];
    this.filtersResult = [];
    this.filters = '';
    this.getJobs(this.currentPage,this.rowCount);
  }
  getJobs(pageNumber:number , count:number, quickSearch?:boolean){
    let s = new JobsSearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'Name';
    s.quickSearch = this.quickSearch;
    this.currentPage = pageNumber;
    if(quickSearch){
      s.advancedSearch = null;

    } else {
      s.advancedSearch = this.advancedSearchModel;
    }
    this.isJobsLoaded = false;
    this.modalTableItems = [];
    this.jobsService.getJobsList(s).subscribe(result => {
      if(result){
        this.totalCount = result.listCount;
        this.jobs = _.cloneDeep(result.jobs);
        if(this.jobs.length == 0){
          this.showNoResults = true;
        } else {
          var jobsAlreadyAdded: Jobs[] = [];
          this.jobs.forEach(x=> {
            if (this.selectedItems.findIndex(i=> i.id == x.id) > -1) {
              jobsAlreadyAdded.push(x);
            }
          });    
          this.selectedModalTableItems = jobsAlreadyAdded;
        }

        this.modalTableItems = _.cloneDeep(this.jobs);
        this.modalTotalCount = this.totalCount;
        this.isJobsLoaded = true;
      }
    });
    
  }
  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getJobs(this.currentPage , e.value);
  }
  getFlagsTree() {
    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
    });
  }
  getGroupsTree() {
    this.groupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
    });
  }

  getAllJobs() {
    this.tasksService.quickSearchJobs('%20').subscribe(result => {
      this.linkedJobs = result;
    });
  }
  getSiteTree() {
    this.siteTree$.subscribe(result => {
      this.siteTree = _.cloneDeep(result);
    });
  }
  getFAflagsTree() {
    this.FAflagTree$.subscribe(result => {
      this.FAflagTree = _.cloneDeep(result);
    });
  }
  getProviders() {
    this.tasksService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getEvents() {
    this.tasksService.getEvents().subscribe(result => {
      this.events = result;
    });
  }
}
