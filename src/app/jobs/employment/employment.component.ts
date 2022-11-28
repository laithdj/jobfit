import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { DeptTree } from 'src/app/shared/models/department.model';
import { Employment, EmploymentSearchCriteria, JobFitResultView, JobFitScoreView } from 'src/app/shared/models/employment.model';
import { JobPosition, JobsDetails } from 'src/app/shared/models/jobs.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchDeptTree, FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { selectDeptTree, selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { WorkersService } from 'src/app/workers/workers.service';
import { JobsService } from '../jobs.service';

export class BreadCrumbItem{
  label: string = '';
}
export class JobFitScore{
  id: number = 0;
  label: string = '';
}
@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.css']
})
export class EmploymentComponent implements OnInit {
  items:BreadCrumbItem[] = [];
  deptTree: DeptTree[] = [];
  employees:Employment[] = [];
  jobPosition: JobPosition = new JobPosition();
  empType:number = 1;
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  deptTree$ = this.store.pipe(select(selectDeptTree));
  selectedDept: boolean = false;
  jobDetails: JobsDetails = new JobsDetails();
  editPosition: boolean = false;
  selectedDeptTree: DeptTree[] = [];
  dept: DeptTree = new DeptTree;
  department: DeptTree[] = [];
  employmentSearchCriteria: EmploymentSearchCriteria = new EmploymentSearchCriteria();
  selectedDeptNumbs: number[] = [];
  deptSelected: boolean = false;
  deptChecked = false;
  assignDept: boolean = false;
  preEmploymentChecked: boolean = false;
  jobFitScoreChecked:boolean = false;
  empLoaded = false;
  employmentType = [{label:'Employment' , id:1} , {label:'Pre-Employment' , id:2}];
  jobId: number = 0;
  breadCrumbs: MenuItem[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  detailsloaded: boolean = true;
  isLoaded: boolean = true;
  selectedDepartments: DeptTree[] = [];
  errorMessage = '';
  displayError = false;
  jobFitResults: JobFitResultView[] = [];
  jobFitScores: JobFitScoreView[] = [];
  constructor(
    private store: Store<JobFitAppState>,
    private jobsService: JobsService,
    private workerService: WorkersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params: Params) => {
      this.jobId = params.jobId;
      this.jobsService.setMenu(params.jobId);
      this.getJob(this.jobId);
      this.getJobFitResults();
      this.getJobFitScores();
    });
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));

  }
  ngOnInit(): void {
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
  goToReport(){
    this.router.navigate([`./reports/job/${this.jobId}`]);
  }
  goToWorkersDetails(employee:Employment) {
    this.workerService.setMenu(employee.workerId);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['../workers/workers-details/' + employee.workerId])
    );
    window.open(url);
  }
  getJob(jobId: number) {
    this.store.dispatch(new FetchJobDetails(jobId));
    this.jobDetails$.subscribe(result => {
      this.jobDetails = result;
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Jobs', url: 'jobs'},
        {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobId}` },
        {label:'Pre/Employment'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.jobDetails.departments.forEach(element => {
        this.selectedDeptNumbs.push(element.id);
      });
    });
  }
  changeType(){
    this.selectedDept = false;
    this.deptSelected = false;
    this.items = [];
    if(this.empType === 2){
      this.employmentSearchCriteria.useForPreEmployment = true;
    } else {
      this.employmentSearchCriteria.useForPreEmployment = false;
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
  saveDeptTree(){
    if (this.selectedDepartments.length == 0 || this.selectedDepartments.length > 1) {
      this.errorMessage = "Please select 1 Department";
      this.displayError = true;
    } else {
      this.detailsloaded = false;
      this.selectedDept = true;
      this.dept = this.selectedDepartments[0];
      this.deptChecked = true;

      this.items = [];
      this.deptSelected = true;
      this.assignDept = false;
      this.department = _.cloneDeep(this.selectedDeptTree);

      if(this.selectedDept){
        this.getSelectedDeptForEmployment(this.dept?.id);
        this.getEmploymentsList();
      }
      this.selectedDepartments = [];
      this.deptChecked = false;
      this.detailsloaded = true;
    }

  }

  getEmploymentsList(){
    this.employmentSearchCriteria.count = 20;
    this.employmentSearchCriteria.departmentId = this.dept?.id;
    this.employmentSearchCriteria.pageNumber = 1;
    this.employmentSearchCriteria.sortField = 'StartDate';
    this.isLoaded = false;
    this.jobsService.getJobsEmployment(this.jobId , this.employmentSearchCriteria).subscribe(result => {
      this.employees = result.employments;
      this.isLoaded = true;
    });

  }
  getSelectedDeptForEmployment(deptid: number) {
    this.detailsloaded = false;
    this.jobsService.getSelectedJobDeptTreeForDepartment(deptid).subscribe(result => {
      this.selectedDeptTree = _.cloneDeep(result);
      this.department = _.cloneDeep(result);
      this.getBreadCrumb(this.department);
       this.detailsloaded = true;
    });
  }
  getDeptTree() {
    this.detailsloaded = false;
    this.jobsService.getSelectedJobsDeptTree(this.jobId).subscribe(result => {
      this.deptTree = _.cloneDeep(result);
      this.detailsloaded = true;
    });
  }
  savePositionDetails(){
    this.jobsService.updateJobPosition(this.jobPosition).subscribe(result => {
      this.editPosition = false;
    });
  }
  selectedDeptChange(e: any, dept:DeptTree) {
    this.selectedDept = e?.checked;
    this.dept = dept;
    this.deptChecked = e?.checked;
    if (e?.checked == true && this.selectedDepartments.filter(x=> x.id == dept.id).length == 0) {
      this.selectedDepartments.push(dept);
    } else {
      const idx = this.selectedDepartments.findIndex((x) => x.id === dept.id);
      this.selectedDepartments.splice(idx, 1);
    }
  }
  getSelectedHeadings(tree:DeptTree[], selectedIds:number[]){
    let ids = selectedIds;
    tree.forEach(element => {
      if(element.typeId !== 8){
        element.children = element.children.filter((item) => (ids.indexOf(item.id) > -1) || (item.typeId != 8));
      }
      this.getSelectedHeadings(element.children , selectedIds);
    });
    this.department = tree;
    }


  getBreadCrumb(deptTree: DeptTree[]){
    deptTree.forEach(element => {
      this.items.push({label: element.label});
      this.getBreadCrumb(element.children);
    });
  }
  openDepartment(){
    this.getDeptTree();
    this.assignDept = true;
  }
  goToJobFit(jobId:number , workerId:number){
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["job-fitting/summary/" + workerId + "/" + jobId])
    );
    window.open(url);

  }
  changeToPlainText(text:string):string {
    let newText = text?.replace(/<[^>]+>/g, '');
    newText = newText?.replace(/\r?\n|\r/g, "");
    return newText;
  }
}
