import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { JobsService } from 'src/app/jobs/jobs.service';
import { DeptTree } from 'src/app/shared/models/department.model';
import { Employment, EmploymentJob, EmploymentResultView, EmploymentSearchCriteria, JobFitResultView, JobFitScoreView, Roster } from 'src/app/shared/models/employment.model';
import { JobsSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { Worker } from 'src/app/shared/models/worker.model';
import { FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { WorkersService } from '../workers.service';
import * as _ from 'lodash';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import * as moment from 'moment';
import { MenuItem, TreeNode } from 'primeng/api';
import { QuickSearch } from 'src/app/shared/models/quicksearch.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
export class RosterLabel {
  label:string = '';
  id: number = 0;
}

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.css']
})
export class EmploymentComponent implements OnInit {
  employmentBox:boolean = false;
  employments: Employment[] = [];
  editMode = false;
  historyEmployments: Employment[] = [];
  futureEmployments: Employment[] = [];
  jobList: EmploymentJob[]=[];
  empLoaded = true;
  result = [{name:'none' , id:1}];
  jobFitScore = [{name:'none' , id:1},
  {name:'1' , id:2},
  {name:'2' , id:3},
  {name:'3' , id:4},
  {name:'4' , id:5},
  {name:'pending' , id:6}];
  worker: Worker = new Worker();
  selectedDeptNumbs: number[] = [];
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  employee: Employment = new Employment();
  deptTree: DeptTree[] = [];
  total: number = 0;
  addEmp = false;
  employmentsTotal = 0;
  futureEmploymentsTotal = 0;
  historyEmploymentsTotal = 0;
  allDeptTree: DeptTree[] = [];
  jobFitResults: JobFitResultView[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  jobFitScores: JobFitScoreView[] = [];
  addEditEmp:boolean = false;
  selectedJobId: number = 0;
  rowOptions = [10,20,30];
  first:number = 0;
  currentPage:number = 0;
  roster:Roster[] = [];
  type =  [{name:'Employment' , id:1} , {name:'Pre-Employment', id:2}];
  errorMessage = '';
  displayError = false;
  totalCount = 10;
  rowCount = 10;
  employmentResult:EmploymentResultView = new EmploymentResultView();
  selectedDeptTree: DeptTree[] = [];
  isLoading: boolean = false;
  quickSearch:QuickSearch = new QuickSearch();
  showArchiveEmployment: boolean = false;
  workerId: number = 0;
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  nodeFoundCount: number = 0;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(private store: Store<JobFitAppState>,
    private workerService: WorkersService,
    private router: Router,
    private route: ActivatedRoute,
    private jobsService: JobsService,
    private translateService: TranslateService,) {
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.route.params.subscribe((params: Params) => {
        if (params?.workerId) {
          this.workerId = params?.workerId;
          this.workerService.setMenu(params?.workerId);
          this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
          if (Object.keys(this.authorisedFunctionList.Function).length > 0){
            if (this.authorisedFunctionList.Function[EFunctions.ViewEmployments] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
              this.getTotalCount(params?.workerId);
              this.getAllJobs();
              this.getJobFitResults();
              this.getJobFitScores();
              this.getWDetails(params?.workerId);
             
            } else {
              this.empLoaded = true;
              this.store.dispatch(new SetError({
                errorMessages: [ACCESS_DENIED_MESSAGE],
                title: ACCESS_DENIED_TITLE}));
            }
            if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
              this.store.dispatch(new ShowSideMenu(true));
              this.store.dispatch(new SetSideMenu(this.workerService?.menuList));
            }
          }
        }
      });
    
  }

  ngOnInit(): void {
  }
  goToReport(){
    if(this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      this.router.navigate([`../reports/worker/${this.workerId}`]);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }

  }
  showArchive() {
    if(this.authorisedFunctionList.Function[EFunctions.DeleteEmployment]) {
      this.showArchiveEmployment = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
  }
  getWDetails(workerId:number){
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(result => {
      if (result) {
        this.worker = _.cloneDeep(result);
        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Workers', url: 'workers'},
          {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
          {label:'Employment'},
        ];

        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      }
    });
  }
  goToJobFit(jobId:number , workerId:number){
    if(this.authorisedFunctionList.Function[EFunctions.ViewJobFit]) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["job-fitting/summary/" + workerId + "/" + jobId])
      );
      window.open(url);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
  }

  goToJobsDetails(employee:Employment) {
    if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
      var id = employee?.job?.originalRevisionId ?? employee?.job?.id
      if (id > 0) {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['../jobs/jobs-details/' + id])
        );
        window.open(url);
      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getPagedEmployees(this.worker?.workerId, e.page + 1 , this.rowCount);
  }
  setJobScore(e:any){
    this.employee.jobFitSummaryScore.jobId = this.selectedJobId;
    this.employee.jobFitSummaryScore.workerId = this.worker.workerId;
    this.employee.jobFitSummaryScore.jobFitScoreId = e.value.value;
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
  addNewEmployees(){
    if (this.authorisedFunctionList.Function[EFunctions.AddEmployment]) {
      this.selectedDeptTree = [];
      this.employee = new Employment();
      this.employee.employmentTypeId = 1;
      this.addEditEmp = true;
      this.editMode = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
}

  getRoster(deptId:number){
    this.workerService.getRosterForOrgEntityTree(deptId).subscribe(response => {
      if(response){
        this.roster = response;
      }
    });
  }

  viewEditEmployment(id:number){
    let indx = this.employmentResult.employments.findIndex((x) => x.id === id);

    if(indx > -1){
      var employee = this.employmentResult.employments[indx];
      this.employee = new Employment();
      this.employee = _.cloneDeep(employee);
      this.getSelectedDepartments(this.employee.jobId);
      this.employee.startDate = new Date(this.employee.startDate);
      this.employee.stopDate = this.employee.stopDate != null ? new Date(this.employee.stopDate) : undefined;
      this.addEditEmp = true;
    }

  }
  getJobFitResults(){
    this.workerService.getJobFitResults().subscribe(response => {
      if(response){
        this.jobFitResults = response;
      }
    });
  }
  getJobFitScores(){
    this.workerService.getJobFitScores().subscribe(response => {
      if(response){
        this.jobFitScores = response;
      }
    });
  }
  cancelViewEdit(){
    this.addEditEmp = false;
    this.editMode = false;
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

  expandAll(){
    this.selectedDeptTree.forEach( node => {
        this.expandRecursive(node, true);
    } );
  }
  expandRecursive(node:TreeNode|any, isExpand:boolean){
    node.expanded = isExpand;

    if (this.employee.orgEntityId > 0) {
      node.partialSelected = node?.id == this.employee.orgEntityId ? true: undefined;
      if(node.partialSelected == true) {
        this.nodeFoundCount ++;
      }
    }
    if (node.children){
        node.children.forEach( (childNode:any[]) => {
            this.expandRecursive(childNode, isExpand);
        } );
    }
  }

  getSelectedDept(jobId:number){
    this.jobsService.getSelectedJobsDeptTree(jobId).subscribe(result => {
      this.selectedDeptTree = _.cloneDeep(result);
      this.nodeFoundCount = 0;
      this.expandAll();
      //check if the saved dept is still existing from Job's department, if not let the user save the new dept
      if (this.employee.orgEntityId > 0 && this.nodeFoundCount == 0) {
        this.selectedDeptNumbs = [];
      }
      this.isLoading = false;
    });
  }
  saveEmployment(){
    if (this.employee.startDate == null){
      this.errorMessage = "Start Date is Required";
      this.displayError = true;
    }
    else if (this.employee.stopDate != null && this.employee.startDate > this.employee.stopDate){
      this.errorMessage = "Stop Date must be greater than Start Date";
      this.displayError = true;
    }
    else if (this.employee.jobId == 0){
      this.errorMessage = "A Job is Required to be Selected";
      this.displayError = true;
    }
    else if (this.selectedDeptNumbs.length == 0){
      this.errorMessage = "A Department is Required";
      this.displayError = true;
    }
    else if (this.selectedDeptNumbs.length > 1){
      this.errorMessage = "Please select only 1 Department";
      this.displayError = true;
    }
    else{
      this.employee.workerId = this.worker.workerId;
      this.employee.isActive = true;
      this.employee.startDate = new Date(moment(this.employee.startDate).format('YYYY-MM-DD'));
      this.employee.stopDate = this.employee.stopDate != null ? new Date(moment(this.employee.stopDate).format('YYYY-MM-DD')) : undefined;
      if(this.selectedDeptNumbs.length > 0){
        this.employee.orgEntityId = this.selectedDeptNumbs[0];
      }
      this.detailsSaved = false;
      this.jobsService.saveEmployment(this.employee).subscribe(response => {
        if(response){
          this.addEditEmp = false;
          this.editMode = false;
          //  this.getPagedEmployees(this.worker.workerId, this.currentPage , 10);
          this.getTotalCount(this.workerId);
        }
        this.detailsSaved = true;
      });
    }
  }
  editEmployment(){
    if (this.authorisedFunctionList.Function[EFunctions.EditEmployment]) {
        this.editMode = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
          title: ACCESS_DENIED_TITLE}));
    }
  }
  getAllJobs(){
    let s = new JobsSearchCriteria();
    s.pageNumber = 1;
    s.count = 2000;
    s.sortField = 'Name';
    s.quickSearch = this.quickSearch;
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
  setRows(e: any){
    this.rowCount = e.value
    this.getPagedEmployees(this.workerId , this.currentPage , e.value);
  }
  getPagedEmployees(workerId:number , page: number , count:number){
    let criteria = new EmploymentSearchCriteria();
    criteria.pageNumber = page ;
    criteria.count = count;
    criteria.sortField = 'DisplayGroup asc, StartDate';
    criteria.sortDir = 'desc';
    this.currentPage = page;
    this.empLoaded = false;
    this.workerService.getPagedEmploymentsForWorker(workerId, criteria).subscribe((result) => {
        this.employmentResult = result;
        this.historyEmployments = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'History'));
        this.employments = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'Current'));
        this.futureEmployments = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'Future'));

        this.total = result.listCount;
        this.empLoaded = true;

        this.employments.forEach(element => {
          element.startDate = new Date(element.startDate) ;
        });
        this.historyEmployments.forEach(element => {
          element.startDate = new Date(element.startDate) ;
        });
        this.empLoaded = true;
    });
  }
  getTotalCount(workerId:number){
    let criteria = new EmploymentSearchCriteria();
    criteria.pageNumber = 1 ;
    criteria.count = 10000;
    criteria.sortField = 'DisplayGroup asc, StartDate';
    criteria.sortDir = 'desc';
    criteria.departmentId = undefined;
    this.empLoaded = false;
    this.workerService.getPagedEmploymentsForWorker(workerId, criteria).subscribe((result) => {
        this.employmentResult = result;
        this.historyEmployments = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'History'));
        this.employments = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'Current'));
        this.futureEmployments = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'Future'));
        this.empLoaded = true;
        this.totalCount = result.listCount;
    });
  }
  archiveEmployment() {
    this.workerService.archiveEmployment(this.employee.id).subscribe((result:boolean) => {
      this.getPagedEmployees(this.worker.workerId, this.currentPage , 10);
      this.addEditEmp = false;
      this.showArchiveEmployment = false;
      this.editMode = false;

    });
  }
  employ(id:number){
    if (this.authorisedFunctionList.Function[EFunctions.EditEmployment]) {
      let indx = this.employmentResult.employments.findIndex((x) => x.id === id);
      if(indx > -1){
        this.employee = this.employmentResult.employments[indx];
        this.workerService.employWorker(this.employee.originalRevisionId ?? this.employee.id ).subscribe(response => {
          if(response){
            this.getPagedEmployees(this.worker.workerId, this.currentPage , 10);
          }
        });
      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
          title: ACCESS_DENIED_TITLE}));
    }

  }
}
