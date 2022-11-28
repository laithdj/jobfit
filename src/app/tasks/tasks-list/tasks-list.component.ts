import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MenuItem, TreeNode } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { JobsService } from 'src/app/jobs/jobs.service';
import { ReportsService } from 'src/app/reports/reports.service';
import { toTitleCase } from 'src/app/shared/helper/stringhelper';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { BatchOptionsView, BatchRenameAdjusted, EBatchTaskAction, EChangeCaseOptionTypes, ECopyIncludeOptionTypes, EJobFitEntity } from 'src/app/shared/models/batch.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { BatchCopyOptions, CombineOptionsView, Jobs, RenameOptions, SupplementaryEntity } from 'src/app/shared/models/jobs.model';
import { Provider } from 'src/app/shared/models/provider.model';
import { EReportType, Report, ReportOptions } from 'src/app/shared/models/reports.model';
import { EUseRecords } from 'src/app/shared/models/risks.search.model';
import { SiteTree } from 'src/app/shared/models/sites.model';
import { Task, TaskItem } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { FetchFlagTree, FetchGroupTree, FetchSiteTree, SetBreadCrumb, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFlagTree, selectFunctionList, selectGroupTree, selectSiteTree } from 'src/app/store/job-fit.selectors';
import { FetchFATaskFlagTree, FetchJobFlagTree } from 'src/app/store/jobs-store/jobs.actions';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectFATaskFlagTree, selectJobFlagTree } from 'src/app/store/jobs-store/jobs.selectors';
import { QuickSearch, QuickSearchType } from '../../shared/models/quicksearch.model';
import { AdvancedSearch, Event, SearchCriteria } from '../../shared/models/search.criteria.model';
import { TasksService } from '../tasks-service.service';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent implements OnInit {
  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  selectTaskMessage: string = "! Please select one or more tasks from the list to action."
  combineInfo: string = "Please select the tasks to combine. To ensure no duplicates the task you select to combine WITH will be deleted - to avoid any loss of data please make sure to combine the Details section manually before proceeding.";
  advancedSearch = false;
  selectedTasks: any[] = [];
  selectedBatchTasks:any[] = [];
  combineTasksBox = false;
  tasksList: Task[] = [];
  selectedFlagOption: string = '1';
  selectedGroupOption: string = '1';
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
  flagBatchTree: FlagsTree[] = [];
  FAflagTree: FlagsTree[] = [];
  groupTree: GroupsTree[] = [];
  groupBatchJobTree: GroupsTree[] = [];
  groupBatchTree: GroupsTree[] = [];
  siteTree: DeptTree[] = [];
  jobsFlagTree: FlagsTree[] = [];
  selectedFiles: FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  selectedGroups: GroupsTree[] = [];
  showNoResults = false;
  selectedSites: DeptTree[] = [];
  taskSiteTree: SiteTree[]= [];
  batchSiteTree: SiteTree[]= [];
  currentPage = 0;
  rowCount = 10;
  selectedLinkedJobs: Jobs[] = [];
  advancedSearchModel: AdvancedSearch = new AdvancedSearch();
  providers: Provider[] = [];
  events: Event[] = [];
  selectedLinkedJobsTree:FlagsTree[] = [];
  first:number = 0;
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  freqOptions = [{ID:1 , name: "Essential"},{ID:2 , name: "Non-Essential"}];
  newTaskBox = false;
  rowOptions = [10,20,30]
  combineOptions: CombineOptionsView = new CombineOptionsView();
  flagTree$ = this.store.pipe(select(selectFlagTree));
  FAflagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  groupTree$ = this.store.pipe(select(selectGroupTree));
  siteTree$ = this.store.pipe(select(selectSiteTree))
  linkedJobs: Jobs[] = [];
  jobFlagTree$ = this.jobsStore.pipe(select(selectJobFlagTree));
  jobFlagTree: FlagsTree[] = [];
  flagBatchJobTree: FlagsTree[] = [];
  errorMessage = '';
  displayError = false;
  advanceSearchLoaded = false;
  activeCombine: boolean[] = [true, false, false];
  type = [
    {name: 'Starts With', code: QuickSearchType.StartsWith},
    {name: 'Ends With', code: QuickSearchType.EndsWith},
    {name: 'Contains', code: QuickSearchType.Contains},
  ];
  field = [
    {name: 'Name', code: 'Name'},
  ];
  batchActions = [
    {name: 'Please select an action to perform on all selected Tasks', code: -1}
  ];
  includeList = [{id:ECopyIncludeOptionTypes.AssociatedJobs, value: 'Associated Jobs'} ,
              {id:ECopyIncludeOptionTypes.Notes , value:'Notes'} , {id:ECopyIncludeOptionTypes.Flags, value: 'Flags'},
              {id:ECopyIncludeOptionTypes.Groups , value:'Groups'}, {id:ECopyIncludeOptionTypes.Attachments, value: 'Attachments'} ,
              {id:ECopyIncludeOptionTypes.HH , value: 'Health & Hygiene'}, {id:ECopyIncludeOptionTypes.FA , value: 'Functional Analysis Records'} ,
              {id:ECopyIncludeOptionTypes.HF , value: 'Human Factors'}, {id:ECopyIncludeOptionTypes.EF , value: 'Environmental Factors'},
              {id:ECopyIncludeOptionTypes.PPE , value: 'Personal Protective Equipment'}];
  includeListJob = [{id:ECopyIncludeOptionTypes.Notes  , value:'Notes'} , {id:ECopyIncludeOptionTypes.Flags, value: 'Flags'},
              {id:ECopyIncludeOptionTypes.Groups , value:'Groups'}, {id:ECopyIncludeOptionTypes.Attachments , value: 'Attachments'} ,
              {id:ECopyIncludeOptionTypes.HH , value: 'Health & Hygiene'}]
  actionNote: string = "Note: To use Batch Actions, please select one or more tasks from grid below.";
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  filtersResult: string[] = [];
  filters: string = '';
  detailsSaved: boolean = true;
  isLoaded: boolean = true;
  action: number = -1;
  isBatchOn = false;
  isBatchSaved: boolean = true;
  isSiteTreeLoaded: boolean = true;
  batchTaskFlags: boolean = false;
  batchTaskGroups: boolean = false;
  batchTaskSites: boolean = false;
  batchTaskTitles: boolean = false;
  batchTaskCopy: boolean = false;
  batchTaskGenerateReport: boolean = false;
  isBatchReportGenerated: boolean = true;
  selectedBatchFlagOption: number = 1;
  selectedBatchGroupOption: number = 1;
  selectedBatchSiteOption: number = 1;
  selectedBatchGroups: GroupsTree[] =[];
  selectedBatchFlags: FlagsTree[]= [];
  selectedBatchSites: SiteTree[]= [];
  expandedRows: any = {};
  selectedSiteNumbs: number[] = [];
  showBatchMessage: boolean = false;
  activeBatchTitle: boolean[] = [true, false];
  batchAppendStart: string = "";
  batchAppendEnd: string = "";
  batchDeleteStart: string = "";
  batchDeleteEnd: string = "";
  adjustmentResults: BatchRenameAdjusted[] = []
  selectedCaseChangeOption: number = EChangeCaseOptionTypes.LeaveUnchanged;
  selectAllSitesLabel: string = "Select All";
  isSelectAllClicked: boolean = false;
  activeIndex: number = 0;
  generalOptions: any = {
    includeBiologicalSex: "Include Biological Sex",
    includeAddress: "Include Address",
    includeImageAttachments: "Include Image Attachments",
    includeFaqPage: "Include FAQ Page",
  };
  includeBiologicalSex: boolean = false;
  includeAddress: boolean = false;
  includeImageAttachments: boolean = false;
  includeFaqPage: boolean = true;
  isStandard: boolean = true;
  reports: Report[] = [];
  selectedPosturalTolerances: string[] = [];
  selectedMaterialHandlings: string[] = [];
  selectedReport: Report = new Report();
  selectedReportId: number = 0;
  selectedRecordSelection: string = "";
  selectedFromDateValue: string = "";
  selectedToDateValue: string = "";
  posturalTolerancesOptions: any = this.setPosturalDropdownData();
  materialHandlingsOptions: any = this.setMaterialDropdownData();
  functionalAnalysisOptions: any = {
    includeFaRecords: "Include Functional Analysis Records",
    includeFaGraphs: "Include Functional Analysis Record Graphs",
  };
  includeFaRecords: boolean = true;
  includeFaGraphs: boolean = false;
  recordSelectionOptions = [
    {label: EUseRecords.Current, id: EUseRecords.Current},
    {label: EUseRecords.All, id: EUseRecords.All},
    {label: EUseRecords.Between, id: EUseRecords.Between}
  ];
  batchCopyOptions: BatchCopyOptions = new BatchCopyOptions();
  selectLinkTo: number = 1;
  selectedOptions:number[] =[];
  selectedOptionsJob:number[] =[];
  showLinkTo: boolean = true;
  activeCopy: boolean[] = [true, false, false];
  activeJobCopy: boolean[] = [true, false, false];
  selectedBatchJobGroups: GroupsTree[] =[];
  selectedBatchJobFlags: FlagsTree[]= [];
  selectedBatchJobFlagOption: number = 1;
  selectedBatchJobGroupOption: number = 1;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(private router: Router,
     private translateService: TranslateService,
     private route: ActivatedRoute,
     private store: Store<JobFitAppState>,
     private titleService: Title,
     private jobsStore: Store<JobsAppState>,
     private reportService: ReportsService,
     private jobService: JobsService,
     private tasksService: TasksService) {
      
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.store.dispatch(new ShowSideMenu(false));
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");

      if (Object.keys(this.authorisedFunctionList.Function).length > 0){
        if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
          this.setupBatchActions();
          this.getTasks(1,10);
          setTimeout(() => {
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
            this.getTaskSiteTree();
            this.getFlagsTree();
            this.getGroupsTree();
            this.getJobGroupsTree();
            this.getJobsFlagTree();
            this.getReports();
            this.advanceSearchLoaded = true;
          }, 2000);
        } else {
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }

      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Tasks'}
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.titleService.setTitle('Tasks');
      }

  ngOnInit(): void {
  }
  setupBatchActions() {
    if (this.authorisedFunctionList.Function[EFunctions.AssignFlags]) {
      this.batchActions.push({name: 'Set/Remove Task Flags', code: EBatchTaskAction.SetRemoveTaskFlag});
    }
    if (this.authorisedFunctionList.Function[EFunctions.AssignGroups]) {
      this.batchActions.push({name: 'Add/Remove Task/s to/from Groups', code: EBatchTaskAction.AddRemoveTaskGroup});
    }
    if (this.authorisedFunctionList.Function[EFunctions.EditTask]) {
      this.batchActions.push({name: 'Add/Remove Task/s to/from Sites', code: EBatchTaskAction.AddRemoveTaskSite});
    }
    if (this.authorisedFunctionList.Function[EFunctions.CopyTasks]) {
      this.batchActions.push({name: 'Copy Task/s', code: EBatchTaskAction.CopyTask});
    }
    if (this.authorisedFunctionList.Function[EFunctions.EditTask]) {
      this.batchActions.push({name: 'Adjust Task Title/s', code: EBatchTaskAction.AdjustTaskTitle});
    }
    if (this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      this.batchActions.push({name: 'Generate Task Report/s', code: EBatchTaskAction.GenerateTaskReport});
    }
  }
  selectAllSitesToggle() {
    this.isSelectAllClicked= !this.isSelectAllClicked;
    if (this.isSelectAllClicked) {
      this.selectAllSitesLabel = "Deselect All";
      this.selectAllSites();
    } else {
      this.selectAllSitesLabel = "Select All";
      this.deselectAllSites();
    }
  }
  selectAllSites() {
    this.batchSiteTree.forEach(node => {
      this.expandRecursiveSite(node, false);
  });
  }
  deselectAllSites() {
    this.selectedBatchSites = []
    this.collapseAll(this.batchSiteTree);
  }

  expandRecursiveSite(node:TreeNode|any, isExpand:boolean){
    node.expanded = isExpand;
    node.partialSelected = true;
    if (!this.selectedBatchSites.find(x=> x.id === node.id && x.typeId == 7)) {
      this.selectedBatchSites.push(node);
    }
    if (node.children){
        node.children.forEach( (childNode:any) => {
            this.expandRecursiveSite(childNode, isExpand);
        } );
    }
  }
  batchToggle(){
    this.isBatchOn = !this.isBatchOn;
    this.action = -1;
    this.selectedTasks = [];
    this.selectedBatchTasks = [];
    this.resetBatch();
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
  setMaterialDropdownData() {
    const getMaterialGroups = this.tasksService.getMaterialHandlingGroups();
    const getMaterialFrequencies = this.tasksService.getMaterialHandlingFrequencies();
    forkJoin([getMaterialGroups, getMaterialFrequencies]).subscribe(([groups, frequencies]) => {
      const formattedResults = frequencies.map(freq => ({
        label: freq.name,
        items: groups
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(item => ({
            label: item.name,
            value: `${freq.name}_${item.id}`,
          }))
      }))
      this.materialHandlingsOptions = formattedResults;
    });
  }
  setPosturalDropdownData() {
    this.tasksService.getPosturalToleranceGroups().subscribe(result => {
      const formattedResults = result
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(res => ({
          label: res.name,
          items: res.items
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(item => ({
              label: item.name,
              value: item.id,
            }))
        }))
      this.posturalTolerancesOptions = formattedResults;
    });
  }
  showDatePickers() {
    const betweenOption = EUseRecords.Between;
    return this.selectedRecordSelection === betweenOption;
  }
  selectedBatchSiteChange(e: any, site:SiteTree) {
    if (e?.checked == true && !this.selectedBatchSites.find(x=> x.id === site.id)) {
      this.selectedBatchSites.push(site);
    } else {
      const idx = this.selectedBatchSites.findIndex((x) => x.id === site.id);
      if (idx > -1) {
        this.selectedBatchSites.splice(idx, 1);
      }
    }
  }
  setRemoveTaskFlags() {
    var flags = this.selectedBatchFlags.filter(x=> x.typeId != 3);
    if (flags.length == 0 && this.selectedBatchFlagOption == 1) {
      this.errorMessage = "Please select Flag/s to set";
      this.displayError = true;
    }
    else if (flags.length == 0 && this.selectedBatchFlagOption == 2) {
      this.errorMessage = "Please select Flag/s to remove";
      this.displayError = true;
    }
    else {
      this.applyBatch();
    }
  }
  getJobGroupsTree() {
    this.jobService.getJobsGroupTree().subscribe(result => {
      this.groupBatchJobTree = _.cloneDeep(result);
    });
  }
  saveBatchCopy(){
    this.isBatchSaved = false;
    var batchOptions = new BatchOptionsView();
    const ids = this.selectedBatchTasks.map((task:Task) => {
      return task.originalRevisionId ?? task.id;
    });
    batchOptions.ids = ids;
    batchOptions.jobFitEntityType = EJobFitEntity.Tasks;
    this.batchCopyOptions.primaryCopyOptions.copyAssociatedEntities = this.selectedOptions.includes(ECopyIncludeOptionTypes.AssociatedJobs)? this.selectLinkTo == 2 : undefined ;
    this.batchCopyOptions.primaryCopyOptions.copyIncludeOptions = this.selectedOptions;
    this.batchCopyOptions.entityIds = ids;

    this.batchCopyOptions.associatedCopyOptions.copyAssociatedEntities = this.selectedOptions.includes(ECopyIncludeOptionTypes.AssociatedJobs) && this.selectLinkTo == 2 ? true: undefined;
    this.batchCopyOptions.associatedCopyOptions.copyIncludeOptions = this.selectedOptionsJob;

    var flagsEntityArray: SupplementaryEntity[] = [];
    var groupsEntityArray: SupplementaryEntity[] = [];

    this.selectedBatchFlags.forEach(element => {
      let entity = new SupplementaryEntity();
      entity.Id = element.id;
      flagsEntityArray.push(entity);
    });
    this.selectedBatchGroups.forEach(element => {
      let entity = new SupplementaryEntity();
      entity.Id = element.id;
      groupsEntityArray.push(entity);
    });

    if(this.selectedBatchFlagOption === 1){
      this.batchCopyOptions.primaryCopyOptions.flagsToSet = flagsEntityArray;
    } else {
      this.batchCopyOptions.primaryCopyOptions.flagsToRemove = flagsEntityArray;
    }
    if(this.selectedBatchGroupOption === 1){
      this.batchCopyOptions.primaryCopyOptions.groupsToSet = groupsEntityArray;
    } else {
      this.batchCopyOptions.primaryCopyOptions.groupsToRemove = groupsEntityArray;
    }

    var flagsEntityArrayJobs: SupplementaryEntity[] = [];
    var groupsEntityArrayJobs: SupplementaryEntity[] = [];
    this.selectedBatchJobFlags.forEach(element => {
      let entity = new SupplementaryEntity();
      entity.Id = element.id;
      flagsEntityArrayJobs.push(entity);
    });
    this.selectedBatchJobGroups.forEach(element => {
      let entity = new SupplementaryEntity();
      entity.Id = element.id;
      groupsEntityArrayJobs.push(entity);
    });
    if(this.selectedBatchJobFlagOption === 1){
      this.batchCopyOptions.associatedCopyOptions.flagsToSet = flagsEntityArrayJobs;
    } else {
      this.batchCopyOptions.associatedCopyOptions.flagsToRemove = flagsEntityArrayJobs;
    }
    if(this.selectedBatchJobGroupOption === 1){
      this.batchCopyOptions.associatedCopyOptions.groupsToSet = groupsEntityArrayJobs;
    } else {
      this.batchCopyOptions.associatedCopyOptions.groupsToRemove = groupsEntityArrayJobs;
    }

    batchOptions.batchCopyOptions = _.cloneDeep(this.batchCopyOptions);
    this.tasksService.saveBatchCopy(batchOptions).subscribe(response => {
      if(response){
        if(response){
          this.isBatchSaved = true;
          this.cancelAction();
          this.selectedTasks = [];
          this.selectedBatchTasks = [];
          this.getTasks(this.currentPage,this.rowCount);
          this.getAllTasks();
        }
      }
    });
  }
  onIncludeChange() {
    if (this.selectedOptions.includes(ECopyIncludeOptionTypes.AssociatedJobs)) {
      this.showLinkTo = true;
    } else {
      this.showLinkTo = false;
    }
  }
  onCopyTabOpen(e:any) {
    this.activeCopy = [false, false, false];
    this.activeCopy[e.index] = true;
  }
  onCopyTabClose(e:any) {
    this.activeCopy[e.index] = false;
  }
  onCopyJobTabOpen(e:any) {
    this.activeJobCopy = [false, false, false];
    this.activeJobCopy[e.index] = true;
  }
  onCopyJobTabClose(e:any) {
    this.activeJobCopy[e.index] = false;
  }
  saveBatchFlags() {
    this.isBatchSaved = false;
    var flags = this.selectedBatchFlags.filter(x=> x.typeId != 3);
    var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchTasks.map((task:Task) => {
        return task.originalRevisionId ?? task.id;
      });
      batchOptions.ids = ids;
      if(this.selectedBatchFlagOption === 1){
        batchOptions.isSet = true;
      } else {
        batchOptions.isSet = false;
      }
      const flagIds = flags.map((f:any) => {
        return f.id;
      });
      batchOptions.flagIds = flagIds;
      batchOptions.jobFitEntityType = EJobFitEntity.Tasks;

      this.tasksService.saveBatchFlags(batchOptions).subscribe((response:any) => {
        if(response){
          this.isBatchSaved = true;
          this.batchTaskFlags = false;
          this.cancelAction();
          this.selectedTasks = [];
          this.selectedBatchTasks = [];
          this.getTasks(this.currentPage,this.rowCount);
        }
      });
  }
  onBatchActionChange(e:any){
    this.action = e?.value;
    if (this.selectedBatchTasks.length < 1) {
      this.cancelAction();
      this.errorMessage = "Please select one or more tasks from grid below to perform Batch action";
      this.displayError = true;
    } else {
      switch(this.action) {
        case EBatchTaskAction.SetRemoveTaskFlag:
        {
          this.batchTaskFlags = true;
          break;
        }
        case EBatchTaskAction.AddRemoveTaskGroup:
        {
          this.batchTaskGroups = true;
          break;
        }
        case EBatchTaskAction.AddRemoveTaskSite:
        {
          this.batchTaskSites = true;
          break;
        }
        case EBatchTaskAction.AdjustTaskTitle:
        {
          this.setBatchAdjustTitles();
          break;
        }
        case EBatchTaskAction.CopyTask:
        {
          this.batchTaskCopy = true;
          break;
        }
        case EBatchTaskAction.GenerateTaskReport:
        {
          this.prePopulateSelections();
          this.batchTaskGenerateReport = true;
          break;
        }
      }
    }
  }

  setBatchAdjustTitles() {
    this.adjustmentResults = [];
    this.selectedBatchTasks.forEach((x:Task) => {
        var adjusted = new BatchRenameAdjusted();
        adjusted.id = x.originalRevisionId ?? x.id;
        adjusted.name = x.name;
        adjusted.adjustedName = x.name;
        this.adjustmentResults.push(adjusted);
    });
    this.batchTaskTitles = true;
  }
  applyBatch() {
    switch(this.action) {
      case EBatchTaskAction.SetRemoveTaskFlag:
      {
        this.saveBatchFlags();
        break;
      }
      case EBatchTaskAction.AddRemoveTaskGroup:
      {
        this.saveBatchGroup();
        break;
      }
      case EBatchTaskAction.AddRemoveTaskSite:
      {
        this.saveBatchSite();
        break;
      }
      case EBatchTaskAction.GenerateTaskReport:
      {
        break;
      }
    }
  }
  cancelAction() {
    this.resetBatch();
    this.action = -1;
  }
  resetBatch() {
    this.batchAppendEnd = "";
    this.batchAppendStart = "";
    this.batchDeleteEnd = "";
    this.batchDeleteStart = "";
    this.activeIndex = 0;
    this.activeBatchTitle = [true, false];
    this.activeCopy = [true, false, false];
    this.activeJobCopy = [true, false, false];
    this.selectedCaseChangeOption = EChangeCaseOptionTypes.LeaveUnchanged;
    this.selectedBatchFlagOption = 1;
    this.selectedBatchGroupOption = 1;
    this.selectedBatchJobFlagOption = 1;
    this.selectedBatchJobGroupOption = 1;
    this.selectedBatchSiteOption = 1;
    this.selectLinkTo = 1;
    this.showLinkTo = true;
    this.isSelectAllClicked = false;
    this.selectAllSitesLabel = "Select All";
    this.showBatchMessage = false;
    this.selectedFromDateValue = "";
    this.selectedToDateValue = "";
    this.selectedPosturalTolerances = [];
    this.selectedMaterialHandlings = [];
    this.collapseAll(this.flagBatchTree);
    this.collapseAll(this.groupBatchTree);
    this.collapseAll(this.flagBatchJobTree);
    this.collapseAll(this.groupBatchJobTree);
    this.collapseAll(this.batchSiteTree);
    this.selectedBatchFlags = [];
    this.selectedBatchGroups = [];
    this.selectedBatchSites = [];
    this.selectedBatchJobFlags = [];
    this.selectedBatchJobGroups = [];
    this.batchTaskFlags = false;
    this.batchTaskGroups = false;
    this.batchTaskSites = false;
    this.batchTaskTitles = false;
    this.batchTaskCopy = false;
    this.batchTaskGenerateReport = false;
    this.selectedOptions = [11, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.selectedOptionsJob = [1, 2, 3, 4, 5];
    this.batchCopyOptions = new BatchCopyOptions();
    this.batchCopyOptions.primaryCopyOptions.renameOptions.nameAppendEnd = " - Copy";
    this.batchCopyOptions.associatedCopyOptions.renameOptions.nameAppendEnd = " - Copy";
  }
  handleTabChange(e:any) {
    this.activeIndex = e.index;
    this.activeBatchTitle = [true, false];
  }
  onTabOpen(e:any) {
    if (e.index == 0) {
      this.activeBatchTitle = [true, false];
    } else {
      this.activeBatchTitle = [false, true];
    }

  }
  onTabClose(e:any) {
    this.activeBatchTitle[e.index] = false;
  }
  generateReport() {
    this.isBatchReportGenerated = false;
    const ids = this.selectedBatchTasks.map((task:Task) => {
      return task.originalRevisionId ?? task.id;
    });
    const selectedMaterials = this.selectedMaterialHandlings;
    function getSelectedMaterialIdsByType(type: string) {
      return selectedMaterials.reduce<number[]>((resultArr, currentItem) => {
        if (currentItem.startsWith(type)) {
          const removedPrefix = currentItem.replace(type + "_", "");
          const id = Number(removedPrefix);
          resultArr.push(id);
        }
        return resultArr;
      }, []);
    }

    const reportOptions: ReportOptions = {
      ...new ReportOptions(),
      ids: ids,
      jobFitEntityType: EJobFitEntity.Tasks,
      reportName: this.selectedReport.name,
      reportId: this.selectedReport.id,
      isStandard: this.isStandard,
      isSummary: this.selectedReport.name?.includes("Summary"),
      generalReportOptions: {
        includeBiologicalSex: this.includeBiologicalSex,
        includeAddress: this.includeAddress,
        includeFAQPage: this.includeFaqPage,
        includeImageAttachments: this.includeImageAttachments,
        includeJobfitMatchingGrid: false
      },
      faReportOptions: {
        recordSelectionOption: this.selectedRecordSelection,
        includeRecords: this.includeFaRecords,
        includeGraphs: this.includeFaGraphs,
        posturalToleranceIds: this.selectedPosturalTolerances.map(x => Number(x)),
        materialHandlingContinuousIds: getSelectedMaterialIdsByType("Continuous"),
        materialHandlingFrequentIds: getSelectedMaterialIdsByType("Frequent"),
        materialHandlingOccassionalIds: getSelectedMaterialIdsByType("Occasional"),
        startDate: new Date(moment(this.selectedFromDateValue).format('YYYY-MM-DD')),
        endDate: new Date(moment(this.selectedToDateValue).format('YYYY-MM-DD'))
      }
    };

    this.reportService.viewBatchReport(reportOptions).subscribe(result => {
      if(result) {
        let type = result?.type ?? "application/zip";
        let fileName = "Reports";
        let blob = new Blob([result],{ type: type });
        const file = new File([blob], fileName, { type: type });
        var fileURL = URL.createObjectURL(file);
        const htmlElement: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
        htmlElement.href = fileURL;
        htmlElement.download = fileName;
        htmlElement.type = type
        document.body.appendChild(htmlElement);
        htmlElement.click();
        document.body.removeChild(htmlElement);
        URL.revokeObjectURL(fileURL);

        this.cancelAction();
        this.selectedTasks = [];
        this.selectedBatchTasks = [];
        this.isBatchReportGenerated = true;
      }
    })
  }
  selectedValue(e: any){
    this.selectedReportId = e.value;
    this.selectedReport = this.reports.filter(x => x.id == this.selectedReportId)[0];
    this.isStandard = this.selectedReport.name.indexOf("Standard") > -1 ? true: false;
    if ((this.selectedReport.reportSection.filter(x=> x.reportSection.description == 'Functional Records').length > 0)) {
      this.includeFaRecords = true;
    }

  }
  sectionExist(reportSectionId: number): boolean {
    if(this.selectedReport && this.selectedReport.reportSection && this.selectedReport.reportSection.find((x) => x.reportSectionId === reportSectionId)){
      return true;
    }else{
      return false;
    }
  }

  getReports() {
    this.isBatchReportGenerated = false;
    this.reportService.getReports(EReportType.Task).subscribe(result => {
      this.reports = result.reports;
      //set to standard report
      if (this.reports.length > 0) {
        this.selectedReport = this.reports[0];
        this.selectedReportId = this.selectedReport.id;
      }
      this.isBatchReportGenerated = true;
    });
  }
  prePopulateSelections() {
    this.isStandard = true;
    this.includeFaqPage = true;
    this.includeBiologicalSex = false;
    this.includeAddress = false;
    this.includeImageAttachments = false;
    this.includeFaRecords = true;
    this.includeFaGraphs = false;
    const currentRecordCollection = EUseRecords.Current;
    this.selectedRecordSelection = currentRecordCollection;
    if (this.reports.length > 0) {
      this.selectedReport = this.reports[0];
      this.selectedReportId = this.selectedReport.id;
    }
  }
  addRemoveTaskGroups() {
    var groups = this.selectedBatchGroups.filter(x=> x.typeId != 3);
    if (groups.length == 0 && this.selectedBatchGroupOption == 1) {
      this.errorMessage = "Please select Groups/s to set";
      this.displayError = true;
    }
    else if (groups.length == 0 && this.selectedBatchGroupOption == 2) {
      this.errorMessage = "Please select Group/s to remove";
      this.displayError = true;
    }
    else{
      this.applyBatch();

    }
  }
  saveAdjustTaskTitle() {
    this.isBatchSaved = false;
    var batchOptions = new BatchOptionsView();
    const ids = this.selectedBatchTasks.map((task:Task) => {
      return task.originalRevisionId ?? task.id;
    });
    batchOptions.ids = ids;
    batchOptions.jobFitEntityType = EJobFitEntity.Tasks;

    var renameOptions = new RenameOptions();
    renameOptions.changeCaseOption = this.selectedCaseChangeOption.toString();
    renameOptions.nameAppendEnd = this.batchAppendEnd;
    renameOptions.nameAppendStart = this.batchAppendStart;
    renameOptions.nameDeleteEnd = this.batchDeleteEnd;
    renameOptions.nameDeleteStart = this.batchDeleteStart;
    batchOptions.renameOptions = renameOptions;

    this.tasksService.saveBatchRename(batchOptions).subscribe((response:any) => {
      if(response){
        this.isBatchSaved = true;
        this.cancelAction();
        this.selectedTasks = [];
        this.selectedBatchTasks = [];
        this.getTasks(this.currentPage,this.rowCount);
        this.getAllTasks();
      }
    });
  }
  saveBatchGroup() {
    this.isBatchSaved = false;
    var groups = this.selectedBatchGroups.filter(x=> x.typeId != 3);
    var batchOptions = new BatchOptionsView();
    const ids = this.selectedBatchTasks.map((task:Task) => {
      return task.originalRevisionId ?? task.id;
    });
    batchOptions.ids = ids;
    if(this.selectedBatchGroupOption === 1){
      batchOptions.isSet = true;
    } else {
      batchOptions.isSet = false;
    }
    const groupIds = groups.map((g:any) => {
      return g.id;
    });
    batchOptions.groupIds = groupIds;
    batchOptions.jobFitEntityType = EJobFitEntity.Tasks;

    this.tasksService.saveBatchGroups(batchOptions).subscribe((response:any) => {
      if(response){
        this.isBatchSaved = true;
        this.batchTaskGroups = false;
        this.cancelAction();
        this.selectedTasks = [];
        this.selectedBatchTasks = [];
        this.getTasks(this.currentPage,this.rowCount);
      }
    });
  }
  addRemoveTaskSites() {
    var sites = this.selectedBatchSites.filter(x=> x.typeId === 7);
    if (sites.length == 0 && this.selectedBatchSiteOption == 1) {
      this.errorMessage = "Please select Site/s to set";
      this.displayError = true;
    }
    else if (sites.length == 0 && this.selectedBatchSiteOption == 2) {
      this.errorMessage = "Please select Site/s to remove";
      this.displayError = true;
    }
    else{
      this.applyBatch();
    }
  }
  saveBatchSite() {
    this.isBatchSaved = false;
    var sites = this.selectedBatchSites.filter(x=> x.typeId === 7);
    var batchOptions = new BatchOptionsView();
    const ids = this.selectedBatchTasks.map((task:Task) => {
      return task.originalRevisionId ?? task.id;
    });
    batchOptions.ids = ids;
    if(this.selectedBatchSiteOption === 1){
      batchOptions.isSet = true;
    } else {
      batchOptions.isSet = false;
    }
    const siteIds = sites.map((g:any) => {
      return g.id;
    });
    batchOptions.orgIds = siteIds;
    batchOptions.jobFitEntityType = EJobFitEntity.Tasks;

    this.tasksService.saveBatchSites(batchOptions).subscribe((response:any) => {
      if(response){
        this.isBatchSaved = true;
        this.batchTaskSites = false;
        this.cancelAction();
        this.selectedTasks = [];
        this.selectedBatchTasks = [];
        this.getTasks(this.currentPage,this.rowCount);
      }
    });
  }
  addTask() {
    if (this.authorisedFunctionList.Function[EFunctions.AddTask]) {
      this.task = new Task();
      this.collapseAll(this.taskSiteTree);
      this.selectedSiteNumbs = [];
      this.newTaskBox = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
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
  getJobsFlagTree() {
    this.jobFlagTree$.subscribe(result => {
      this.jobFlagTree = _.cloneDeep(result);
      this.flagBatchJobTree = _.cloneDeep(result);
    });
  }
  cancelCombineBox(){
    this.combineOptions = new CombineOptionsView();
    this.selectedFlagOption = '1';
    this.selectedGroupOption = '1';
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.combineTasksBox = false
  }

  resetCombineBox(){
    this.combineOptions = new CombineOptionsView();
    this.selectedFlagOption = '1';
    this.selectedGroupOption = '1';
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.collapseAll(this.flagTree);
    this.collapseAll(this.groupTree);
    this.activeCombine = [true, false, false];
  }
  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getTasks(this.currentPage , e?.value);
  }
  refresh() {
    this.getTasks(this.currentPage, this.rowCount);
  }
  onTitleChange() {
    this.adjustmentResults.forEach((x:BatchRenameAdjusted) => {
      var adjustedName = x.name;

      // first delete the start/end parts of the name if required
      if (this.batchDeleteStart != '' && adjustedName.startsWith(this.batchDeleteStart)) {
          adjustedName = adjustedName.replace(new RegExp("^" + this.batchDeleteStart), '');
      }
      if (this.batchDeleteEnd != '' && adjustedName.endsWith(this.batchDeleteEnd)) {
          adjustedName = adjustedName.replace(new RegExp(this.batchDeleteEnd + "$"), '');
      }

      // and then append to start/end of the name if required
      adjustedName = this.batchAppendStart + adjustedName + this.batchAppendEnd;

      if (this.selectedCaseChangeOption == EChangeCaseOptionTypes.TitleCase) {
        adjustedName = toTitleCase(adjustedName);
      } else if (this.selectedCaseChangeOption == EChangeCaseOptionTypes.TitleCaseWithLowercaseAction) {
          var lastCommaIndex = adjustedName.lastIndexOf(',');

          if (lastCommaIndex > 0) {
              var nameFirstPart = toTitleCase(adjustedName.substring(0, lastCommaIndex));
              var nameSecondPart = adjustedName.substring(lastCommaIndex).toLowerCase();
              adjustedName = nameFirstPart + nameSecondPart;
          }
          else {
              adjustedName = toTitleCase(adjustedName);
          }
      }
      x.adjustedName = adjustedName;
    });
  }
  getTasks(pageNumber:number , count:number, quickSearch?:boolean){
    if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
      let s = new SearchCriteria();
      s.pageNumber = pageNumber;
      s.count = count;
      this.currentPage = pageNumber;
      s.sortField = 'Name';
      s.quickSearch = this.quickSearch;
      this.currentPage = pageNumber;
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
        if(this.tasks.length == 0){
          this.showNoResults = true;
        } else {
          var tasksAlreadyAdded: Task[] = [];
            this.tasks.forEach(data =>{
              this.expandedRows[data?.id] = false;
              if (this.selectedBatchTasks.findIndex((i:Jobs)=> i.id == data.id) > -1) {
                tasksAlreadyAdded.push(data);
              }
            });
            this.selectedTasks = tasksAlreadyAdded;
        }
        this.isLoaded = true;
      });
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
    
  }
  selectRow(e:any, task: Task) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.addRemoveSelected(task, isSelected);
  }

  selectAllRows(e:any) {
    var isSelected = e?.target?.innerHTML == "" ? false: true;
    this.tasks.forEach((item) => {
      this.addRemoveSelected(item, isSelected);
    });
  }
  addRemoveSelected(task: Task, isSelected: boolean) {
    var index = this.selectedBatchTasks.findIndex((tableItem: any) => tableItem.id === task.id || tableItem.id == task.originalRevisionId);
    if (isSelected && index == -1) {
      this.selectedBatchTasks.push(task);      
    }
    if (!isSelected && index > -1) {
      this.selectedBatchTasks.splice(index, 1);
    }
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
  getAllJobs(){
    this.tasksService.quickSearchJobs('%20').subscribe(response => {
      if(response){
        this.linkedJobs = response;
      }
    });
  }
  clearSearch(){
    this.quickSearch.value = '';
    this.getTasks(this.currentPage,this.rowCount);
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
    this.advancedSearch = false;
  }
  printList(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
        let s: SearchCriteria = new SearchCriteria;
        s.advancedSearch = this.advancedSearchModel;
        this.tasksService.printList(s).subscribe(result => {
          let file = new Blob([result], { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
      });
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  goToTaskDetails(task: Task) {
    if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
      var taskId = task.originalRevisionId ?? task.id;
      this.tasksService.setMenu(taskId);
  
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['../tasks/tasks-details/' + taskId])
      );
      window.open(url);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  advancedSearchToggle(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
      this.advancedSearch = !this.advancedSearch;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  collapseAll(tree: any[]){
    tree.forEach( node => {
        this.expandRecursive(node, false);
    } );
  }

  expandRecursive(node:TreeNode, isExpand:boolean){
    node.expanded = isExpand;
    node.partialSelected = undefined;
    if (node.children){
        node.children.forEach( childNode => {
            this.expandRecursive(childNode, isExpand);
        } );
    }
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getTasks(e.page + 1,this.rowCount);
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? true : false;
  }
  saveTask(task: Task){
    if(this.task.name == ""){
      this.errorMessage = "A Task Name is Required";
      this.displayError = true;
    }
    else{
      this.detailsSaved = false;
      if(this.selectedSiteNumbs.length > 0){
        task.siteIds = this.selectedSiteNumbs;
      }
      this.tasksService.saveTask(task).subscribe(result => {
        if(result){
          this.getTasks(this.currentPage,this.rowCount);
          this.getAllTasks();
          this.detailsSaved = true;
          this.newTaskBox = false;
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['../tasks/tasks-details/' + result])
          );
          window.open(url);
        }
      });
    }
  }
  getFlagsTree() {
    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
      this.flagBatchTree = _.cloneDeep(result);
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
      this.groupBatchTree = _.cloneDeep(result);
    });
  }
  getSiteTree(){
    this.siteTree$.subscribe(result => {
      this.siteTree = _.cloneDeep(result);
    });
  }
  getTaskSiteTree(){
    this.isSiteTreeLoaded = false;
    this.tasksService.getTaskSitesTree().subscribe(result => {
      this.taskSiteTree = _.cloneDeep(result);
      this.batchSiteTree = _.cloneDeep(result);
      this.isSiteTreeLoaded = true;
    });
  }
  selectedSiteChange(e: any, site:SiteTree) {
    if (e?.checked == true && !this.selectedSiteNumbs.includes(site.id)) {
      this.selectedSiteNumbs.push(site.id);
    } else {
      const idx = this.selectedSiteNumbs.findIndex((x) => x === site.id);
      if (idx > -1) {
        this.selectedSiteNumbs.splice(idx, 1);
      }
    }
  }
  openCombineTasks() {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteTask]) {
      this.resetCombineBox();
      this.combineTasksBox = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
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
          this.getTasks(this.currentPage,this.rowCount);
          this.getAllTasks();
          this.resetCombineBox();
        }
      });

    }
  }
}
