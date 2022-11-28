import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem, TreeNode } from 'primeng/api';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectDeptTree, selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  jobsId: number = 0;
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  deptTree$ = this.store.pipe(select(selectDeptTree));
  deptTree: DeptTree[] = [];
  selectedDepartmentNode: DeptTree[] = [];
  jobDetails: JobsDetails = new JobsDetails();
  selectedDeptNumbs: number[] = [];
  assignDept = false;
  selectedDeptTree: DeptTree[] = [];
  deptLoaded = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  breadCrumbs: MenuItem[] = [];
  empLoaded = false;
  deptSaved: boolean = true;
  eFunctions = EFunctions;
  constructor(private jobsService: JobsService,
    private route: ActivatedRoute,
    private store: Store<JobsAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.jobsId = params?.jobId;
        this.jobsService.setMenu(params?.jobId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewDepartments] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
            this.getJob(params?.jobId);

          } else {
            this.empLoaded = true;
            this.deptLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }
      });
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
      this.store.dispatch(new ShowSideMenu(true));
      this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
    }
   }
  ngOnInit(): void {
  }
  goToReport(){
    if(this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      this.router.navigate([`./reports/job/${this.jobsId}`]);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
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
  getJob(jobId: number) {
    this.deptLoaded = false;
    this.jobsService.getJobsDetails(jobId).subscribe(result => {
      this.jobDetails = result;
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Jobs', url: 'jobs'},
        {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobsId}` },
        {label:'Departments'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      if (this.jobDetails) {
        this.selectedDeptNumbs = [];
        this.jobDetails.departments.forEach(element => {
          this.selectedDeptNumbs.push(element.id);
        });
        this.getDeptTree();
      }
    });
  }
  getDeptTree() {
    this.deptLoaded = false;
    this.jobsService.getDeptTreeForJob(this.jobsId).subscribe(result => {
      this.deptTree = _.cloneDeep(result);
      if (this.selectedDeptNumbs.length > 0) {
        this.getSelectedDept();
      } else {
        this.deptLoaded = true;
      }

    });
  }
  getSelectedDept(){
    this.deptLoaded = false;
    this.jobsService.getSelectedJobsDeptTree(this.jobsId).subscribe(result => {
      this.selectedDeptTree =_.cloneDeep(result);
      this.expandAll();
      this.deptLoaded = true;
    });
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

  saveDeptTree(){
    this.deptSaved = false;
    var deptIds: number[] = [];
    if(this.selectedDeptNumbs.length > 0){
      this.selectedDeptNumbs.forEach((id:number) => {
        deptIds.push(id);
      });
    }
    
    this.jobsService.saveDepartmentsTree(this.jobsId , deptIds).subscribe(result => {
      this.deptSaved = true;
      this.assignDept = false;
      this.getDeptTree();
    });

  }
  assignDeptBtn() {
    if (this.authorisedFunctionList.Function[EFunctions.EditDepartments]) {
      this.assignDept = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }

  expandAll(){
    this.selectedDeptTree.forEach( node => {
        this.expandRecursive(node, true);
    } );
  }
  expandRecursive(node:TreeNode|any, isExpand:boolean){
    node.expanded = isExpand;

    if (node.children){
        node.children.forEach( (childNode:any[]) => {
            this.expandRecursive(childNode, isExpand);
        } );
    }
  }

}
