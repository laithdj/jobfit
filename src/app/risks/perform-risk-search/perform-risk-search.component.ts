import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MenuItem, TreeNode } from 'primeng/api';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { JobsService } from 'src/app/jobs/jobs.service';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { EBiologicalSex } from 'src/app/shared/models/gender.model';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { Jobs } from 'src/app/shared/models/jobs.model';
import { Provider } from 'src/app/shared/models/provider.model';
import { QuickSearch } from 'src/app/shared/models/quicksearch.model';
import { EUseRecords, RiskSearchResultsView, RisksSearchView, RunRiskSearchView } from 'src/app/shared/models/risks.search.model';
import { AdvancedEmploymentSearch, AdvancedSearch, EmploymentType, Event, FunctionalAnalysisSearch, JobsAdvancedSearch, JobSearch, JobsSearchCriteria, SearchCriteria, TaskRequirement, TaskSearch, WorkerDetailSearchView, WorkersSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Task } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { WorkersService } from 'src/app/workers/workers.service';
import { RisksSearchService } from '../risks-search.service';

@Component({
  selector: 'app-perform-risk-search',
  templateUrl: './perform-risk-search.component.html',
  styleUrls: ['./perform-risk-search.component.css']
})
export class PerformRisksSearchComponent implements OnInit {
  riskSearchId: any;
  breadCrumbs: MenuItem[] = [];
  errorMessage = '';
  displayError = false;
  advancedSearch = false;
  useRecords: string = EUseRecords.Current;
  useRecordStart?: Date;
  useRecordEnd?: Date;
  refinelabel: string = '';
  showNoResult: boolean = false;
  resultTreeNode: TreeNode[] = [];
  expandLabel: string = 'Expand All';
  isExpanded: boolean = false;
  isLoading: boolean = false;
  riskSearchResults: RiskSearchResultsView[] =[];
  useRecordList = [
    {label: EUseRecords.Current, id: EUseRecords.Current},
    {label: EUseRecords.All, id: EUseRecords.All},
    {label: EUseRecords.Between, id: EUseRecords.Between}
  ];
  jobUseRecordList = [{label: EUseRecords.Current, id: EUseRecords.Current}]
  riskSearch: RisksSearchView = new RisksSearchView();
  riskSearchCriteriaList: string[] =[];
  riskSearchFilters: string[]= [];
  showNoFilter: boolean = true;
  //Refine
  flagsOption: number = -1;
  groupsOption: number = -1;
  jobSearchOption: number = 0;
  selectedGroups: GroupsTree[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedLinkedJobs: Jobs[] = [];
  siteTree: DeptTree[] = [];
  selectedSites: DeptTree[] = [];
  faSearch: FunctionalAnalysisSearch = new FunctionalAnalysisSearch();
  providers: Provider[] = [];
  events: Event[] = [];
  //Refine Task
  taskSearch: SearchCriteria = new SearchCriteria();
  taskDetail: string = "";
  taskFlagTree: FlagsTree[] = [];
  taskGroupTree: GroupsTree[] = [];
  selectedFrequency: TaskRequirement = new TaskRequirement();
  jobFlagTree: FlagsTree[] = [];
  selectedLinkedJobFlagTree:FlagsTree[] = [];
  taskFAFlagTree: FlagsTree[] = [];
  selectedTaskFAFlags: FlagsTree[] = [];
  //Refine Worker
  workerSearch: WorkersSearchCriteria = new WorkersSearchCriteria();
  workerDetailsSearch: WorkerDetailSearchView = new WorkerDetailSearchView();
  workerFlagTree: FlagsTree[] = [];
  workerGroupTree: GroupsTree[] = [];
  employmentFlagOption: number = -1;
  employmentFlagTree: FlagsTree[] = [];
  selectedEmploymentFlags: FlagsTree[] = [];
  empType:number = -1;
  employmentFrom?: Date;
  employmentTo?: Date;
  workerFAFlagTree: FlagsTree[] = [];
  selectedWorkerFAFlags: FlagsTree[] = [];
  gender: number = -1;
  //Refine Job
  jobSearch: JobsSearchCriteria = new JobsSearchCriteria();
  jobDetail: string = "";
  jobGroupTree: GroupsTree[] = [];
  linkedTaskFlagTreeOption: number = -1;
  selectedLinkedTaskFlagTree: FlagsTree[] = [];
  selectedLinkedTasks: Task[] =[];

  searchOptions = [{id:1 , name: "Must Contain at least 1"},{id:2 , name: "Must Contain all selected"}];
  employmentType = [{label:'Select Employment Type' , id:-1}, {label:'Employment' , id:EmploymentType.Employment} , {label:'Pre-Employment' , id:EmploymentType.PreEmployment}];
  freqOptions = [{ID:1 , name: "Essential"},{ID:2 , name: "Non-Essential"}];
  genders = [
    {name: 'Select', code: -1},
    {name: 'Female', code: EBiologicalSex.Female},
    {name: 'Male', code: EBiologicalSex.Male},
  ];
  advancedSearchModel: AdvancedSearch = new AdvancedSearch();
  linkedJobs: Jobs[] = [];
  linkedTasks: Task[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  runRiskSearchClicked: boolean = false;
  constructor(private translateService: TranslateService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private titleService: Title,
    private risksSearchService: RisksSearchService,
    private workersService: WorkersService,
    private jobsService: JobsService,
    private tasksService: TasksService) {
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.route.params.subscribe((params: Params) => {
        this.riskSearchId = params.riskSearchId;
        
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (Object.keys(this.authorisedFunctionList.Function).length > 0){
          if (this.authorisedFunctionList.Function[EFunctions.RunRisk]) {
            this.getRiskSearchData(params.riskSearchId);
          } else {
            this.isLoading = false;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
               title: ACCESS_DENIED_TITLE}));
          }
        }
      });
      this.store.dispatch(new ShowSideMenu(false));
  }
  changeUseRecord(e: any) {
    this.useRecordStart = undefined;
    this.useRecordEnd = undefined;
  }
  refineWorker() {
    this.riskSearchFilters = [];
    this.workerSearch = new WorkersSearchCriteria();

    if(this.workerDetailsSearch.employeeId != "") {
      this.riskSearchFilters.push("Employee Id: " + this.workerDetailsSearch.employeeId);
    }
    if(this.workerDetailsSearch.firstName != "") {
      this.riskSearchFilters.push("First Name: " + this.workerDetailsSearch.firstName);
    }
    if(this.workerDetailsSearch.lastName != "") {
      this.riskSearchFilters.push("Last Name: " + this.workerDetailsSearch.lastName);
    }
    if(this.workerDetailsSearch.isMale != null) {
      this.riskSearchFilters.push("Sex: " + (this.workerDetailsSearch.isMale ? "Male": "Female"));
    }
    if(this.workerDetailsSearch.ageFrom != null && this.workerDetailsSearch.ageTo != null) {
      this.riskSearchFilters.push("Age Between: " + this.workerDetailsSearch.ageFrom + ' and '+  this.workerDetailsSearch.ageTo);
    }
    if(this.workerDetailsSearch.dobFrom != null && this.workerDetailsSearch.dobTo != null) {
      this.workerDetailsSearch.dobFrom = new Date(moment(this.workerDetailsSearch.dobFrom).format('YYYY-MM-DD'));
      this.workerDetailsSearch.dobTo = new Date(moment(this.workerDetailsSearch.dobTo).format('YYYY-MM-DD')) ;
      this.riskSearchFilters.push("Date of Birth Between: " + moment(this.workerDetailsSearch.dobFrom).format("DD-MMM-YYYY") + ' and ' +  moment(this.workerDetailsSearch.dobTo).format("DD-MMM-YYYY"));
    }
    this.workerSearch.advancedWorkerSearch.WorkerDetailSearch = _.cloneDeep(this.workerDetailsSearch);

    if(this.selectedFlags.length > 0 && this.flagsOption > 0) {
      this.selectedFlags.forEach(element => {
        element.parent = undefined;
      });
      this.workerSearch.advancedWorkerSearch.flags = _.cloneDeep(this.selectedFlags);
      this.workerSearch.advancedWorkerSearch.flagsOption = this.flagsOption;
      var flagOption = this.searchOptions.filter(x=> x.id == this.flagsOption)[0].name;
      this.riskSearchFilters.push("Flags: " + flagOption  + " " + this.selectedFlags.map((x) => {return x.label}).join(", "));
    }
    if (this.selectedGroups.length > 0 && this.groupsOption > 0) {
      this.workerSearch.advancedWorkerSearch.groupsOption = this.groupsOption;
      this.selectedGroups.forEach(element => {
        element.parent = undefined;
      });
      this.workerSearch.advancedWorkerSearch.groups = _.cloneDeep(this.selectedGroups);
      var groupOption = this.searchOptions.filter(x=> x.id == this.groupsOption)[0].name;
      this.riskSearchFilters.push("Groups: " + groupOption  + " " + this.selectedGroups.map((x) => {return x.label}).join(", "));
    }
    this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch = new AdvancedEmploymentSearch();
    if (this.selectedSites.length > 0) {
      this.selectedSites.forEach(element => {
        element.parent = undefined;
      });
      this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch.sites = _.cloneDeep(this.selectedSites);
      this.riskSearchFilters.push("Employment Sites: " + this.selectedSites.map((x) => {return x.label}).join(", "));
    }
    if (this.empType > 0 && this.employmentFrom != null && this.employmentTo != null) {
      this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch.pastEmploymentFrom = new Date(moment(this.employmentFrom).format('YYYY-MM-DD'));
      this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch.pastEmploymentTo = new Date(moment(this.employmentTo).format('YYYY-MM-DD'));
      if(this.empType === EmploymentType.PreEmployment) {
        this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch.preEmployment = true;
      } else if (this.empType === EmploymentType.Employment) {
        this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch.preEmployment = false;
      }
      this.riskSearchFilters.push("Employment Details: " + (this.empType === EmploymentType.PreEmployment ? "Pre-employment" : "Employment") + " from " +
                              moment(this.employmentFrom).format("DD-MMM-YYYY") + ' and '+  moment(this.employmentTo).format("DD-MMM-YYYY"));
    }
    if(this.selectedEmploymentFlags.length > 0 && this.employmentFlagOption > 0) {
      this.selectedEmploymentFlags.forEach(element => {
        element.parent = undefined;
      });
      this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch.flags = _.cloneDeep(this.selectedEmploymentFlags);
      this.workerSearch.advancedWorkerSearch.advancedEmploymentSearch.flagsOption = this.employmentFlagOption;
      var employmentFlagOption = this.searchOptions.filter(x=> x.id == this.employmentFlagOption)[0].name;
      this.riskSearchFilters.push("Flags: " + employmentFlagOption  + " " + this.selectedEmploymentFlags.map((x) => {return x.label}).join(", "));
    }
    if (this.faSearch.from != null && this.faSearch.to != null) {
      this.workerSearch.advancedWorkerSearch.functionalAnalysis.from = new Date(moment(this.faSearch.from).format('YYYY-MM-DD'));
      this.workerSearch.advancedWorkerSearch.functionalAnalysis.to = new Date(moment(this.faSearch.to).format('YYYY-MM-DD')) ;
      this.riskSearchFilters.push("FA Assessment Dates: " + moment(this.faSearch.from).format("DD-MMM-YYYY")  + " and " + moment(this.faSearch.to).format("DD-MMM-YYYY") );
    }
    if (this.faSearch.providers.length > 0) {
      this.riskSearchFilters.push("FA Assessed By: " + this.faSearch.providers.map((x) => {return x.fullNameWithProfession}).join(", "));
      this.workerSearch.advancedWorkerSearch.functionalAnalysis.providers = _.cloneDeep(this.faSearch.providers);
    }
    if (this.faSearch.events.length > 0) {
      this.riskSearchFilters.push("FA Events: " + this.faSearch.events.map((x) => {return x.name}).join(", "));
      this.workerSearch.advancedWorkerSearch.functionalAnalysis.events = _.cloneDeep(this.faSearch.events);
    }
    if (this.selectedWorkerFAFlags.length > 0) {
      this.selectedWorkerFAFlags.forEach(element => {
        element.parent = undefined;
      });
      this.workerSearch.advancedWorkerSearch.functionalAnalysis.flagsOption = this.faSearch.flagsOption;
      var faflagOption = this.searchOptions.filter(x=> x.id == this.faSearch.flagsOption)[0].name;
      this.riskSearchFilters.push("FA Flags: " + faflagOption + " "+ this.selectedWorkerFAFlags.map((x) => {return x.label}).join(", "));
      this.workerSearch.advancedWorkerSearch.functionalAnalysis.flagSearch = _.cloneDeep(this.selectedWorkerFAFlags);
    }
    this.advancedSearch = false;
    if (this.riskSearchFilters.length == 0) {
      this.showNoFilter = true;
    }
    this.riskSearchResults = [];
    this.resultTreeNode = [];
    this.showNoResult = false;
    this.runRiskSearch();
  }
  refineTask() {
    this.riskSearchFilters = [];
    this.taskSearch = new SearchCriteria();
    if (this.taskDetail != "") {
      this.taskSearch.quickSearch = new QuickSearch();
      this.taskSearch.quickSearch.value = this.taskDetail;
      this.riskSearchFilters.push("Detail: " + this.taskDetail);
    }
    this.taskSearch.advancedSearch = new AdvancedSearch();
    this.taskSearch.advancedSearch.flagsOption = this.flagsOption;
    if(this.selectedFlags.length > 0) {
      this.selectedFlags.forEach(element => {
        element.parent = undefined;
      });
      this.taskSearch.advancedSearch.flags = _.cloneDeep(this.selectedFlags);
      var flagOption = this.searchOptions.filter(x=> x.id == this.flagsOption)[0].name;
      this.riskSearchFilters.push("Flags: " + flagOption  + " " + this.selectedFlags.map((x) => {return x.label}).join(", "));
    }

    if (this.selectedGroups.length > 0) {
      this.taskSearch.advancedSearch.groupsOption = this.groupsOption;
      this.selectedGroups.forEach(element => {
        element.parent = undefined;
      });
      this.taskSearch.advancedSearch.groups = _.cloneDeep(this.selectedGroups);
      var groupOption = this.searchOptions.filter(x=> x.id == this.groupsOption)[0].name;
      this.riskSearchFilters.push("Groups: " + groupOption  + " " + this.selectedGroups.map((x) => {return x.label}).join(", "));
    }
    this.taskSearch.advancedSearch.jobs = new JobSearch();
    if (this.selectedLinkedJobs.length > 0) {
      this.taskSearch.advancedSearch.jobs.jobs = _.cloneDeep(this.selectedLinkedJobs);
      this.riskSearchFilters.push("Linked Jobs: " + this.selectedLinkedJobs.map((x) => {return x.name}).join(", "));
    }
    if (this.selectedFrequency.ID > 0) {
      this.taskSearch.advancedSearch.jobs.frequency = _.cloneDeep(this.selectedFrequency);
      this.riskSearchFilters.push("Frequency: " + this.selectedFrequency.name);
    }
    if (this.selectedLinkedJobFlagTree.length > 0) {
      this.selectedLinkedJobFlagTree.forEach(element => {
        element.parent = undefined;
      });
      this.taskSearch.advancedSearch.jobs.flags = _.cloneDeep(this.selectedLinkedJobFlagTree);
      this.taskSearch.advancedSearch.jobs.searchOption = this.jobSearchOption;
      var jobflagOption = this.searchOptions.filter(x=> x.id == this.jobSearchOption)[0].name;
      this.riskSearchFilters.push("Job Flags: " + jobflagOption + " " + this.selectedLinkedJobFlagTree.map((x) => {return x.label}).join(", "));
    }
    if (this.selectedSites.length > 0) {
      this.selectedSites.forEach(element => {
        element.parent = undefined;
      });
      this.taskSearch.advancedSearch.sites = _.cloneDeep(this.selectedSites);
      this.riskSearchFilters.push("Sites: " + this.selectedSites.map((x) => {return x.label}).join(", "));
    }
    if (this.faSearch.from != null && this.faSearch.to != null) {
      this.taskSearch.advancedSearch.functionalAnalysis.from = new Date(moment(this.faSearch.from).format('YYYY-MM-DD'));
      this.taskSearch.advancedSearch.functionalAnalysis.to = new Date(moment(this.faSearch.to).format('YYYY-MM-DD')) ;
      this.riskSearchFilters.push("FA Assessment Dates: " + moment(this.faSearch.from).format("DD-MMM-YYYY")  + " and " + moment(this.faSearch.to).format("DD-MMM-YYYY") );
    }
    if (this.faSearch.providers.length > 0) {
      this.riskSearchFilters.push("FA Assessed By: " + this.faSearch.providers.map((x) => {return x.fullNameWithProfession}).join(", "));
      this.taskSearch.advancedSearch.functionalAnalysis.providers = _.cloneDeep(this.faSearch.providers);
    }
    if (this.faSearch.events.length > 0) {
      this.riskSearchFilters.push("FA Events: " + this.faSearch.events.map((x) => {return x.name}).join(", "));
      this.taskSearch.advancedSearch.functionalAnalysis.events = _.cloneDeep(this.faSearch.events);
    }
    if (this.selectedTaskFAFlags.length > 0) {
      this.selectedTaskFAFlags.forEach(element => {
        element.parent = undefined;
      });
      this.taskSearch.advancedSearch.functionalAnalysis.flagsOption = this.faSearch.flagsOption;
      var faflagOption = this.searchOptions.filter(x=> x.id == this.faSearch.flagsOption)[0].name;
      this.riskSearchFilters.push("FA Flags: " + faflagOption + " "+ this.selectedTaskFAFlags.map((x) => {return x.label}).join(", "));
      this.taskSearch.advancedSearch.functionalAnalysis.flagSearch = _.cloneDeep(this.selectedTaskFAFlags);
    }

    this.advancedSearch = false;
    if (this.riskSearchFilters.length == 0) {
      this.showNoFilter = true;
    }
    this.riskSearchResults = [];
    this.resultTreeNode = [];
    this.showNoResult = false;
    this.runRiskSearch();
  }
  refineJob() {
    this.riskSearchFilters = [];
    this.jobSearch = new JobsSearchCriteria();
    if (this.jobDetail != "") {
      this.jobSearch.quickSearch = new QuickSearch();
      this.jobSearch.quickSearch.value = this.jobDetail;
      this.riskSearchFilters.push("Detail: " + this.jobDetail);
    }
    this.jobSearch.advancedSearch = new JobsAdvancedSearch();
    this.jobSearch.advancedSearch.flagsOption = this.flagsOption;
    if(this.selectedFlags.length > 0) {
      this.selectedFlags.forEach(element => {
        element.parent = undefined;
      });
      this.jobSearch.advancedSearch.flags = _.cloneDeep(this.selectedFlags);
      var flagOption = this.searchOptions.filter(x=> x.id == this.flagsOption)[0].name;
      this.riskSearchFilters.push("Flags: " + flagOption  + " " + this.selectedFlags.map((x) => {return x.label}).join(", "));
    }
    if (this.selectedGroups.length > 0) {
      this.jobSearch.advancedSearch.groupsOption = this.groupsOption;
      this.selectedGroups.forEach(element => {
        element.parent = undefined;
      });
      this.jobSearch.advancedSearch.groups = _.cloneDeep(this.selectedGroups);
      var groupOption = this.searchOptions.filter(x=> x.id == this.groupsOption)[0].name;
      this.riskSearchFilters.push("Groups: " + groupOption  + " " + this.selectedGroups.map((x) => {return x.label}).join(", "));
    }
    this.jobSearch.advancedSearch.tasks = new TaskSearch();
    if (this.selectedLinkedTasks.length > 0) {
      this.jobSearch.advancedSearch.tasks.tasks = _.cloneDeep(this.selectedLinkedTasks);
      this.riskSearchFilters.push("Linked Tasks: " + this.selectedLinkedTasks.map((x) => {return x.name}).join(", "));
    }
    if (this.selectedFrequency.ID > 0) {
      this.jobSearch.advancedSearch.tasks.frequency = _.cloneDeep(this.selectedFrequency);
      this.riskSearchFilters.push("Frequency: " + this.selectedFrequency.name);
    }
    if (this.selectedLinkedTaskFlagTree.length > 0) {
      this.selectedLinkedTaskFlagTree.forEach(element => {
        element.parent = undefined;
      });
      this.jobSearch.advancedSearch.tasks.flags = _.cloneDeep(this.selectedLinkedTaskFlagTree);
      this.jobSearch.advancedSearch.tasks.searchOption = this.linkedTaskFlagTreeOption;
      var linkedTaskFlagTreeOption = this.searchOptions.filter(x=> x.id == this.linkedTaskFlagTreeOption)[0].name;
      this.riskSearchFilters.push("Task Flags: " + linkedTaskFlagTreeOption + " " + this.selectedLinkedTaskFlagTree.map((x) => {return x.label}).join(", "));
    }
    if (this.selectedSites.length > 0) {
      this.selectedSites.forEach(element => {
        element.parent = undefined;
      });
      this.jobSearch.advancedSearch.sites = _.cloneDeep(this.selectedSites);
      this.riskSearchFilters.push("Sites: " + this.selectedSites.map((x) => {return x.label}).join(", "));
    }
    if (this.faSearch.from != null && this.faSearch.to != null) {
      this.jobSearch.advancedSearch.functionalAnalysis.from = new Date(moment(this.faSearch.from).format('YYYY-MM-DD'));
      this.jobSearch.advancedSearch.functionalAnalysis.to = new Date(moment(this.faSearch.to).format('YYYY-MM-DD')) ;
      this.riskSearchFilters.push("FA Assessment Dates: " + moment(this.faSearch.from).format("DD-MMM-YYYY")  + " and " + moment(this.faSearch.to).format("DD-MMM-YYYY") );
    }
    if (this.faSearch.providers.length > 0) {
      this.riskSearchFilters.push("FA Assessed By: " + this.faSearch.providers.map((x) => {return x.fullNameWithProfession}).join(", "));
      this.jobSearch.advancedSearch.functionalAnalysis.providers = _.cloneDeep(this.faSearch.providers);
    }
    if (this.faSearch.events.length > 0) {
      this.riskSearchFilters.push("FA Events: " + this.faSearch.events.map((x) => {return x.name}).join(", "));
      this.jobSearch.advancedSearch.functionalAnalysis.events = _.cloneDeep(this.faSearch.events);
    }
    if (this.selectedTaskFAFlags.length > 0) {
      this.selectedTaskFAFlags.forEach(element => {
        element.parent = undefined;
      });
      this.jobSearch.advancedSearch.functionalAnalysis.flagsOption = this.faSearch.flagsOption;
      var faflagOption = this.searchOptions.filter(x=> x.id == this.faSearch.flagsOption)[0].name;
      this.riskSearchFilters.push("FA Flags: " + faflagOption + " "+ this.selectedTaskFAFlags.map((x) => {return x.label}).join(", "));
      this.jobSearch.advancedSearch.functionalAnalysis.flagSearch = _.cloneDeep(this.selectedTaskFAFlags);
    }
    this.advancedSearch = false;
    if (this.riskSearchFilters.length == 0) {
      this.showNoFilter = true;
    }
    this.riskSearchResults = [];
    this.resultTreeNode = [];
    this.showNoResult = false;
    this.runRiskSearch();
  }
  clearTaskSearch(){
    this.riskSearchFilters = [];
    this.taskDetail = "";
    this.taskSearch = new SearchCriteria();
    this.flagsOption = -1;
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.selectedSites = [];
    this.selectedLinkedJobFlagTree = [];
    this.selectedLinkedJobs = [];
    this.selectedFrequency = new TaskRequirement();
    this.selectedTaskFAFlags = [];
    this.groupsOption = -1;
    this.advancedSearch = false;
    this.showNoFilter = true;
    this.jobSearchOption = -1;
    this.faSearch = new FunctionalAnalysisSearch();
    this.riskSearchResults = [];
    this.resultTreeNode = [];
    this.showNoResult = false;
  }
  clearJobSearch(){
    this.riskSearchFilters = [];
    this.jobDetail = "";
    this.flagsOption = -1;
    this.selectedFlags = [];
    this.advancedSearch = false;
    this.showNoFilter = true;
    this.groupsOption = -1;
    this.selectedGroups = [];
    this.selectedLinkedTasks = [];
    this.selectedFrequency = new TaskRequirement();
    this.linkedTaskFlagTreeOption = -1;
    this.selectedLinkedTaskFlagTree = [];
    this.selectedSites = [];
    this.faSearch = new FunctionalAnalysisSearch();
    this.selectedTaskFAFlags = [];
    this.riskSearchResults = [];
    this.resultTreeNode = [];
    this.showNoResult = false;
  }
  clearAdvancedWorkerSearch() {
    this.workerSearch = new WorkersSearchCriteria();
    this.workerDetailsSearch = new WorkerDetailSearchView();
    this.flagsOption = -1;
    this.selectedFlags = [];
    this.selectedGroups = [];
    this.groupsOption = -1;
    this.faSearch = new FunctionalAnalysisSearch();
    this.advancedSearch = false;
    this.showNoFilter = true;
    this.riskSearchFilters = [];
    this.gender = -1;
    this.employmentFlagOption = -1;
    this.selectedEmploymentFlags = [];
    this.selectedSites = [];
    this.empType = -1;
    this.employmentFrom = undefined;
    this.employmentTo = undefined;
    this.riskSearchResults = [];
    this.resultTreeNode = [];
    this.showNoResult = false;
  }
  getTaskFlagsTree() {
    this.tasksService.getFlagsTree().subscribe(result => {
      this.taskFlagTree = _.cloneDeep(result);
    });
  }
  getTaskGroupsTree() {
    this.tasksService.getGroupsTree().subscribe(result => {
      this.taskGroupTree = _.cloneDeep(result);
    });
  }
  getAllJobs(){
    this.tasksService.quickSearchJobs('%20').subscribe(response => {
      if(response){
        this.linkedJobs = response;
      }
    });
  }
  getJobsFlagTree() {
    this.jobsService.getJobsFlagTree().subscribe(result => {
      this.jobFlagTree = _.cloneDeep(result);
    });
  }
  getSiteTree(){
    this.workersService.getSitesTree([]).subscribe(result => {
      this.siteTree = _.cloneDeep(result);
    });
  }
  getTaskFAflagsTree() {
    this.jobsService.getFATaskFlagTree().subscribe(result => {
      this.taskFAFlagTree = _.cloneDeep(result);
    });
  }
  getWorkerFAflagsTree() {
    this.workersService.getFAWorkerFlagTree().subscribe(result => {
      this.workerFAFlagTree = _.cloneDeep(result);
    });
  }
  getAllTasks(){
    this.tasksService.quickSearchTasks('%20').subscribe(response => {
      if(response){
        this.linkedTasks = response;
      }
    });
  }
  getWorkerEmploymentFlagTree() {
    this.workersService.getWorkerEmploymentFlagTree().subscribe(result => {
      this.employmentFlagTree = _.cloneDeep(result);
    });
  }
  getWorkerFlagsTree() {
    this.workersService.getWorkersFlagTree().subscribe(result => {
      this.workerFlagTree = _.cloneDeep(result);
    });
  }
  getWorkerGroupsTree() {
    this.workersService.getWorkersGroupTree().subscribe(result => {
      this.workerGroupTree = _.cloneDeep(result);
    });
  }
  getJobGroupsTree() {
    this.jobsService.getJobsGroupTree().subscribe(result => {
      this.jobGroupTree = _.cloneDeep(result);
    });
  }
  getProviders(){
    this.workersService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getEvents(){
    this.workersService.getEvents().subscribe(result => {
      this.events = result;
    });
  }
  advancedSearchToggle(){
    this.advancedSearch = !this.advancedSearch;
    if (this.advancedSearch) {
      this.showNoFilter = false;
    }
  }
  setGenderSearchField(e : any){
    this.workerDetailsSearch.isMale = undefined;
    var gender = e?.value;
    if (gender != -1) {
      this.workerDetailsSearch.isMale = gender == EBiologicalSex.Male ? true: false;
    }
  }
  expandToggle() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.expandAll();
    } else {
      this.collapseAll();
    }
  }
  ngOnInit(): void {
  }
  expandAll(){
    this.resultTreeNode.forEach( node => {
        this.expandRecursive(node, true);
    } );
  }

  collapseAll(){
    this.resultTreeNode.forEach( node => {
        this.expandRecursive(node, false);
    } );
  }

  expandRecursive(node:TreeNode, isExpand:boolean){
    node.expanded = isExpand;
    if (node.children){
        node.children.forEach( childNode => {
            this.expandRecursive(childNode, isExpand);
        } );
    }
  }
  getRiskSearchData(riskSearchId: number) {
    this.isLoading = true;
    this.risksSearchService.getRiskSearchData(riskSearchId).subscribe((result:RisksSearchView) => {
      if(result) {
        this.riskSearch = _.cloneDeep(result);
        this.refinelabel = 'Refine ' + this.riskSearch.typeName;
        this.riskSearchCriteriaList = [];
        this.riskSearch.riskSearchCriteriaView.forEach((item) => {
          var joinedBy = item.joinedBy ?? "";
          this.riskSearchCriteriaList.push(joinedBy + ' ' + item.criteriaTypeName +' ' + item.entitiesString + ' ' + item.operatorName + ' ' + item.valuesString);
        });
        this.populateSearch(this.riskSearch.typeName);
        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Perform Risk Search', url: 'risks'},
          {label: this.riskSearch.name}
        ];
        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
        this.titleService.setTitle(this.riskSearch.name);
      }
      this.isLoading = false;
    });
  }

  populateSearch(typeName: string) {
    switch(typeName) {
      case "Task": {
        this.getTaskFlagsTree();
        this.getTaskGroupsTree();
        this.getJobsFlagTree();
        this.getTaskFAflagsTree();
        this.getEvents();
        this.getTaskFAflagsTree();
        this.getProviders();
        this.getSiteTree();
        this.getAllJobs();
        break;
      }
      case "Worker": {
        this.getWorkerFlagsTree();
        this.getWorkerEmploymentFlagTree();
        this.getWorkerGroupsTree();
        this.getSiteTree();
        this.getProviders();
        this.getEvents();
        this.getWorkerFAflagsTree();
        break;
      }
      case "Job": {
        this.getJobsFlagTree();
        this.getJobGroupsTree();
        this.getAllTasks();
        this.getTaskFlagsTree();
        this.getSiteTree();
        this.getTaskFAflagsTree();
        this.getProviders();
        this.getEvents();
        break;
      }
    }
  }
  runRiskSearch() {
    if (this.authorisedFunctionList.Function[EFunctions.RunRisk]) {
      this.runRiskSearchClicked = true;
      this.isLoading = true;
      this.showNoResult = false;
      this.riskSearchResults = [];
      var runRiskSearchView = new RunRiskSearchView();
      runRiskSearchView.runOption = this.useRecords;
      if (this.useRecords == EUseRecords.Between) {
        runRiskSearchView.start = new Date(moment(this.useRecordStart).format('YYYY-MM-DD'));
        runRiskSearchView.end = new Date(moment(this.useRecordEnd).format('YYYY-MM-DD'));
      }

      runRiskSearchView = this.setAdvancedSearch(runRiskSearchView);

      this.risksSearchService.performRiskSearch(this.riskSearchId.toString(), runRiskSearchView).subscribe((result:RiskSearchResultsView[]) => {
        if(result) {
          this.riskSearchResults = _.cloneDeep(result);
          this.resultTreeNode = this.mapToTreeNode(this.riskSearchResults);
          this.showNoResult = this.riskSearchResults.length == 0;
          this.isExpanded = false;
        }
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }

  setAdvancedSearch(runRiskSearchView: RunRiskSearchView) {
    runRiskSearchView.typeName = this.riskSearch.typeName;

    switch(this.riskSearch.typeName) {
      case "Worker": {
        runRiskSearchView.workerSearch = _.cloneDeep(this.workerSearch);
        break;
      }
      case "Task": {
        runRiskSearchView.taskSearch = _.cloneDeep(this.taskSearch);
        break;
      }
      case "Job": {
        runRiskSearchView.jobSearch = _.cloneDeep(this.jobSearch);
        break;
      }
    }
    return runRiskSearchView;
  }
  printList() {
    if (this.authorisedFunctionList.Function[EFunctions.RunRisk] && this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      if (this.runRiskSearchClicked) {
        this.isLoading = true;
        var runRiskSearch = new RunRiskSearchView();
        runRiskSearch.runOption = this.useRecords;
        if (this.useRecords == EUseRecords.Between) {
          runRiskSearch.start = new Date(moment(this.useRecordStart).format('YYYY-MM-DD'));
          runRiskSearch.end = new Date(moment(this.useRecordEnd).format('YYYY-MM-DD'));
        }
        runRiskSearch = this.setAdvancedSearch(runRiskSearch);
        this.risksSearchService.printList(this.riskSearchId.toString(), runRiskSearch).subscribe((result:any) => {
          if(result) {
            let file = new Blob([result], { type: 'application/pdf' });
            var fileURL = URL.createObjectURL(file);
            window.open(fileURL);
            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = "Please click Run button to perform Risk Search";
        this.displayError = true;
      }
      
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  export() {
    if (this.authorisedFunctionList.Function[EFunctions.RunRisk] && this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      if (this.runRiskSearchClicked) {
        this.isLoading = true;
        var runRiskSearch = new RunRiskSearchView();
        runRiskSearch.runOption = this.useRecords;
        if (this.useRecords == EUseRecords.Between) {
          runRiskSearch.start = new Date(moment(this.useRecordStart).format('YYYY-MM-DD'));
          runRiskSearch.end = new Date(moment(this.useRecordEnd).format('YYYY-MM-DD'));
        }
        runRiskSearch = this.setAdvancedSearch(runRiskSearch);
        this.risksSearchService.export(this.riskSearchId.toString(), runRiskSearch).subscribe((result:any) => {
          if(result) {
            let type = result?.type ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            let fileName = "Risk Search";
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
            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = "Please click Run button to perform Risk Search";
        this.displayError = true;
      }
      
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  mapToTreeNode(result:RiskSearchResultsView[]):TreeNode[] {
    var resultTree: TreeNode[] = [];
    result.forEach((x) => {
      var children: TreeNode[] = [];
      x.children.forEach((y) => {
        var itemResults: TreeNode[] = [];
        y.results.forEach((z) => {
          itemResults.push({
            icon: "pi pi-exclamation-triangle",
            label: z.key + " - " + z.value
          });
        });
        children.push({
          icon: "pi pi-check",
          label: y.itemName,
          children: itemResults
        })
      })

      var itemNode:TreeNode = {
        icon: this.riskSearch.typeName == "Worker" ? "fas fa-user-cog": this.riskSearch.typeName == "Task"? "far fa-clipboard": "fas fa-clipboard-list",
        label: x.entityName,
        children: children
      }
      resultTree.push(itemNode);
    });
    return resultTree;
  }


}
