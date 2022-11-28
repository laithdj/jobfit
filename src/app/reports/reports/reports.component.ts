import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import * as moment from 'moment';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { JobFittingService } from 'src/app/job-fitting/job-fitting.service';
import { JobsService } from 'src/app/jobs/jobs.service';
import { JobFitOptions } from 'src/app/shared/models/job-fitting.model';
import { EReportType, Report, ReportOptions } from 'src/app/shared/models/reports.model';
import { FetchTask, SetSideMenu, ShowSideMenu, SetBreadCrumb } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectTask, selectBreadCrumb } from 'src/app/store/job-fit.selectors';
import { FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { WorkersService } from 'src/app/workers/workers.service';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})

export class ReportsComponent implements OnInit {
  loaded: boolean = true;
  type:string = '';
  id: number = 0;
  reports: Report[] = [];
  selectedReport: Report = new Report();
  selectedReportId: number = 0;
  jobfitWorkerId: number = 0;
  jobfitJobId: number = 0;
  isStandard: boolean = true;
  breadCrumbs: MenuItem[] = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'...'},
  ];
  breadCrumb$ = this.store.pipe(select(selectBreadCrumb));
  sortType: any = {
    name: "Name",
    ratio: "Ratio",
    priority: "Priority",
  };
  isJobFunctionalRequirementsForm: boolean = false;
  generalOptions: any = {
    includeBiologicalSex: "Include Biological Sex",
    includeAddress: "Include Address",
    includeImageAttachments: "Include Image Attachments",
    includeFaqPage: "Include FAQ Page",
    includeJobfitMatchingGrid: "Include Jobfit Matching Grid",
  };
  associatedTasksOptions: any = {
    includeDetails: "Include Task Details",
    includeImageAttachments: "Include Task Image Attachments",
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
  taskDetailsCustomListOption: any = [];
  functionalAnalysisOptions: any = {
    includeFaRecords: "Include Functional Analysis Records",
    includeFaGraphs: "Include Functional Analysis Record Graphs",
  };
  recordSelectionOptions: any = {
    current: "Current",
    all: "All",
    between: "Between",
  };
  posturalTolerancesOptions: any = this.setPosturalDropdownData();
  materialHandlingsOptions: any = this.setMaterialDropdownData();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  task$ = this.store.pipe(select(selectTask));
  selectedGeneralCheckboxes: string[] = [];
  selectedAssociatedTasks: string[] = [];
  selectedSortType: string = "";
  selectedFaCheckboxes: string[] = [];
  selectedRecordSelection: string = "";
  selectedFromDateValue: string = "";
  selectedToDateValue: string = "";
  selectedPosturalTolerances: string[] = [];
  selectedMaterialHandlings: string[] = [];
  selectedTaskDetails: string = "";
  selectedTaskDetailsCustomList: number[] = [];

  constructor(private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private jobService: JobsService,
    private taskService: TasksService,
    private workerService: WorkersService,
    private jobfitService: JobFittingService,
    private reportService: ReportsService,
    private titleService: Title,
    ) {
    this.route.params.subscribe((params: Params) => {
      this.type = params.type;
      this.id = params.id;
      this.store.dispatch(new ShowSideMenu(true));
      this.getReportPerType(this.type);
      this.prePopulateSelections();
      this.getName(this.id , this.type);
      if ((params?.workerId) && (params?.jobId)) {
        this.jobfitWorkerId = params.workerId;
        this.jobfitJobId = params.jobId;
        this.getPagedTaskSets(this.jobfitJobId);
      }
    });
    this.sortType.toArray = Object.values(this.sortType);
    this.recordSelectionOptions.toArray = Object.values(this.recordSelectionOptions);
    this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
  }

  ngOnInit(): void {
  }
  getName(id:number , type:string){
    switch (type) {
      case EReportType.Job.toLowerCase():
      {
        this.jobService.getJob(id).subscribe((result:any) => {
          this.titleService.setTitle(result.name);
          this.breadCrumbs = [
            {icon: 'pi pi-home', url: 'home'},
            {label:'Jobs', url: 'jobs'},
            {label:result.name, url: `jobs/jobs-details/${result.jobsId}` },
            {label:'Reports'},
          ];
          this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
        });
        break;
      }
      case EReportType.Task.toLowerCase():
      {
        this.store.dispatch(new FetchTask(id));
        this.task$.subscribe(result => {
          this.titleService.setTitle(result.name);
          this.breadCrumbs = [
            {icon: 'pi pi-home', url: 'home'},
            {label:'Tasks', url: 'tasks'},
            {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
            {label:'Reports'},
          ];
          this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
        });
        break;
      }
      case EReportType.Worker.toLowerCase():
      {
        this.store.dispatch(new FetchWorkerDetails(id));
        this.workerDetails$.subscribe(result => {
          if (result) {
            this.titleService.setTitle(result.fullName);
            this.breadCrumbs = [
              {icon: 'pi pi-home', url: 'home'},
              {label:'Workers', url: 'workers'},
              {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
              {label:'Reports'},
            ];
            this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
          }
        });
        break;
      }
      case EReportType.JobFit.toLowerCase():
      {
        this.store.dispatch(new SetSideMenu(this.jobfitService?.menuList));
        this.getReports(EReportType.JobFit);
        break;
      }
    }

  }
  generateReport() {
    this.loaded = false;
    if(localStorage.getItem("additionalTaskSetsList") !== null){
      this.jobfitService.summaryOptions.additionalTaskSetsList = JSON.parse(localStorage.getItem("additionalTaskSetsList") ?? "");
    }
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
      reportId: this.selectedReport.id,
      isStandard: this.isStandard,
      isSummary: this.selectedReport.name?.includes("Summary"),
      generalReportOptions: {
        includeBiologicalSex: this.selectedGeneralCheckboxes.includes(this.generalOptions.includeBiologicalSex),
        includeAddress: this.selectedGeneralCheckboxes.includes(this.generalOptions.includeAddress),
        includeFAQPage: this.selectedGeneralCheckboxes.includes(this.generalOptions.includeFaqPage),
        includeImageAttachments: this.selectedGeneralCheckboxes.includes(this.generalOptions.includeImageAttachments),
        includeJobfitMatchingGrid: this.selectedGeneralCheckboxes.includes(this.generalOptions.includeJobfitMatchingGrid)
      },
      assocTaskReportOptions: {
        includeTaskDetails: this.selectedAssociatedTasks.includes(this.associatedTasksOptions.includeDetails),
        includeTaskImageAttachments: this.selectedAssociatedTasks.includes(this.associatedTasksOptions.includeImageAttachments),
        sortTaskBy: this.selectedSortType,
      },
      faReportOptions: {
        recordSelectionOption: this.selectedRecordSelection,
        includeRecords: this.selectedFaCheckboxes.includes(this.functionalAnalysisOptions.includeFaRecords),
        includeGraphs: this.selectedFaCheckboxes.includes(this.functionalAnalysisOptions.includeFaGraphs),
        posturalToleranceIds: this.selectedPosturalTolerances.map(x => Number(x)),
        materialHandlingContinuousIds: getSelectedMaterialIdsByType("Continuous"),
        materialHandlingFrequentIds: getSelectedMaterialIdsByType("Frequent"),
        materialHandlingOccassionalIds: getSelectedMaterialIdsByType("Occasional"),
        startDate: new Date(moment(this.selectedFromDateValue).format('YYYY-MM-DD')),
        endDate: new Date(moment(this.selectedToDateValue).format('YYYY-MM-DD'))
      },
      taskDetailsReportOptions: {
        taskIncludeOption: this.selectedTaskDetails,
        suitableTaskIds: this.jobfitService?.summaryOptions?.suitableTaskIds,
        customTaskIds: this.selectedTaskDetailsCustomList,
      },
      jobfitReportOptions: {
        ...new JobFitOptions(),
        workerId: this.jobfitWorkerId,
        associatedId: this.jobfitJobId,
        additionalTaskSetsList: this.jobfitService?.summaryOptions?.additionalTaskSetsList,
      }
    };

    this.reportService.viewReport(String(this.id), reportOptions).subscribe(result => {
      const binary = atob(result.replace(/\s/g, ''));
      const len = binary.length;
      let buffer = new ArrayBuffer(len);
      let resultDecoded = new Uint8Array(buffer);
      for (var i = 0; i < len; i++) {
          resultDecoded[i] = binary.charCodeAt(i);
      }
      const file = new Blob([resultDecoded], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
      this.loaded = true;
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
  getReports(type: string) {
    this.loaded = false;
    this.reportService.getReports(type).subscribe(result => {
      this.reports = result.reports;
      //set to standard report
      if (this.reports.length > 0) {
        this.selectedReport = this.reports[0];
        this.selectedReportId = this.selectedReport.id;
      }
      this.loaded = true;
    });
  }
  selectedValue(e: any){
    this.selectedReportId = e.value;
    this.selectedReport = this.reports.filter(x => x.id == this.selectedReportId)[0];
    this.isStandard = this.selectedReport.name.indexOf("Standard") > -1 ? true: false;
    this.selectedFaCheckboxes = [];
    this.isJobFunctionalRequirementsForm = this.selectedReport.name == "Job Functional Requirements Form";
    if ((this.selectedReport.reportSection.filter(x=> x.reportSection.description == 'Functional Records').length > 0)) {
      const includeFaRecords = this.functionalAnalysisOptions.includeFaRecords;
      this.selectedFaCheckboxes.push(includeFaRecords);
    }

  }
  sectionExist(reportSectionId: number): boolean {
    if(this.selectedReport && this.selectedReport.reportSection && this.selectedReport.reportSection.find((x) => x.reportSectionId === reportSectionId)){
      return true;
    }else{
      return false;
    }
  }
  showRecordSelectionSection() {
    const includeFARecords = this.functionalAnalysisOptions.includeFaRecords;
    return this.selectedFaCheckboxes.includes(includeFARecords) && !this.isJobEntity();
  }
  showRecordGraphSection() {
    const includeFaGraphs = this.functionalAnalysisOptions.includeFaGraphs;
    return this.selectedFaCheckboxes.includes(includeFaGraphs);
  }
  showDatePickers() {
    const betweenOption = this.recordSelectionOptions.between;
    return this.selectedRecordSelection === betweenOption;
  }
  showTaskDetailsCustomList() {
    return this.selectedTaskDetails.toLowerCase() === "custom";
  }
  showTaskSort(): boolean {
    var isStandardSelected = this.selectedReport && this.selectedReport.name.indexOf("Standard Job Report") > -1;
    if (this.type == EReportType.Job.toLowerCase() && isStandardSelected) {
      return true;
    }
    return false;
  }
  prePopulateSelections() {
    const includeFaRecords = this.functionalAnalysisOptions.includeFaRecords;
    this.selectedFaCheckboxes.push(includeFaRecords);
    const includeFaqPage = this.generalOptions.includeFaqPage;
    this.selectedGeneralCheckboxes.push(includeFaqPage);

    switch (this.type) {
      case EReportType.Job.toLowerCase():
      {
        const includeImageAttachments = this.generalOptions.includeImageAttachments;
        this.selectedGeneralCheckboxes.push(includeImageAttachments);
        const sortByName = this.sortType.name;
        this.selectedSortType = sortByName;
        break;
      }
      case EReportType.Task.toLowerCase():
      {
        const includeImageAttachments = this.generalOptions.includeImageAttachments;
        this.selectedGeneralCheckboxes.push(includeImageAttachments);
        const currentRecordCollection = this.recordSelectionOptions.current;
        this.selectedRecordSelection = currentRecordCollection;
        break;
      }
      case EReportType.Worker.toLowerCase():
      {
        const currentRecordCollection = this.recordSelectionOptions.current;
        this.selectedRecordSelection = currentRecordCollection;
        break;
      }
      case EReportType.JobFit.toLowerCase():
      {
        const includeAddress = this.generalOptions.includeAddress;
        this.selectedGeneralCheckboxes.push(includeAddress);
        const noTaskDetails = this.taskDetailsOptions.find(x => x.label === "None")?.value ?? "None";
        this.selectedTaskDetails = noTaskDetails;
        const currentRecordCollection = this.recordSelectionOptions.current;
        this.selectedRecordSelection = currentRecordCollection;
        break;
      }
    }
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
  getReportPerType(type: string) {
    switch (type) {
      case EReportType.Job.toLowerCase():
      {
        this.store.dispatch(new SetSideMenu(this.jobService?.menuList));
        this.getReports(EReportType.Job);
        break;
      }
      case EReportType.Task.toLowerCase():
      {
        this.store.dispatch(new SetSideMenu(this.taskService?.menuList));
        this.getReports(EReportType.Task);
        break;
      }
      case EReportType.Worker.toLowerCase():
      {
        this.store.dispatch(new SetSideMenu(this.workerService?.menuList));
        this.getReports(EReportType.Worker);
        break;
      }
      case EReportType.JobFit.toLowerCase():
      {
        this.store.dispatch(new SetSideMenu(this.jobfitService?.menuList));
        this.getReports(EReportType.JobFit);
        break;
      }
    }
  }
  isJobEntity() {
    return this.type === EReportType.Job.toLowerCase();
  }
  isJobFitEntity() {
    return this.type === EReportType.JobFit.toLowerCase();
  }
  isJobFitReportType() {
    const jobfitReportTypeId = 6;
    return this.selectedReport.id === jobfitReportTypeId;
  }
  isWorkerFunctionalCapabilitiesForm() {
    const wfcFormReportTypeId = 9;
    const wfcFormNoFaReportTypeId = 10;
    return this.selectedReport.id === wfcFormReportTypeId || this.selectedReport.id === wfcFormNoFaReportTypeId;
  }
}
