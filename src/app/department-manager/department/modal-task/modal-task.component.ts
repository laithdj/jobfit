import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { JobsService } from 'src/app/jobs/jobs.service';
import { BatchAssociatedTasks } from 'src/app/shared/models/associatedtasks.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { Jobs } from 'src/app/shared/models/jobs.model';
import { Provider } from 'src/app/shared/models/provider.model';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { AdvancedSearch, Event, SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Task } from 'src/app/shared/models/task.model';
import { FetchFlagTree, FetchGroupTree, FetchSiteTree } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFlagTree, selectGroupTree, selectSiteTree } from 'src/app/store/job-fit.selectors';
import { FetchFATaskFlagTree, FetchJobFlagTree } from 'src/app/store/jobs-store/jobs.actions';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectFATaskFlagTree, selectJobFlagTree } from 'src/app/store/jobs-store/jobs.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';


@Component({
  selector: 'app-modal-task',
  templateUrl: './modal-task.component.html',
  styleUrls: ['./modal-task.component.css']
})
export class ModalTaskComponent implements OnInit {
  @Input() selectedDept: any;
  @Input() modalHeader: string = "";
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<boolean>();

  modalTableItems: any[] = [];
  modalTotalCount: number = 0;
  modalFirst: number = 0;
  selectedModalTableItems: any[] = [];
  showNoResults: boolean = false;
  isTaskLoaded: boolean = false;
  isSaved: boolean = true;
  isAdvancedSearch: boolean = false;
  advancedSearchModel: AdvancedSearch = new AdvancedSearch();
  quickSearch: QuickSearch = new QuickSearch();
  filtersResult: string[] = [];
  filters: string = '';
  type = [
    { name: 'Starts With', code: QuickSearchType.StartsWith },
    { name: 'Ends With', code: QuickSearchType.EndsWith },
    { name: 'Contains', code: QuickSearchType.Contains },
  ];
  field = [{ name: 'Name', code: 'Name' }];
  searchOptions = [{ id: 1, name: "Must Contain at least 1" }, { id: 2, name: "Must Contain all selected" }];
  freqOptions = [{ ID: 1, name: "Essential" }, { ID: 2, name: "Non-Essential" }];

  flagTree$ = this.store.pipe(select(selectFlagTree));
  flagTree: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];

  groupTree$ = this.store.pipe(select(selectGroupTree));
  groupTree: GroupsTree[] = [];
  selectedGroups: GroupsTree[] = [];

  jobFlagTree$ = this.jobsStore.pipe(select(selectJobFlagTree));
  jobFlagTree: FlagsTree[] = [];
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
  currentPage = 1;
  first:number = 0;
  rowCount = 10;
  totalCount: number = 0;
  advanceSearchLoaded = false;
  rowOptions = [10,20,30];
  frequency = { ID: 1, name: "Essential" };
  tasksToRemove: number[] = [];
  selectedItems: any[] = [];
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
      this.store.dispatch(new FetchGroupTree());
      this.store.dispatch(new FetchFATaskFlagTree([]));
      this.jobsStore.dispatch(new FetchJobFlagTree());
      this.jobsStore.dispatch(new FetchSiteTree([]));
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');

      this.getFlagsTree();
      this.getGroupsTree();
      this.getJobsFlagTree();
      this.getAllJobs();
      this.getSiteTree();
      this.getFAflagsTree();
      this.getEvents();
      this.getProviders();
      this.advanceSearchLoaded = true;
    }, 2000);
  }

  ngOnInit(): void {
  }

  onShowDialog() {
    this.isTaskLoaded = false;
    this.currentPage = 1;
    this.rowCount = 10;
    this.first = 0;
    this.modalTableItems = [];
    this.frequency = { ID: 1, name: "Essential" };
    this.getExistingTasks();
  }
  getExistingTasks() {
    this.isTaskLoaded = false;
    let searchCriteria = new SearchCriteria();
    searchCriteria.pageNumber = 1;
    searchCriteria.count = 1000;
    searchCriteria.sortField = 'Task.Name';
    searchCriteria.sortDir = "asc";
    
    this.tasksService.getPagedTaskSetsForJob(Number(this.selectedDept.id), searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.jobs);
      this.selectedItems = [];
      for (const task of results) {
        const taskIdExistsInTable = this.selectedItems.find((x: any) => x.taskId === task.task.id);
        if (!taskIdExistsInTable) {
          this.selectedItems.push(task);
        }
      }
      this.totalCount = result.listCount;
      this.cancelAdvanceSearch();
      this.showNoResults = false;
      
    })
  }
  selectRow(e:any, task: Task) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.addRemoveSelected(task, isSelected);
  }

  selectAllRows(e:any) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.modalTableItems.forEach((item) => {
      this.addRemoveSelected(item, isSelected);
    });
    
  }
  addRemoveSelected(task: Task, isSelected: boolean) {
    var index = this.selectedItems.findIndex((tableItem: any) => tableItem.taskId === task.originalRevisionId || tableItem.taskId === task.id);
    if (isSelected && index == -1) {
      this.selectedItems.push(task);      
    }
    if (!isSelected && index > -1) {
      if (!this.tasksToRemove.includes(task.originalRevisionId ?? task.id)) {
        this.tasksToRemove.push(task.originalRevisionId ?? task.id);
      }
      this.selectedItems.splice(index, 1);
    }
  }
  onModalSave() {
    this.isSaved = false;
     const associatedTasksIds = this.selectedItems.map((taskSet: any) => {
      return taskSet.task != null ? taskSet.taskId : (taskSet.originalRevisionId ?? taskSet.id);
    });
    const batchAssociatedTasks = new BatchAssociatedTasks();
    batchAssociatedTasks.associatedTaskIds = associatedTasksIds;
    batchAssociatedTasks.jobId = this.selectedDept.id;
    batchAssociatedTasks.frequency = this.frequency.name;
    batchAssociatedTasks.removedAssociatedTaskIds = this.tasksToRemove;
    this.jobsService.saveBatchTaskSet(batchAssociatedTasks).subscribe(result => {
      this.isSaved = true;
      this.onSave.emit(true);
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

  getTasks(pageNumber:number, count:number, quickSearch?: boolean, searchByContains?: boolean) {
    this.isTaskLoaded = false;
    this.modalTableItems = []
    let searchCriteria = new SearchCriteria();
    searchCriteria.pageNumber = pageNumber;
    searchCriteria.count = count;
    searchCriteria.sortField = 'Name';
    searchCriteria.quickSearch = { ...this.quickSearch };
    searchCriteria.advancedSearch = quickSearch ? null : this.advancedSearchModel;
    if (searchByContains) 
      searchCriteria.quickSearch.type = QuickSearchType.Contains;
    
    this.tasksService.getTaskList(searchCriteria).subscribe(result => {
      
      if(result){
        this.totalCount = result.listCount;
        const tasks = _.cloneDeep(result.tasks);
        if(tasks.length == 0){
          this.showNoResults = true;
        }else {
          const tasksAlreadyAdded = tasks.filter(task => this.selectedItems?.some((tableItem: any) => tableItem.taskId === task.id || tableItem.id === task.id));
          this.selectedModalTableItems = tasksAlreadyAdded;
        }
        
        this.modalTableItems = _.cloneDeep(tasks);
        this.modalTotalCount = this.totalCount;
        this.isTaskLoaded = true;
      }
    });
  }
  setRows(e: any){
    this.rowCount = e.value
    this.currentPage = 1;
    this.first = 0;
    this.getTasks(this.currentPage , e.value);
  }
  toggleAdvancedSearch() {
    this.isAdvancedSearch = !this.isAdvancedSearch;
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
    if (this.advancedSearchModel.jobs.jobs.length > 0 || this.advancedSearchModel.jobs.frequency.ID > 0 || this.selectedLinkedJobsTree.length > 0) {
      this.filtersResult.push("Jobs");
    }
    if (this.selectedSites.length > 0) {
      this.filtersResult.push("Sites");
    }
    if ((this.advancedSearchModel.functionalAnalysis.from != null && this.advancedSearchModel.functionalAnalysis.to != null) ||
      this.advancedSearchModel.functionalAnalysis.providers.length > 0 || this.advancedSearchModel.functionalAnalysis.events.length > 0 ||
      (this.selectedFAFlags.length > 0 && this.advancedSearchModel.functionalAnalysis.flagsOption > 0 )) {
      this.filtersResult.push("Functional Analysis");
    }

    if (this.filtersResult.length > 0) {
      this.filters = "Results filtered by: " + this.filtersResult.join(", ");
    }
    this.getTasks(this.currentPage,this.rowCount);
    this.isAdvancedSearch = false;
  }
  cancelAdvanceSearch(){
    this.advancedSearchModel = new AdvancedSearch();
    this.quickSearch.value = '';
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.selectedSites = [];
    this.selectedFAFlags = [];
    this.selectedLinkedJobsTree = [];
    this.filtersResult = [];
    this.filters = '';
    this.getTasks(this.currentPage,this.rowCount);
  }
  onPageChange(e:any){
    this.first = e.first;
    this.getTasks(e.page + 1,this.rowCount);
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
  getJobsFlagTree() {
    this.jobFlagTree$.subscribe(result => {
      this.jobFlagTree = _.cloneDeep(result);
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
