import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { FetchFlagTree, FetchSiteTree, SetBreadCrumb, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { BatchCopyOptions, CombineOptionsView, JobItem, Jobs, RenameOptions, SupplementaryEntity } from 'src/app/shared/models/jobs.model';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { Event, JobsAdvancedSearch, JobsSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { JobsService } from '../jobs.service';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { selectFATaskFlagTree, selectJobFlagTree, selectJobGroupTree } from 'src/app/store/jobs-store/jobs.selectors';
import * as _ from 'lodash';
import { FetchFATaskFlagTree, FetchJobFlagTree, FetchJobGroupTree } from 'src/app/store/jobs-store/jobs.actions';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { DeptTree } from 'src/app/shared/models/department.model';
import { Task } from 'src/app/shared/models/task.model';
import { selectFlagTree, selectSiteTree } from 'src/app/store/job-fit.selectors';
import { Provider } from 'src/app/shared/models/provider.model';
import { Title } from '@angular/platform-browser';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { BatchOptionsView, BatchRenameAdjusted, EBatchJobAction, EChangeCaseOptionTypes, ECopyIncludeOptionTypes, EJobFitEntity } from 'src/app/shared/models/batch.model';
import { toTitleCase } from 'src/app/shared/helper/stringhelper';
import { EReportType, Report, ReportOptions } from 'src/app/shared/models/reports.model';
import { ReportsService } from 'src/app/reports/reports.service';
import { EUseRecords } from 'src/app/shared/models/risks.search.model';
import * as moment from 'moment';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.css']
})
export class JobsListComponent implements OnInit {
  jobId: any;
  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  selectJobMessage: string = "! Please select one or more jobs from the list to action."
  combineInfo: string = "Please select the jobs to combine. To ensure no duplicates the job you select to combine WITH will be deleted - to avoid any loss of data please make sure to combine the Details section manually before proceeding.";
  advancedSearch = false;
  selectedJobs:any[] = [];
  selectedBatchJobs:any[] = [];
  jobs:Jobs[] = [];
  jobsList:Jobs[] = [];
  combineJobsBox = false;
  job: Jobs = new Jobs();
  groupTree$ = this.store.pipe(select(selectJobGroupTree));
  advancedSearchModel: JobsAdvancedSearch = new JobsAdvancedSearch();
  groupTree: GroupsTree[] = [];
  groupBatchTree: GroupsTree[] = [];
  groupBatchTaskTree: GroupsTree[] = [];
  showNoResults = false;
  selectedGroupTree: GroupsTree[] = [];
  taskItem: JobItem = new JobItem();
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  quickSearch:QuickSearch = new QuickSearch();
  totalCount: number = 0;
  first:number = 0;
  selectedFlagOption: string = '1';
  currentPage = 0;
  selectedGroupOption: string = '1';
  combineOptions: CombineOptionsView = new CombineOptionsView();
  flagTree: FlagsTree[] = [];
  flagBatchTree: FlagsTree[] = [];
  flagBatchTaskTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  selectedLinkedJobsTree:FlagsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedGroups: GroupsTree[] = [];
  providers: Provider[] = [];
  jobResult:any;
  breadCrumbs: MenuItem[] = [];
  events: Event[] = [];
  advanceSearchLoaded = false;
  FAflagTree: FlagsTree[] = [];
  selectedFAFlags: FlagsTree[] = [];
  selectedSites: DeptTree[] = [];
  selectedLinkedJobs: Jobs[] = [];
  rowOptions = [10,20,30]
  linkedTasks: Task[] = [];
  siteTree: DeptTree[] = [];
  FAflagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  siteTree$ = this.store.pipe(select(selectSiteTree));
  taskFlagTree: FlagsTree[] = [];
  taskFlagTree$ = this.store.pipe(select(selectFlagTree));
  freqOptions = [{ID:1 , name: "Essential"},{ID:2 , name: "Non-Essential"}];
  jobFlagTree$ = this.store.pipe(select(selectJobFlagTree));
  newTaskBox = false;
  deptTree: DeptTree[] = [];
  batchDeptTree: DeptTree[] = [];
  rowCount = 10;
  selectedDeptNumbs: number[] = [];
  type = [
    {name: 'Starts With', code: QuickSearchType.StartsWith},
    {name: 'Ends With', code: QuickSearchType.EndsWith},
    {name: 'Contains', code: QuickSearchType.Contains},
  ];

field = [
  {name: 'Name', code: 'Name'},
];
errorMessage = '';
displayError = false;
displayBatchError = false;
filtersResult:  string[] = [];
filters: string = '';
detailsSaved: boolean = true;
isLoaded: boolean = true;
activeCombine: boolean[] = [true, false, false];
isLoading: boolean = false;
action: number = -1;
isBatchOn = false;
isBatchSaved: boolean = true;
isDeptTreeLoaded: boolean = true;
batchJobFlags: boolean = false;
batchJobGroups: boolean = false;
batchJobDept: boolean = false;
batchJobCopy: boolean = false;
batchJobGenerateReport: boolean = false;
batchJobTitles: boolean = false;
isBatchReportGenerated: boolean = true;
selectedBatchFlagOption: number = 1;
selectedBatchGroupOption: number = 1;
selectedBatchDeptOption: number = 1;
selectedBatchGroups: GroupsTree[] =[];
selectedBatchFlags: FlagsTree[]= [];
selectedBatchDept: DeptTree[]= [];
selectedBatchTaskGroups: GroupsTree[] =[];
selectedBatchTaskFlags: FlagsTree[]= [];
selectedBatchTaskFlagOption: number = 1;
selectedBatchTaskGroupOption: number = 1;
selectAllDeptLabel: string = "Select All";
isSelectAllClicked: boolean = false;
expandedRows: any = {};
batchActions = [
  {name: 'Please select an action to perform on all selected Jobs', code: -1}
];
actionNote: string = "Note: To use Batch Actions, please select one or more jobs from grid below.";
showBatchMessage: boolean = false;
activeBatchTitle: boolean[] = [true, false];
batchAppendStart: string = "";
batchAppendEnd: string = "";
batchDeleteStart: string = "";
batchDeleteEnd: string = "";
adjustmentResults: BatchRenameAdjusted[] = [];
activeIndex: number = 0;
selectedCaseChangeOption: number = EChangeCaseOptionTypes.LeaveUnchanged;
selectedReport: Report = new Report();
selectedReportId: number = 0;
selectedRecordSelection: string = "";
selectedFromDateValue: string = "";
selectedToDateValue: string = "";
includeFaRecords: boolean = true;
selectedTaskDetails: string = "";
selectedTaskDetailsCustomList: number[] = [];
selectedAssociatedTasks: string[] = [];
selectedSortType: string = "Name";
associatedTasksOptions: any = {
  includeDetails: "Include Task Details",
  includeImageAttachments: "Include Task Image Attachments",
};
generalOptions: any = {
  includeBiologicalSex: "Include Biological Sex",
  includeAddress: "Include Address",
  includeImageAttachments: "Include Image Attachments",
  includeFaqPage: "Include FAQ Page",
};
recordSelectionOptions = [
  {label: EUseRecords.Current, id: EUseRecords.Current},
  {label: EUseRecords.All, id: EUseRecords.All},
  {label: EUseRecords.Between, id: EUseRecords.Between}
];
functionalAnalysisOptions: any = {
  includeFaRecords: "Include Functional Analysis Records",
  includeFaGraphs: "Include Functional Analysis Record Graphs",
};
taskDetailsOptions = [
  { label: "None", value: "None" },
  { label: "All", value: "All" },
  { label: "Essential Only", value: "Essential" },
  { label: "Non-Essential Only", value: "NonEssential" },
  { label: "Tasks That Fit", value: "Fit" },
  { label: "Tasks That Don't Fit", value: "NonFit" },
  { label: "Custom List", value: "Custom" },
];
sortType: any = [
  { label: "Name", value: "Name" },
  { label: "Ratio", value: "Ratio" },
  { label: "Priority", value: "Priority" },
];
includeDetails: boolean = false;
includeAssociatedTasksImageAttachments: boolean = false;
includeBiologicalSex: boolean = false;
includeAddress: boolean = false;
includeImageAttachments: boolean = false;
includeFaqPage: boolean = true;
reports: Report[] = [];
isJobFunctionalRequirementsForm: boolean = false;
isStandard: boolean = true;
taskDetailsCustomListOption: any = [];
batchCopyOptions: BatchCopyOptions = new BatchCopyOptions();
selectLinkTo: number = 1;
selectedOptions:number[] =[];
selectedOptionsTask:number[] =[];
showLinkTo: boolean = true;
activeCopy: boolean[] = [true, false, false];
activeTaskCopy: boolean[] = [true, false, false];
includeList = [{id:ECopyIncludeOptionTypes.AssociatedTasks, value: 'Associated Tasks'} ,
              {id:ECopyIncludeOptionTypes.Notes , value:'Notes'} , {id:ECopyIncludeOptionTypes.Flags, value: 'Flags'},
              {id:ECopyIncludeOptionTypes.Groups , value:'Groups'}, {id:ECopyIncludeOptionTypes.Attachments, value: 'Attachments'} ,
              {id:ECopyIncludeOptionTypes.HH , value: 'Health & Hygiene'}];
includeListTask = [{id:ECopyIncludeOptionTypes.Notes  , value:'Notes'} , {id:ECopyIncludeOptionTypes.Flags, value: 'Flags'},
              {id:ECopyIncludeOptionTypes.Groups , value:'Groups'}, {id:ECopyIncludeOptionTypes.Attachments , value: 'Attachments'} ,
              {id:ECopyIncludeOptionTypes.HH , value: 'Health & Hygiene'}, {id:ECopyIncludeOptionTypes.FA , value: 'Functional Analysis Records'} ,
              {id:ECopyIncludeOptionTypes.HF , value: 'Human Factors'}, {id:ECopyIncludeOptionTypes.EF , value: 'Environmental Factors'},
              {id:ECopyIncludeOptionTypes.PPE , value: 'Personal Protective Equipment'}];
authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
eFunctions = EFunctions;
failedBatchjobNames: string[] = [];
constructor(private router: Router,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private titleService: Title,
    private jobsService: JobsService,
    private reportService: ReportsService,
    private tasksService: TasksService) {
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.store.dispatch(new ShowSideMenu(false));
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (Object.keys(this.authorisedFunctionList.Function).length > 0){
        if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
          this.setupBatchActions();
          this.getJobs(1,10);
          setTimeout(() => {
            this.getAllJobs();
            this.getFlagsTree();
            this.getGroupsTree();
            this.getAllTasks();
            this.getJobsFlagTree();
            this.getTaskGroupsTree();
            this.getFAflagsTree();
            this.getProviders();
            this.getEvents();
            this.getSiteTree();
            this.getDeptTree();
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
        {label:'Jobs'}
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.titleService.setTitle('Jobs');
    }

    ngOnInit(): void {
    }
    setupBatchActions() {
      if (this.authorisedFunctionList.Function[EFunctions.AssignFlags]) {
        this.batchActions.push({name: 'Set/Remove Job Flags', code: EBatchJobAction.SetRemoveJobFlag});
      }
      if (this.authorisedFunctionList.Function[EFunctions.AssignGroups]) {
        this.batchActions.push({name: 'Add/Remove Job/s to/from Groups', code: EBatchJobAction.AddRemoveJobGroup});
      }
      if (this.authorisedFunctionList.Function[EFunctions.EditDepartments]) {
        this.batchActions.push({name: 'Add/Remove Job/s to/from Departments', code: EBatchJobAction.AddRemoveJobDept});
      }
      if (this.authorisedFunctionList.Function[EFunctions.CopyJobs]) {
        this.batchActions.push({name: 'Copy Job/s', code: EBatchJobAction.CopyJob});
      }
      if (this.authorisedFunctionList.Function[EFunctions.EditJob]) {
        this.batchActions.push({name: 'Adjust Job Title/s', code: EBatchJobAction.AdjustJobTitle});
      }
      if (this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
        this.batchActions.push({name: 'Generate Job Report/s', code: EBatchJobAction.GenerateJobReport});
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
      this.reportService.getReports(EReportType.Job).subscribe(result => {
        this.reports = result.reports;
        //set to standard report
        if (this.reports.length > 0) {
          this.selectedReport = this.reports[0];
          this.selectedReportId = this.selectedReport.id;
        }
        this.isBatchReportGenerated = true;
      });
    }
    showTaskDetailsCustomList() {
      return this.selectedTaskDetails.toLowerCase() === "custom";
    }
    showTaskSort(): boolean {
      var isStandardSelected = this.selectedReport && this.selectedReport.name.indexOf("Standard Job Report") > -1;
      if (isStandardSelected) {
        return true;
      }
      return false;
    }
    selectedValue(e: any){
      this.selectedReportId = e.value;
      this.selectedReport = this.reports.filter(x => x.id == this.selectedReportId)[0];
      this.isStandard = this.selectedReport.name.indexOf("Standard") > -1 ? true: false;

      this.isJobFunctionalRequirementsForm = this.selectedReport.name == "Job Functional Requirements Form";
      if ((this.selectedReport.reportSection.filter(x=> x.reportSection.description == 'Functional Records').length > 0)) {
        this.includeFaRecords = true;
      }

    }
    newJob() {
      if (this.authorisedFunctionList.Function[EFunctions.AddJob]) {
        this.job = new Jobs();
        this.collapseAll(this.deptTree);
        this.selectedDeptNumbs = [];
        this.newTaskBox = true;
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
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
    generateReport() {
      this.isBatchReportGenerated = false;
      const ids = this.selectedBatchJobs.map((job:Jobs) => {
        return job.originalRevisionId ?? job.id;
      });

      const reportOptions: ReportOptions = {
        ...new ReportOptions(),
        ids: ids,
        jobFitEntityType: EJobFitEntity.Jobs,
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
        assocTaskReportOptions: {
          includeTaskDetails: this.selectedAssociatedTasks.includes(this.associatedTasksOptions.includeDetails),
          includeTaskImageAttachments: this.selectedAssociatedTasks.includes(this.associatedTasksOptions.includeImageAttachments),
          sortTaskBy: this.selectedSortType,
        },
        faReportOptions: {
          recordSelectionOption: this.selectedRecordSelection,
          includeRecords: this.includeFaRecords,
          includeGraphs: false,
          posturalToleranceIds: [],
          materialHandlingContinuousIds: [],
          materialHandlingFrequentIds: [],
          materialHandlingOccassionalIds: [],
          startDate: new Date(moment(this.selectedFromDateValue).format('YYYY-MM-DD')),
          endDate: new Date(moment(this.selectedToDateValue).format('YYYY-MM-DD'))
        },
        taskDetailsReportOptions: {
          taskIncludeOption: this.selectedTaskDetails,
          suitableTaskIds: [],
          customTaskIds: this.selectedTaskDetailsCustomList,
        }

      };

      this.reportService.viewBatchReport(reportOptions).subscribe(result => {
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
        this.selectedJobs = [];
        this.selectedBatchJobs = [];
        this.isBatchReportGenerated = true;
      })
    }
    getPagedTaskSets(taskId: number) {
      this.reportService.getPagedTaskSets(taskId).subscribe(result => {
        const formattedResults = result.list.map((res: any) => {
          const name = res.task?.name;
          const taskId = res.taskId;
          return { label: name, value: taskId };
        })

        this.taskDetailsCustomListOption = [{
          label: "Included Task Associations",
          items: formattedResults,
        }];
      })
    }
    cancelAction() {
      this.resetBatch();
      this.action = -1;
    }
    batchToggle(){
      this.isBatchOn = !this.isBatchOn;
      this.action = -1;
      this.selectedJobs = [];
      this.selectedBatchJobs = [];
      this.resetBatch();
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
    saveAdjustJobTitle() {
      this.isBatchSaved = false;
      var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchJobs.map((job:Jobs) => {
        return job.originalRevisionId ?? job.id;
      });
      batchOptions.ids = ids;
      batchOptions.jobFitEntityType = EJobFitEntity.Jobs;

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
          this.selectedJobs = [];
          this.selectedBatchJobs = [];
          this.getJobs(this.currentPage,this.rowCount);
          this.getAllJobs();
        }
      });
    }
    selectedBatchDeptChange(e: any, dept:DeptTree) {
      if (e?.checked == true && !this.selectedBatchDept.find(x=> x.id === dept.id)) {
        this.selectedBatchDept.push(dept);
      } else {
        const idx = this.selectedBatchDept.findIndex((x) => x.id === dept.id);
        if (idx > -1) {
          this.selectedBatchDept.splice(idx, 1);
        }
      }
    }
    setRemoveJobFlags() {
      var flags = this.selectedBatchFlags.filter(x=> x.typeId != 2);
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
    onBatchActionChange(e:any){
      this.action = e?.value;
      if (this.selectedBatchJobs.length < 1) {
        this.cancelAction();
        this.errorMessage = "Please select one or more jobs from grid below to perform Batch action";
        this.displayError = true;
      } else {
        switch(this.action) {
          case EBatchJobAction.SetRemoveJobFlag:
          {
            this.batchJobFlags = true;
            break;
          }
          case EBatchJobAction.AddRemoveJobGroup:
          {
            this.batchJobGroups = true;
            break;
          }
          case EBatchJobAction.AddRemoveJobDept:
          {
            this.batchJobDept = true;
            break;
          }
          case EBatchJobAction.AdjustJobTitle:
          {
            this.setBatchAdjustTitles();
            break;
          }
          case EBatchJobAction.CopyJob:
          {
            this.batchJobCopy = true;
            break;
          }
          case EBatchJobAction.GenerateJobReport:
          {
            this.prePopulateSelections();
            this.batchJobGenerateReport = true;
            break;
          }
        }
      }
    }
    prePopulateSelections() {
      this.isStandard = true;
      this.isJobFunctionalRequirementsForm = false;
      this.includeFaqPage = true;
      this.includeBiologicalSex = false;
      this.includeAddress = false;
      this.includeImageAttachments = true;
      this.includeFaRecords = true;
      this.includeAssociatedTasksImageAttachments = false;
      this.includeDetails = false;
      this.selectedSortType = "Name";
      const currentRecordCollection = EUseRecords.Current;
      this.selectedRecordSelection = currentRecordCollection;
      if (this.reports.length > 0) {
        this.selectedReport = this.reports[0];
        this.selectedReportId = this.selectedReport.id;
      }
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
    onCopyTabOpen(e:any) {
      this.activeCopy = [false, false, false];
      this.activeCopy[e.index] = true;
    }
    onCopyTabClose(e:any) {
      this.activeCopy[e.index] = false;
    }
    onCopyTaskTabOpen(e:any) {
      this.activeTaskCopy = [false, false, false];
      this.activeTaskCopy[e.index] = true;
    }
    onCopyTaskTabClose(e:any) {
      this.activeTaskCopy[e.index] = false;
    }
    resetBatch() {
      this.batchAppendEnd = "";
      this.batchAppendStart = "";
      this.batchDeleteEnd = "";
      this.batchDeleteStart = "";
      this.activeBatchTitle = [true, false];
      this.activeCopy = [true, false, false];
      this.activeTaskCopy = [true, false, false];
      this.selectedCaseChangeOption = EChangeCaseOptionTypes.LeaveUnchanged;
      this.selectedBatchFlagOption = 1;
      this.selectedBatchGroupOption = 1;
      this.selectedBatchTaskFlagOption = 1;
      this.selectedBatchTaskGroupOption = 1;
      this.selectedBatchDeptOption = 1;
      this.activeIndex = 0;
      this.selectLinkTo = 1;
      this.showLinkTo = true;
      this.selectedFromDateValue = "";
      this.selectedToDateValue = "";
      this.showBatchMessage = false;
      this.isSelectAllClicked = false;
      this.selectAllDeptLabel = "Select All";
      this.collapseAll(this.flagBatchTree);
      this.collapseAll(this.groupBatchTree);
      this.collapseAll(this.flagBatchTaskTree);
      this.collapseAll(this.groupBatchTaskTree);
      this.collapseAll(this.batchDeptTree);
      this.selectedBatchFlags = [];
      this.selectedBatchGroups = [];
      this.selectedBatchTaskFlags = [];
      this.selectedBatchTaskGroups = [];
      this.selectedBatchDept = [];
      this.batchJobFlags = false;
      this.batchJobGroups = false;
      this.batchJobDept = false;
      this.batchJobCopy = false;
      this.batchJobTitles = false;
      this.batchJobGenerateReport = false;
      this.selectedOptions = [10, 1, 2, 3, 4, 5];
      this.selectedOptionsTask = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      this.batchCopyOptions = new BatchCopyOptions();
      this.batchCopyOptions.primaryCopyOptions.renameOptions.nameAppendEnd = " - Copy";
      this.batchCopyOptions.associatedCopyOptions.renameOptions.nameAppendEnd = " - Copy";
    }
    selectRow(e:any, job: Jobs) {
      var isSelected = e?.target?.innerHTML == "" ? false: true;
      this.addRemoveSelected(job, isSelected);
    }
  
    selectAllRows(e:any) {
      var isSelected = e?.target?.innerHTML == "" ? false: true;
      this.jobs.forEach((item) => {
        this.addRemoveSelected(item, isSelected);
      });
    }
    addRemoveSelected(job: Jobs, isSelected: boolean) {
      var index = this.selectedBatchJobs.findIndex((tableItem: any) => tableItem.id === job.id || tableItem.id == job.originalRevisionId);
      if (isSelected && index == -1) {
        this.selectedBatchJobs.push(job);      
      }
      if (!isSelected && index > -1) {
        this.selectedBatchJobs.splice(index, 1);
      }
    }
    applyBatch() {
      switch(this.action) {
        case EBatchJobAction.SetRemoveJobFlag:
        {
          this.saveBatchFlags();
          break;
        }
        case EBatchJobAction.AddRemoveJobGroup:
        {
          this.saveBatchGroup();
          break;
        }
        case EBatchJobAction.AddRemoveJobDept:
        {
          this.saveBatchDept();
          break;
        }
        case EBatchJobAction.GenerateJobReport:
        {
          break;
        }
      }
    }
    saveBatchCopy(){
      this.isBatchSaved = false;
      var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchJobs.map((job:Jobs) => {
        return job.originalRevisionId ?? job.id;
      });
      batchOptions.ids = ids;
      batchOptions.jobFitEntityType = EJobFitEntity.Jobs;
      this.batchCopyOptions.primaryCopyOptions.copyAssociatedEntities = this.selectedOptions.includes(ECopyIncludeOptionTypes.AssociatedTasks)? this.selectLinkTo == 2 : undefined ;
      this.batchCopyOptions.primaryCopyOptions.copyIncludeOptions = this.selectedOptions;
      this.batchCopyOptions.entityIds = ids;

      this.batchCopyOptions.associatedCopyOptions.copyAssociatedEntities = this.selectedOptions.includes(ECopyIncludeOptionTypes.AssociatedTasks) && this.selectLinkTo == 2 ? true: undefined;
      this.batchCopyOptions.associatedCopyOptions.copyIncludeOptions = this.selectedOptionsTask;

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

      var flagsEntityArrayTasks: SupplementaryEntity[] = [];
      var groupsEntityArrayTasks: SupplementaryEntity[] = [];
      this.selectedBatchTaskFlags.forEach(element => {
        let entity = new SupplementaryEntity();
        entity.Id = element.id;
        flagsEntityArrayTasks.push(entity);
      });
      this.selectedBatchTaskGroups.forEach(element => {
        let entity = new SupplementaryEntity();
        entity.Id = element.id;
        groupsEntityArrayTasks.push(entity);
      });
      if(this.selectedBatchTaskFlagOption === 1){
        this.batchCopyOptions.associatedCopyOptions.flagsToSet = flagsEntityArrayTasks;
      } else {
        this.batchCopyOptions.associatedCopyOptions.flagsToRemove = flagsEntityArrayTasks;
      }
      if(this.selectedBatchTaskGroupOption === 1){
        this.batchCopyOptions.associatedCopyOptions.groupsToSet = groupsEntityArrayTasks;
      } else {
        this.batchCopyOptions.associatedCopyOptions.groupsToRemove = groupsEntityArrayTasks;
      }

      batchOptions.batchCopyOptions = _.cloneDeep(this.batchCopyOptions);
      this.tasksService.saveBatchCopy(batchOptions).subscribe(response => {
        if(response){
          if(response){
            this.isBatchSaved = true;
            this.cancelAction();
            this.selectedJobs = [];
            this.selectedBatchJobs = [];
            this.getJobs(this.currentPage,this.rowCount);
            this.getAllJobs();
          }
        }
      });
    }
    onIncludeChange() {
      if (this.selectedOptions.includes(ECopyIncludeOptionTypes.AssociatedTasks)) {
        this.showLinkTo = true;
      } else {
        this.showLinkTo = false;
      }
    }

    setBatchAdjustTitles() {
      this.adjustmentResults = [];
      this.selectedBatchJobs.forEach((x:Jobs) => {
          var adjusted = new BatchRenameAdjusted();
          adjusted.id = x.originalRevisionId ?? x.id;
          adjusted.name = x.name;
          adjusted.adjustedName = x.name;
          this.adjustmentResults.push(adjusted);
      });
      this.batchJobTitles = true;
    }
    addRemoveJobGroups() {
      var groups = this.selectedBatchGroups.filter(x=> x.typeId != 2);
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
    saveBatchGroup() {
      this.isBatchSaved = false;
      var groups = this.selectedBatchGroups.filter(x=> x.typeId != 2);
      var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchJobs.map((job:Jobs) => {
        return job.originalRevisionId ?? job.id;
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
      batchOptions.jobFitEntityType = EJobFitEntity.Jobs;

      this.tasksService.saveBatchGroups(batchOptions).subscribe((response:any) => {
        if(response){
          this.isBatchSaved = true;
          this.batchJobGroups = false;
          this.cancelAction();
          this.selectedJobs = [];
          this.selectedBatchJobs = [];
          this.getJobs(this.currentPage,this.rowCount);
        }
      });
    }
    saveBatchFlags() {
      this.isBatchSaved = false;
      var flags = this.selectedBatchFlags.filter(x=> x.typeId != 2);
      var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchJobs.map((job:Jobs) => {
        return job.originalRevisionId ?? job.id;
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
      batchOptions.jobFitEntityType = EJobFitEntity.Jobs;

      this.tasksService.saveBatchFlags(batchOptions).subscribe((response:any) => {
        if(response){
          this.isBatchSaved = true;
          this.batchJobFlags = false;
          this.cancelAction();
          this.selectedJobs = [];
          this.selectedBatchJobs = [];
          this.getJobs(this.currentPage,this.rowCount);
        }
      });
    }
    saveBatchDept() {
      this.isBatchSaved = false;
      var dept = this.selectedBatchDept.filter(x=> x.typeId === 8);
      var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchJobs.map((job:Jobs) => {
        return job.originalRevisionId ?? job.id;
      });
      batchOptions.ids = ids;
      if(this.selectedBatchDeptOption === 1){
        batchOptions.isSet = true;
      } else {
        batchOptions.isSet = false;
      }
      const deptIds = dept.map((g:any) => {
        return g.id;
      });
      batchOptions.orgIds = deptIds;
      batchOptions.jobFitEntityType = EJobFitEntity.Jobs;

      this.tasksService.saveBatchSites(batchOptions).subscribe((response:string[]) => {
        if(response){
          this.isBatchSaved = true;
          this.batchJobDept = false;
          this.cancelAction();
          this.selectedJobs = [];
          this.selectedBatchJobs = [];
          this.getJobs(this.currentPage,this.rowCount);
          if (response.length > 0) {
            this.failedBatchjobNames = response;
            this.displayBatchError = true;
          } 
        }
      });
    }
    processBatchError() {
      this.displayBatchError = false;
    }
    
    addRemoveJobDept() {
      var dept = this.selectedBatchDept.filter(x=> x.typeId === 8);
      if (dept.length == 0 && this.selectedBatchDeptOption == 1) {
        this.errorMessage = "Please select Department/s to set";
        this.displayError = true;
      }
      else if (dept.length == 0 && this.selectedBatchDeptOption == 2) {
        this.errorMessage = "Please select Department/s to remove";
        this.displayError = true;
      }
      else{
        this.applyBatch();
      }
    }
    selectAllDeptToggle() {
      this.isSelectAllClicked= !this.isSelectAllClicked;
      if (this.isSelectAllClicked) {
        this.selectAllDeptLabel = "Deselect All";
        this.selectAllDept();
      } else {
        this.selectAllDeptLabel = "Select All";
        this.deselectAllDept();
      }
    }
    selectAllDept() {
      this.batchDeptTree.forEach(node => {
        this.expandRecursiveDept(node, false);
    });
    }
    deselectAllDept() {
      this.selectedBatchDept = []
      this.collapseAll(this.batchDeptTree);
    }

    expandRecursiveDept(node:TreeNode|any, isExpand:boolean){
      node.expanded = isExpand;
      node.partialSelected = true;
      if (!this.selectedBatchDept.find(x=> x.id === node.id && x.typeId == 8)) {
        this.selectedBatchDept.push(node);
      }
      if (node.children){
          node.children.forEach( (childNode:any) => {
              this.expandRecursiveDept(childNode, isExpand);
          } );
      }
    }
    getJobsFlagTree() {
      this.store.dispatch(new FetchFlagTree());
      this.taskFlagTree$.subscribe(result => {
        this.taskFlagTree = _.cloneDeep(result);
        this.flagBatchTaskTree = _.cloneDeep(result);
      });
    }
    getTaskGroupsTree() {
      this.tasksService.getGroupsTree().subscribe(result => {
        this.groupBatchTaskTree = _.cloneDeep(result);
      });
    }
    getFlagsTree() {
      this.store.dispatch(new FetchJobFlagTree());
      this.jobFlagTree$.subscribe(result => {
        this.flagTree = _.cloneDeep(result);
        this.flagBatchTree = _.cloneDeep(result);
        this.selectedFlagTree = _.cloneDeep(result);
      });
    }
    getSiteTree(){
      this.store.dispatch(new FetchSiteTree([]));
      this.siteTree$.subscribe(result => {
        this.siteTree = _.cloneDeep(result);
      });
    }
    getDeptTree() {
      this.isLoading = true;
      this.jobsService.getDepartmentsTree().subscribe(result => {
        this.deptTree = _.cloneDeep(result);
        this.batchDeptTree = _.cloneDeep(result);
        this.isLoading = false;
      });
    }
    goToJobFit(id: number){
      if(this.authorisedFunctionList.Function[EFunctions.ViewJobFit]) {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(["../job-fit-criteria/job-employment/0/" + id])
        );
        window.open(url);
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }
    }
    setRows(e: any){
      this.rowCount = e.value;
      this.currentPage = 1;
      this.first = 0;
      this.getJobs(this.currentPage , e.value);
    }
    selectedDeptChange(e: any, dept:DeptTree) {
      if (e?.checked == true && !this.selectedDeptNumbs.includes(dept.id)) {
        this.selectedDeptNumbs.push(dept.id);
      } else {
        const idx = this.selectedDeptNumbs.findIndex((x) => x === dept.id);
        if (idx > -1) {
          this.selectedDeptNumbs.splice(idx, 1);
        }
      }
    }
    saveDeptTree(jobsId:number){
      // send deptTreeView
      if(this.selectedDeptNumbs.length > 0){
        var deptIds: number[] = [];
        this.selectedDeptNumbs.forEach((id:any) => {
          deptIds.push(Number(id));
        });
        this.jobsService.saveDepartmentsTree(jobsId , deptIds).subscribe(result => {
          this.getJobs(this.currentPage,this.rowCount);
          this.getAllJobs();
          this.detailsSaved = true;
          this.newTaskBox = false;
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['../jobs/jobs-details/' + result])
          );
          window.open(url);
        });
      }
    }
    printList(){
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
          let s: JobsSearchCriteria = new JobsSearchCriteria;
          s.advancedSearch = this.advancedSearchModel;
          this.jobsService.printList(s).subscribe(result => {
            let file = new Blob([result], { type: 'application/pdf' });
            var fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        });
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }
    }
    getFAflagsTree() {
      this.FAflagTree$.subscribe(result => {
        this.FAflagTree = _.cloneDeep(result);
      });
    }
    getGroupsTree() {
      this.store.dispatch(new FetchJobGroupTree([]));
      this.groupTree$.subscribe(result => {
        this.groupTree = _.cloneDeep(result);
        this.groupBatchTree = _.cloneDeep(result);
        this.selectedGroupTree = _.cloneDeep(result);
      });
    }
    getEvents(){
      this.store.dispatch(new FetchFATaskFlagTree([]));
      this.tasksService.getEvents().subscribe(result => {
        this.events = result;
      });
    }
    getAllTasks(){
      this.tasksService.quickSearchTasks('%20').subscribe(response => {
        if(response){
          this.linkedTasks = response;
        }
      });
    }
    getProviders(){
      this.tasksService.getNoteProviders().subscribe(result => {
        this.providers = result;
      });
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
      this.advancedSearch = false;
    }
    refresh() {
      this.getJobs(this.currentPage, this.rowCount);
    }
    getJobs(pageNumber:number , count:number, quickSearch?:boolean){
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
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
        this.isLoaded = false;
        this.jobsService.getJobsList(s).subscribe(result => {
          this.jobResult = result;
          this.totalCount = result.listCount;
          this.jobs = result.jobs;
          if(this.jobs.length == 0){
            this.showNoResults = true;
          } else {
            var jobAlreadyAdded: Jobs[] = [];
            this.jobs.forEach(data =>{
              this.expandedRows[data?.id] = false;
              if (this.selectedBatchJobs.findIndex((i:Jobs)=> i.id == data.id) > -1) {
                jobAlreadyAdded.push(data);
              }
            });
            this.selectedJobs = jobAlreadyAdded;
          }
          this.isLoaded = true;
        });
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }
      

    }
    combineJobsBoxOpen(){
      if (this.authorisedFunctionList.Function[EFunctions.DeleteJob]) {
        this.combineJobsBox = true;
        this.resetCombineBox();
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }

    }
    cancelCombineBox(){
      this.combineOptions = new CombineOptionsView();
      this.selectedFlagOption = '1';
      this.selectedGroupOption = '1';
      this.selectedFlags = [];
      this.selectedGroups = [];
      this.combineJobsBox = false;
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
    goToJobsDetails(job:Jobs) {
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
        let jobId = job.originalRevisionId ?? job.id;
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['../jobs/jobs-details/' + jobId])
        );
        window.open(url);
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }
      
    }
    advancedSearchToggle(){
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
        this.advancedSearch = !this.advancedSearch;
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }

    }
    onPageChange(e:any){
      this.first = e.first;
      this.currentPage = e.page +1;
      this.getJobs(e.page + 1,this.rowCount);
    }
    saveJob(job: Jobs){
      if (job.name == "") {
        this.errorMessage = "Jobs Name is required";
        this.displayError = true;
      } else if (this.selectedDeptNumbs.length < 1){
        this.errorMessage = "Job should be associated to Department";
        this.displayError = true;
      } else {
        this.detailsSaved = false;
        this.jobsService.saveJob(job).subscribe((result:any) => {
          this.saveDeptTree(result);
        });
      }
    }
    getAllJobs(){
      this.tasksService.quickSearchJobs('%20').subscribe(response => {
        if(response){
          this.jobsList = response;
        }
      });
    }

    combineJobs(){
      if (this.combineOptions.firstEntityId == 0) {
        this.errorMessage = "Combine option is required";
        this.displayError = true;
      } else if (this.combineOptions.secondEntityId == 0){
        this.errorMessage = "The with option is required";
        this.displayError = true;
      }
      else if (this.combineOptions.combineEntityName == ""){
        this.errorMessage = "A combined name is required";
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
      this.jobsService.combineJobs(this.combineOptions).subscribe(response => {
        if(response){
          this.combineJobsBox = false;
          this.getJobs(this.currentPage,this.rowCount);
          this.getAllJobs();
        }
      });
      }
    }
    clearSearch(){
      this.quickSearch = new QuickSearch();
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
}
