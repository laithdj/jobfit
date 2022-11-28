import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SetBreadCrumb, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { WorkerItem, Worker, CombineOptionsView } from 'src/app/shared/models/worker.model';
import { QuickSearch, QuickSearchType } from 'src/app/shared/models/quicksearch.model';
import { WorkerDetailSearchView, AdvancedWorkerSearch, WorkersSearchCriteria, FunctionalAnalysisSearch, AdvancedEmploymentSearch, Event, EmploymentType, JobsSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import * as _ from 'lodash';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { selectFAWorkerFlagTree, selectWorkerDetails, selectWorkerFlagTree, selectWorkerGroupTree } from 'src/app/store/workers-store/workers.selectors';
import { WorkersService } from '../workers.service';
import { EBiologicalSex, EGender } from 'src/app/shared/models/gender.model';
import { FetchWorkerFlagTree, FetchWorkerGroupTree } from 'src/app/store/workers-store/workers.actions';
import { SupplementaryEntity } from 'src/app/shared/models/jobs.model';
import * as moment from 'moment';
import { Provider } from 'src/app/shared/models/provider.model';
import { MenuItem, TreeNode } from 'primeng/api';
import { DeptTree } from 'src/app/shared/models/department.model';
import { Employment, EmploymentJob, JobFitResultView, JobFitScoreView, Roster } from 'src/app/shared/models/employment.model';
import { JobsService } from 'src/app/jobs/jobs.service';
import { AuthorizeService } from 'src/app/api-authorization/authorize.service';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { selectDeptTree } from 'src/app/store/jobs-store/jobs.selectors';
import { FetchDeptTree } from 'src/app/store/jobs-store/jobs.actions';
import { Title } from '@angular/platform-browser';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { BatchOptionsView, EBatchWorkerAction, EJobFitEntity } from 'src/app/shared/models/batch.model';
import { EReportType, Report, ReportOptions } from 'src/app/shared/models/reports.model';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { ReportsService } from 'src/app/reports/reports.service';
import { EUseRecords } from 'src/app/shared/models/risks.search.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.css']
})
export class WorkersListComponent implements OnInit {
  workerId: any;
  message ='Names are searched using a like match. For example "pp" would find "apple", "ppear" and "fruitpp".';
  selectWorkerMessage: string = "! Please select one or more workers from the list to action.";
  combineInfo: string = "Please select the workers to combine. To ensure no duplicates the worker you select to combine WITH will be deleted - to avoid any loss of data please make sure to combine the Details section manually before proceeding.";
  advancedSearch = false;
  isBatchOn = false;
  workersResult: any;
  selectedWorkers:any[] = [];
  selectedBatchWorkers:any[] = [];
  workers:Worker[] = [];
  workersList:Worker[] = [];
  duplicateWorkers: Worker[] =[];
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
  breadCrumbs: MenuItem[] = [];
  selectedSearchFlagOption: number = -1;
  selectedSearchGroupOption: number = -1;
  selectedCombineFlagOption: number = 1;
  selectedCombineGroupOption: number = 1;
  selectedBatchFlagOption: number = 1;
  selectedBatchGroupOption: number = 1;
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
  events: Event[] = [];
  workerFlagTree$ = this.store.pipe(select(selectWorkerFlagTree));
  FAflagTree$ = this.store.pipe(select(selectFAWorkerFlagTree));
  combineOptions: CombineOptionsView = new CombineOptionsView();
  combineFirstName: string = '';
  combineLastName: string = '';
  selectedCombinedGroups: GroupsTree[] =[];
  selectedCombinedFlags: FlagsTree[]= [];
  selectedBatchGroups: GroupsTree[] =[];
  selectedBatchFlags: FlagsTree[]= [];
  activeCombine: boolean[] = [true, false, false];
  biologicalSex: number = -1;
  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  newWorkerBox = false;
  nextDueDateDisable:boolean = false;
  selectedReviewDate:string = '';
  useHomeAddress: boolean = false;
  dob?: Date;
  siteTree: DeptTree[] = [];
  selectedSites: DeptTree[] = [];
  empType:number = -1;
  employmentFrom?: Date;
  showNoResults = false;
  employmentTo?: Date;
  showDuplicate: boolean = false;
  employmentType = [{name:'Select Employment Type' , id:-1}, {name:'Employment' , id:EmploymentType.Employment} , {name:'Pre-Employment' , id:EmploymentType.PreEmployment}];
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

  biologicalSexList = [
    {name: 'Select', code: -1},
    {name: 'Female', code: EBiologicalSex.Female},
    {name: 'Male', code: EBiologicalSex.Male},
  ];
  genders = [
    {name: 'Select', code: ""},
    {name: 'Female', code: EGender.Female},
    {name: 'Male', code: EGender.Male},
    {name: 'Other', code: EGender.Other},
    {name: 'Prefer not to say', code: EGender.PreferNotToSay}
  ];
  batchActions = [
    {name: 'Please select an action to perform on all selected Workers', code: -1}
   ];
  generalOptions: any = {
    includeBiologicalSex: "Include Biological Sex",
    includeAddress: "Include Address",
    includeImageAttachments: "Include Image Attachments",
    includeFaqPage: "Include FAQ Page",
    includeJobfitMatchingGrid: "Include Jobfit Matching Grid"
  };
  includeBiologicalSex: boolean = false;
  includeAddress: boolean = false;
  includeImageAttachments: boolean = false;
  includeFaqPage: boolean = true;
  includeJobfitMatchingGrid: boolean = true;
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
  actionNote: string = "Note: To use Batch Actions, please select one or more workers from grid below.";
  action: number = -1;
  gender: string = "";
  jobList: EmploymentJob[]=[];
  employee: Employment = new Employment();
  roster: Roster[] = [];
  result = [{name:'none' , id:1}];
  selectedDeptNumbs: number[] = [];
  editEmp = false;
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  deptTree: DeptTree[] = [];
  total: number = 0;
  totalDuplicateCount: number = 0;
  allDeptTree: DeptTree[] = [];
  jobFitResults: JobFitResultView[] = [];
  advanceSearchLoaded = false
  jobFitScores: JobFitScoreView[] = [];
  deptTree$ = this.store.pipe(select(selectDeptTree));
  selectedJobId: number = 0;
  errorMessage = '';
  selectedDeptTree: DeptTree[] = [];
  selectedDeptTreeNode: TreeNode[] = [];
  isLoading: boolean = false;
  rowOptions = [10,20,30];
  selectedDuplicateWorkers = [];
  currentPage = 0;
  rowCount = 10;
  expandedRows: any = {};
  public profile: Observable<any> | undefined;
  displayError = false;
  filtersResult:  string[] = [];
  filters: string = '';
  detailsSaved: boolean = true;
  isLoaded: boolean = true;
  allWorkers: Worker[] = [];
  isBatchSaved: boolean = true;
  batchWorkerFlags: boolean = false;
  batchWorkerGroups: boolean = false;
  batchWorkerGenerateReport: boolean = false;
  isBatchReportGenerated: boolean = true;
  isStandard: boolean = true;
  showBatchMessage: boolean = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(private router: Router,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private titleService: Title,
    private jobsService: JobsService,
    private authorizeService: AuthorizeService,
    private taskService: TasksService,
    private reportService: ReportsService,
    private workersService: WorkersService) {
      this.profile = this.authorizeService.getUser().pipe(map(u => u));
      this.profile.subscribe((result:any) => {
      });

      this.authorizeService.getUser().pipe(map(u => console.log(u)));
        this.quickSearch.field = "FirstName";
        this.quickSearch.type = QuickSearchType.StartsWith;

        this.translateService.setDefaultLang('en');
        this.translateService.use(localStorage.getItem('lang') || 'en');
        this.store.dispatch(new ShowSideMenu(false));

        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (Object.keys(this.authorisedFunctionList.Function).length > 0){
          if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
            this.setupBatchActions();
            this.getWorkers(1,10);
            setTimeout(() => {
              this.getFlagsTree();
              this.getGroupsTree();
              this.getEvents();
              this.getFAflagsTree();
              this.getWorkerEmploymentFlagTree();
              this.getProviders();
              this.getAllJobs();
              this.getJobFitResults();
              this.getJobFitScores();
              this.store.dispatch(new FetchDeptTree());
              this.getDeptTree();
              this.getAllWorkers();
              this.getReports();
              this.advanceSearchLoaded = true;
            }, 5000);
        } else {
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }
     this.breadCrumbs = [
      {icon: 'pi pi-home', url: 'home'},
      {label:'Workers'},
    ];
    this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    this.titleService.setTitle('Workers');
     }
     ngOnInit(): void {
    }
    refresh() {
      this.getWorkers(this.currentPage, this.rowCount);
    }
    selectRow(e:any, worker: Worker) {
      var isSelected = e?.target?.innerHTML == "" ? false: true;
      this.addRemoveSelected(worker, isSelected);
    }
  
    selectAllRows(e:any) {
      var isSelected = e?.target?.innerHTML == "" ? false: true;
      this.workers.forEach((item) => {
        this.addRemoveSelected(item, isSelected);
      });
    }
    addRemoveSelected(worker: Worker, isSelected: boolean) {
      var index = this.selectedBatchWorkers.findIndex((tableItem: any) =>  tableItem.workerId === worker.originalRevisionID || tableItem.workerId === worker.workerId);
      if (isSelected && index == -1) {
        this.selectedBatchWorkers.push(worker);      
      }
      if (!isSelected && index > -1) {
        this.selectedBatchWorkers.splice(index, 1);
      }
    }
    setupBatchActions() {
      if (this.authorisedFunctionList.Function[EFunctions.AssignFlags]) {
        this.batchActions.push({name: 'Set/Remove Worker Flags', code: EBatchWorkerAction.SetRemoveWorkerFlag});
      }
      if (this.authorisedFunctionList.Function[EFunctions.AssignGroups]) {
        this.batchActions.push({name: 'Add/Remove Worker/s to/from Groups', code: EBatchWorkerAction.AddRemoveWorkerGroup});
      }
      if (this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
        this.batchActions.push({name: 'Generate Worker Report/s', code: EBatchWorkerAction.GenerateWorkerReport});
      }
    }
    setRemoveWorkerFlags() {
      var flags = this.selectedBatchFlags.filter(x=> x.typeId != 1);
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
    addRemoveWorkerGroups() {
      var groups = this.selectedBatchGroups.filter(x=> x.typeId != 1);
      if (groups.length == 0 && this.selectedBatchGroupOption == 1) {
        this.errorMessage = "Please select groups/s to set";
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
    applyBatch() {
      switch(this.action) {
        case EBatchWorkerAction.SetRemoveWorkerFlag:
        {
          this.saveBatchFlags();
          break;
        }
        case EBatchWorkerAction.AddRemoveWorkerGroup:
        {
          this.saveBatchGroup();
          break;
        }
        case EBatchWorkerAction.GenerateWorkerReport:
        {
          break;
        }
      }
    }
    saveBatchFlags() {
      this.isBatchSaved = false;
      var flags = this.selectedBatchFlags.filter(x=> x.typeId != 1);
      var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchWorkers.map((worker:any) => {
        return worker.originalRevisionID ?? worker.workerId;
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
      batchOptions.jobFitEntityType = EJobFitEntity.Workers;

      this.workersService.saveBatchFlags(batchOptions).subscribe(response => {
        if(response){
          this.isBatchSaved = true;
          this.batchWorkerFlags = false;
          this.cancelAction();
          this.selectedWorkers = [];
          this.selectedBatchWorkers = [];
          this.getWorkers(this.currentPage,this.rowCount);
        }
      });
    }
    saveBatchGroup() {
      this.isBatchSaved = false;
      var groups = this.selectedBatchGroups.filter(x=> x.typeId != 1);
      var batchOptions = new BatchOptionsView();
      const ids = this.selectedBatchWorkers.map((worker:any) => {
        return worker.originalRevisionID ?? worker.workerId;
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
      batchOptions.jobFitEntityType = EJobFitEntity.Workers;

      this.workersService.saveBatchGroups(batchOptions).subscribe(response => {
        if(response){
          this.isBatchSaved = true;
          this.batchWorkerGroups = false;
          this.cancelAction();
          this.selectedWorkers = [];
          this.selectedBatchWorkers = [];
          this.getWorkers(this.currentPage,this.rowCount);
        }
      });
    }
    cancelAction() {
      this.resetBatch();
      this.action = -1;
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
      this.reportService.getReports(EReportType.Worker).subscribe(result => {
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
      this.includeJobfitMatchingGrid = false;
      const currentRecordCollection = EUseRecords.Current;
      this.selectedRecordSelection = currentRecordCollection;
      if (this.reports.length > 0) {
        this.selectedReport = this.reports[0];
        this.selectedReportId = this.selectedReport.id;
      }
    }
    generateReport() {
      this.isBatchReportGenerated = false;
      const ids = this.selectedBatchWorkers.map((worker:any) => {
        return worker.originalRevisionID ?? worker.workerId;
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
        jobFitEntityType: EJobFitEntity.Workers,
        reportName: this.selectedReport.name,
        reportId: this.selectedReport.id,
        isStandard: this.isStandard,
        isSummary: this.selectedReport.name?.includes("Summary"),
        generalReportOptions: {
          includeBiologicalSex: this.includeBiologicalSex,
          includeAddress: this.includeAddress,
          includeFAQPage: this.includeFaqPage,
          includeImageAttachments: this.includeImageAttachments,
          includeJobfitMatchingGrid: this.includeJobfitMatchingGrid
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
          endDate: new Date(moment(this.selectedToDateValue).format('YYYY-MM-DD')),
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
            this.selectedWorkers = [];
            this.selectedBatchWorkers = [];
            this.isBatchReportGenerated = true;
          }
      })
    }

    setMaterialDropdownData() {
      const getMaterialGroups = this.taskService.getMaterialHandlingGroups();
      const getMaterialFrequencies = this.taskService.getMaterialHandlingFrequencies();
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
      this.taskService.getPosturalToleranceGroups().subscribe(result => {
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
    isWorkerFunctionalCapabilitiesForm() {
      const wfcFormReportTypeId = 9;
      const wfcFormNoFaReportTypeId = 10;
      return this.selectedReport.id === wfcFormReportTypeId || this.selectedReport.id === wfcFormNoFaReportTypeId;
    }
    onBatchActionChange(e:any){
      this.action = e?.value;
      if (this.selectedBatchWorkers.length < 1) {
        this.cancelAction();
        this.errorMessage = "Please select one or more workers from grid below to perform Batch action";
        this.displayError = true;
      } else {
        switch(this.action) {
          case EBatchWorkerAction.SetRemoveWorkerFlag:
          {
            this.batchWorkerFlags = true;
            break;
          }
          case EBatchWorkerAction.AddRemoveWorkerGroup:
          {
            this.batchWorkerGroups = true;
            break;
          }
          case EBatchWorkerAction.GenerateWorkerReport:
          {
            this.prePopulateSelections();
            this.batchWorkerGenerateReport = true;
            break;
          }
        }
      }
    }

    resetBatch() {
      this.selectedBatchFlagOption = 1;
      this.selectedBatchGroupOption = 1;
      this.showBatchMessage = false;
      this.collapseAll(this.flagTree);
      this.collapseAll(this.groupTree);
      this.selectedBatchFlags = [];
      this.selectedBatchGroups = [];
      this.batchWorkerFlags = false;
      this.batchWorkerGroups = false;
      this.selectedFromDateValue = "";
      this.selectedToDateValue = "";
      this.selectedPosturalTolerances = [];
      this.selectedMaterialHandlings = [];
      this.batchWorkerGenerateReport = false;
    }
    getWorkers(pageNumber:number , count:number){
      if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
        let s = new WorkersSearchCriteria();
        s.pageNumber = pageNumber;
        s.count = count;
        s.sortField = 'LastName';
        s.quickSearch = this.quickSearch;
        this.currentPage = pageNumber;
        let a = this.populateAdvancedSearch();
        s.advancedWorkerSearch = a;
        this.isLoaded = false;
        this.workersService.getWorkersList(s).subscribe((result:any) => {
          this.workersResult = result;
          this.totalCount = result.listCount;
          this.workers = _.cloneDeep(result.workers);
          this.workersList = result.workers;
          if(this.workersList.length == 0){
            this.showNoResults = true;
          } else {
            var workersAlreadyAdded: Worker[] = [];
            this.workers.forEach(data =>{
              this.expandedRows[data?.workerId] = false;
              if (this.selectedBatchWorkers.findIndex((i:Worker)=> i.workerId == data.workerId) > -1) {
                workersAlreadyAdded.push(data);
              }
            });
            this.selectedWorkers = workersAlreadyAdded;
          }
          this.isLoaded = true;
        });
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE],
           title: ACCESS_DENIED_TITLE}));
      }
      
    }
    getAllWorkers() {
      let s = new WorkersSearchCriteria();
      s.pageNumber = 1;
      s.count = 2000;
      s.sortField = 'FirstName';

      this.workersService.getWorkersList(s).subscribe((result:any) => {
        this.allWorkers = _.cloneDeep(result.workers);
      });
    }
    setRows(e: any){
      this.rowCount = e.value;
      this.currentPage = 1;
      this.first = 0;
      this.getWorkers(this.currentPage , e.value);
    }
    printList(){
      if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
        let s: WorkersSearchCriteria = new WorkersSearchCriteria();
        s.advancedWorkerSearch = this.populateAdvancedSearch();
        this.workersService.printList(s).subscribe(result => {
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
    getFAflagsTree() {
      this.workersService.getFAWorkerFlagTree().subscribe(result => {
        this.FAFlagTree = _.cloneDeep(result);
      });
    }
    getWorkerEmploymentFlagTree() {
      this.workersService.getWorkerEmploymentFlagTree().subscribe(result => {
        this.employmentFlagTree = _.cloneDeep(result);
      });
    }
    getJobFitResults(){
      this.workersService.getJobFitResults().subscribe(response => {
        if(response){
          this.jobFitResults = response;
        }
      });
    }
    getJobFitScores(){
      this.workersService.getJobFitScores().subscribe(response => {
        if(response){
          this.jobFitScores = response;
        }
      });
    }
    onAdvanceSearchClick() {
      this.getWorkers(this.currentPage,this.rowCount);
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
    goToWorkersDetails(worker:Worker) {
      if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
        let workerId = worker.originalRevisionID ?? worker.workerId;
        this.workersService.setMenu(workerId);

        const url = this.router.serializeUrl(
          this.router.createUrlTree(['../workers/workers-details/' + workerId])
        );
        window.open(url);
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE],
           title: ACCESS_DENIED_TITLE}));
      }
    }
    advancedSearchToggle(){
      if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
        this.advancedSearch = !this.advancedSearch;
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE],
           title: ACCESS_DENIED_TITLE}));
      }
    }
    batchToggle(){
      this.isBatchOn = !this.isBatchOn;
      this.action = -1;
      this.selectedWorkers = [];
      this.selectedBatchWorkers = [];
      this.resetBatch();
    }
    onPageChange(e:any){
      this.first = e.first;
      this.currentPage = e.page + 1;
      this.getWorkers(e.page + 1,this.rowCount);
    }
    getFlagsTree() {
      this.store.dispatch(new FetchWorkerFlagTree());
      this.workerFlagTree$.subscribe(result => {
        this.flagTree = _.cloneDeep(result);
        this.selectedFlagTree = _.cloneDeep(result);
      });
    }
    getGroupsTree() {
      this.store.dispatch(new FetchWorkerGroupTree());
      this.groupTree$.subscribe(result => {
        this.groupTree = _.cloneDeep(result);
        this.selectedGroupTree = _.cloneDeep(result);
      });
    }
    getProviders(){
      this.workersService.getNoteProviders().subscribe(result => {
        this.providers = result;
      });
    }
    goToJobFit(id: number){
      if(this.authorisedFunctionList.Function[EFunctions.ViewJobFit]) {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(["../job-fit-criteria/worker-employment/" + id + "/0"])
        );
        window.open(url);
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }
    }
    getEvents(){
      this.workersService.getEvents().subscribe(result => {
        this.events = result;
      });
    }
    onDuplicateSelect(e: any) {
      const selected = this.selectedDuplicateWorkers[this.selectedDuplicateWorkers.length - 1];
      this.selectedDuplicateWorkers.length = 0;
      this.selectedDuplicateWorkers.push(selected);
    }
    addNewWorker() {
      if (this.authorisedFunctionList.Function[EFunctions.AddWorker]) {
        this.worker = new Worker();
        this.employee= new Employment();
        this.employee.employmentTypeId = 1;
        this.biologicalSex = -1;
        this.gender = "";
        this.dob = undefined;
        this.selectedDeptNumbs = [];
        this.deptTree = [];
        this.useHomeAddress = false;
        this.selectedDeptTree = [];
        this.newWorkerBox = true;
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }
    }
    addToFlags(e:any){

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
      this.getWorkers(this.currentPage,this.rowCount);
    }
    saveWorker(worker: Worker){
      if (this.useHomeAddress) {
        worker.mailAddress = this.worker.homeAddress;
      }
      if (worker.firstName == "") {
        this.errorMessage = "First Name is required";
        this.displayError = true;
      }
      else if (worker.lastName == "") {
        this.errorMessage = "Last Name is required";
        this.displayError = true;
      } else if (this.dob == null || worker.dob == null) {
        this.errorMessage = "Date of Birth is required";
        this.displayError = true;
      } else if (this.biologicalSex == -1) {
        this.errorMessage = "Biological Sex is required";
        this.displayError = true;
      } else if (this.employee.jobId < 1) {
        this.errorMessage = "Employment job is required";
        this.displayError = true;
      } else if (this.selectedDeptNumbs.length == 0){
          this.errorMessage = "A Department is Required";
          this.displayError = true;
      } else if (this.selectedDeptNumbs.length > 1){
          this.errorMessage = "Please select only 1 Department";
          this.displayError = true;
      } else if (this.employee.startDate == null) {
        this.errorMessage = "Employment Start Date is required";
        this.displayError = true;
      } else {
        this.detailsSaved = false;
        this.workersService.checkDuplicateWorkers(worker).subscribe(result => {
          if (result && result.workers.length > 0) {
            this.duplicateWorkers = result.workers;
            this.showDuplicate = true;
          } else {
            this.workersService.saveWorker(worker).subscribe((result:any) => {
              this.saveEmployment(result);
            });
          }
        })
      }
    }
    yesDuplicate() {
      if (this.selectedDuplicateWorkers.length == 0) {
        this.errorMessage = "Select one worker";
        this.displayError = true;
      } else {
        this.worker.duplicateWorkerId = this.selectedDuplicateWorkers[0];
        this.workersService.saveWorker(this.worker).subscribe((result:any) => {
          this.saveEmployment(result);
        });
      }
    }
    noDuplicate() {
      this.workersService.saveWorker(this.worker).subscribe((result:any) => {
        this.saveEmployment(result);
      });
    }
    saveEmployment(workerId:number){
      this.employee.workerId = workerId;
      this.employee.isActive = true;
      if(this.selectedDeptNumbs.length > 0){
        this.employee.orgEntityId = this.selectedDeptNumbs[0];
      }
      this.jobsService.saveEmployment(this.employee).subscribe(response => {
        this.detailsSaved = true;
        if(response){
          this.newWorkerBox = false;
          this.showDuplicate = false;
          this.getWorkers(this.currentPage,this.rowCount);
          this.getAllWorkers();
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['../workers/workers-details/' + workerId])
          );
          window.open(url);

        }
      });
    }
    setBiologicalSexSearchField(e : any){
      this.workerDetailsSearch.isMale = undefined;
      var gender = e?.value;
      if (gender != -1) {
        this.workerDetailsSearch.isMale = gender == EBiologicalSex.Male ? true: false;
      }
    }
    setBiologicalSexField(e : any){
      var biologicalSex = e?.value;
      if (biologicalSex != -1) {
        this.worker.isMale = biologicalSex == EBiologicalSex.Male ? true: false;
      }
    }
    setGenderField(e : any){
      var gender = e?.value;
      if (gender != "") {
        this.worker.gender = gender;
      }
    }
    onDobChange(e: any){
      if (this.dob instanceof Date) {
        this.worker.dob = new Date(moment(this.dob).format('YYYY-MM-DD'));
      }
    }
    resetCombineBox(){
      this.combineOptions = new CombineOptionsView();
      this.combineFirstName = "";
      this.combineLastName = "";
      this.selectedCombineFlagOption = 1;
      this.selectedCombineGroupOption = 1;
      this.selectedCombinedFlags = [];
      this.selectedCombinedGroups = [];
      this.collapseAll(this.flagTree);
      this.collapseAll(this.groupTree);
      this.activeCombine = [true, false, false];

    }
    collapseAll(tree: any[]){
      tree.forEach( node => {
          this.unselectAndCollapseRecursive(node, false);
      } );
    }

    unselectAndCollapseRecursive(node:TreeNode, isExpand:boolean){
      node.expanded = isExpand;
      node.partialSelected = undefined;
      if (node.children){
          node.children.forEach( childNode => {
            node.partialSelected = undefined;
            this.expandRecursive(childNode, isExpand);
          });
      }
    }
    openCombineWorkers() {
      if (this.authorisedFunctionList.Function[EFunctions.DeleteWorker]) {
        this.combineWorkersBox = true;
        this.resetCombineBox();
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [ACCESS_DENIED_MESSAGE] ,
           title: ACCESS_DENIED_TITLE}));
      }
    }
    combineWorkers(){
      var flagsEntityArray: SupplementaryEntity[] = [];
      var groupsEntityArray: SupplementaryEntity[] = [];

      if (this.combineFirstName == "") {
        this.errorMessage = "First Name is Required";
        this.displayError = true;
      }

      else if (this.combineLastName == ""){
        this.errorMessage = "Last Name is Required";
        this.displayError = true;
      }
      else if(this.combineOptions.firstEntityId == 0){
        this.errorMessage = "Combine Field is Required";
        this.displayError = true;
      }
      else if(this.combineOptions.secondEntityId == 0){
        this.errorMessage = "With Field is Required";
        this.displayError = true;
      }
      else{
      this.selectedCombinedFlags.forEach(element => {
        let entity = new SupplementaryEntity();
        entity.Id = element.id;
        flagsEntityArray.push(entity);
      });
      this.selectedCombinedGroups.forEach(element => {
        let entity = new SupplementaryEntity();
        entity.Id = element.id;
        groupsEntityArray.push(entity);
      });
      if(this.selectedCombineGroupOption === 1){
        this.combineOptions.groupsToSet = groupsEntityArray;
      } else {
        this.combineOptions.groupsToRemove = groupsEntityArray;
      }
      if(this.selectedCombineFlagOption === 1){
        this.combineOptions.flagsToSet = flagsEntityArray;
      } else {
        this.combineOptions.flagsToRemove = flagsEntityArray;
      }
      if (this.combineFirstName.length > 0 && this.combineLastName.length > 0) {
        this.combineOptions.combineEntityName = this.combineFirstName + ";" + this.combineLastName;
      }
      this.workersService.combineWorkers(this.combineOptions).subscribe(response => {
        if(response){
          this.combineWorkersBox = false;
          this.getWorkers(this.currentPage,this.rowCount);
          this.getAllWorkers();
        }
      });
    }
  }
    getAllJobs(){
      let s = new JobsSearchCriteria();
      s.pageNumber = 1;
      s.count = 2000;
      s.sortField = 'Name';
      s.quickSearch = new QuickSearch();
      s.advancedSearch = null;

      this.jobsService.getJobsList(s).subscribe(result => {
        this.jobList = [];
        if(result.jobs){
          result.jobs.forEach(j => {
            var job = new EmploymentJob();
            job.id = j.originalRevisionId ?? j.id;
            job.name = j.name;
            job.departments = j.departments;
            this.jobList.push(job);
          });
        }
      });
    }
    setJob(e: any){
      this.roster = [];
      this.employee.orgEntityId = 0;
      this.employee.rosterId = 0;
      this.getSelectedDepartments(e?.value);
      this.selectedJobId = e?.value;
      if(this.selectedDeptNumbs.length > 0){
        this.getRoster(this.selectedDeptNumbs[0]);
      }
    }
    getRoster(deptId:number){
      this.workersService.getRosterForOrgEntityTree(deptId).subscribe(response => {
        if(response){
          this.roster = response;
        }
      });
    }
    getSelectedDepartments(jobId: number){
      this.selectedDeptTree = [];
      this.selectedDeptNumbs = [];
      this.isLoading = true;

      var deptId = this.employee.orgEntityId;

      if(deptId > 0) {
        this.getRoster(deptId);
        this.selectedDeptNumbs = [];
        this.selectedDeptNumbs.push(deptId);
      } else {
        //select department from jobs
        var job = this.jobList.filter(x => x.id == jobId);
        if (job.length > 0) {
          var depts = job[0].departments;
          if(depts.length > 0){
            deptId = depts[0].id;
          }
          depts.forEach(element => {
            this.selectedDeptNumbs.push(element.id);
          });
        }
      }
      this.getSelectedDept(jobId);
    }
    getDeptTree() {
      this.deptTree$.subscribe(result => {
        this.allDeptTree = _.cloneDeep(result);
      });
    }
    expandAll(){
      this.selectedDeptTree.forEach( node => {
          this.expandRecursiveDepartment(node, true);
      } );
    }
    expandRecursiveDepartment(node:TreeNode, isExpand:boolean){
      node.expanded = isExpand;
      if (node.children){
          node.children.forEach( childNode => {
              this.expandRecursiveDepartment(childNode, isExpand);
          } );
      }
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
    getSelectedDept(jobId:number){
      this.jobsService.getSelectedJobsDeptTree(jobId).subscribe(result => {
        this.selectedDeptTree = _.cloneDeep(result);
        this.expandAll();
        this.isLoading = false;
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
    selectedDeptChange(e: any, dept:DeptTree) {
      if (e?.checked == true && !this.selectedDeptNumbs.includes(dept.id)) {
        this.selectedDeptNumbs.push(dept.id);
        this.getRoster(dept.id);
      } else {
        const idx = this.selectedDeptNumbs.findIndex((x) => x === dept.id);
        if (idx > -1) {
          this.selectedDeptNumbs.splice(idx, 1);
        }
        if (this.selectedDeptNumbs.length > 0) {
          this.getRoster(this.selectedDeptNumbs[0]);
        }
      }

    }
    setJobScore(e:any){
      this.employee.jobFitSummaryScore.jobId = this.selectedJobId;
      this.employee.jobFitSummaryScore.workerId = this.worker.workerId;
      this.employee.jobFitSummaryScore.jobFitScoreId = e.value.value;
    }
}
