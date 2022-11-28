import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';
import { JobsService } from 'src/app/jobs/jobs.service';
import { DeptTree } from 'src/app/shared/models/department.model';
import { EmploymentSearchCriteria } from 'src/app/shared/models/employment.model';
import { Jobs } from 'src/app/shared/models/jobs.model';
import { JobsSearchCriteria, SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Task } from 'src/app/shared/models/task.model';
import { FetchFlagTree, FetchGroupTree, FetchSiteTree, ShowSideMenu, SetBreadCrumb } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { FetchFATaskFlagTree, FetchJobFlagTree } from 'src/app/store/jobs-store/jobs.actions';
import { selectBreadCrumb } from 'src/app/store/job-fit.selectors';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { WorkersService } from 'src/app/workers/workers.service';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  DEPARTMENT_TYPE_ID: number = 8;
  entityType: string = "";
  deptList: any;
  selectedDept: DeptTree = new DeptTree();
  selectedElement: any;
  tableItems: any;
  selectedTableItem: any;
  totalCount: number = 0;
  first:number = 0;
  rowCount: number = 10;
  currentPage: number = 1;
  tabSelected: number = 0;
  tabs: any = {
    jobs: 0,
    tasks: 1,
    workers: 2,
  }
  allTasks: Task[] = [];
  showModal: boolean = false;
  modalHeader: string = "";
  jobsList:Jobs[] = [];
  rowOptions = [10,20,30];
  isDeptLoaded: boolean = true;
  isTasksTabLoaded: boolean = true;
  isJobsTabLoaded: boolean = true;
  isWorkersTabLoaded: boolean = true;
  items: MenuItem[] = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'Department Manager'},
  ];
  breadCrumb$ = this.store.pipe(select(selectBreadCrumb));

  constructor(
    private store: Store<JobFitAppState>,
    private jobsStore: Store<JobsAppState>,
    private departmentService: DepartmentService,
    private jobsService: JobsService,
    private tasksService: TasksService,
    private workersService: WorkersService,
    private router: Router,
    private titleService: Title,
    private translateService: TranslateService,
  ) {
    this.store.dispatch(new ShowSideMenu(false));
    this.store.dispatch(new FetchFlagTree());
    this.store.dispatch(new FetchGroupTree());
    this.store.dispatch(new FetchFATaskFlagTree([]));
    this.jobsStore.dispatch(new FetchJobFlagTree());
    this.jobsStore.dispatch(new FetchSiteTree([]));
    this.translateService.setDefaultLang('en');
    this.translateService.use(localStorage.getItem('lang') || 'en');
    this.titleService.setTitle('Departments');
    this.store.dispatch(new SetBreadCrumb(this.items));

    this.getDeptTreeWithJobs();
  }

  ngOnInit(): void {
  }
  getDeptTreeWithJobs() {
    this.isDeptLoaded = false;
    this.departmentService.getDepartmentsTreeWithJobs().subscribe(result => {
      this.deptList = _.cloneDeep(result);
      this.isDeptLoaded = true;
    })
  }
  onTreeNodeSelect(e: any) {
    this.resetPaging();
    this.selectedElement = e;
    const node = e.node;
    if (node.typeId !== this.DEPARTMENT_TYPE_ID && this.tabSelected === this.tabs.jobs) {
      this.tabSelected = this.tabs.tasks;
    }
    if (this.selectedDept.id == -1 && node.typeId == this.DEPARTMENT_TYPE_ID && this.tabSelected !== this.tabs.jobs) {
      this.tabSelected = this.tabs.jobs;
    }

    this.changeContents(node);

  }

  onTabSelect(e: any) {
    this.resetPaging();
    const index = e.index;
    this.tabSelected = index;
    this.changeContents(this.selectedDept);
  }

  onSaveJobs(jobs: Jobs[]) {
    var deptChildren = this.selectedDept.children.filter(x=> x.typeId == this.DEPARTMENT_TYPE_ID);
    var jobChildren: DeptTree[] = [];
    if (this.selectedDept && jobs.length > 0) {
      var unassignedJobs: Jobs[] = [];
      jobs = jobs.sort((a: any, b: any) => a.name > b.name ? 1: -1);
      jobs.forEach(job=> {
        var index = jobChildren.findIndex(x=> x.id == (job?.originalRevisionId ?? job?.id));
        if (index == -1) {
          var node: DeptTree = new DeptTree();
          node.id = job.originalRevisionId ?? job.id;
          node.label = job.name;
          node.children = [];
          node.selectable = true;
          jobChildren.push(node);
        }
        if (job.departments.length == 0) {
          unassignedJobs.push(job);
        }
      });
      this.selectedDept.children = [];
      this.selectedDept.children = jobChildren.concat(deptChildren);
      //remove from unassigned jobs
      if (unassignedJobs.length > 0) {
        var unassignedNodeIndex = this.deptList.findIndex((x: DeptTree)=> x.id == -1);
        if (unassignedNodeIndex > -1 && this.deptList[unassignedNodeIndex].children.length > 0) {
          //index of unassigned node
          unassignedJobs.forEach((job) => {
            var index = this.deptList[unassignedNodeIndex].children.findIndex((x:DeptTree)=> x.id == (job?.originalRevisionId ?? job?.id));
            if (index != -1) {
              this.deptList[unassignedNodeIndex].children.splice(index, 1);
            }
          });
        }
      }
    }
    this.resetPaging();
    this.changeContents(this.selectedDept);
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.changeContents(this.selectedDept);
  }
  setRows(e: any){
    this.resetPaging();
    this.rowCount = e.value;
    this.changeContents(this.selectedDept);
  }

  changeContents(node: any) {
    this.tableItems = [];
    this.selectedDept = node;
    if (node.typeId === this.DEPARTMENT_TYPE_ID) {
      if (this.tabSelected === this.tabs.jobs) {
        this.showDepartmentJobs(node.id);
      } else if (this.tabSelected === this.tabs.tasks) {
        this.showAllTasksInDepartment(node.id);
      } else if (this.tabSelected === this.tabs.workers) {
        this.showAllWorkersInDepartment(node.id);
      }
    } else if (this.tabSelected === this.tabs.tasks) {
      this.showAssociatedTasksForJob(node.id);
    } else if (this.tabSelected === this.tabs.workers) {
      this.showAssociatedWorkersForJob(node.id, node.parentId);
    }
  }

  onRowClick(entityType: string, row: any) {
    let url;
    switch (entityType) {
      case "job":
        url = this.router.serializeUrl(
          this.router.createUrlTree(['../jobs/jobs-details/' + (row.originalRevisionId ?? row.id)])
        );
        window.open(url);
        break;
      case "task":
        var id = row?.task?.originalRevisionId ?? row?.task?.id;
        url = this.router.serializeUrl(
          this.router.createUrlTree(['../tasks/tasks-details/' + id])
        );
        window.open(url);
        break;
      case "worker":
        var id = this.selectedDept.typeId === this.DEPARTMENT_TYPE_ID ? (row?.originalRevisionID ?? row?.workerId) : (row?.worker?.originalRevisionID ?? row?.worker?.workerId);
        url = this.router.serializeUrl(
          this.router.createUrlTree(['../workers/workers-details/' + id])
        );
        window.open(url);
        break;
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
  showDepartmentJobs(deptId: number) {
    this.isJobsTabLoaded = false;
    let searchCriteria = new JobsSearchCriteria();
    searchCriteria.pageNumber = this.currentPage;
    searchCriteria.count = this.rowCount;
    searchCriteria.sortField = 'Name';

    this.jobsService.getPagedJobsForOrg(deptId, searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.jobs);
      for (const job of results) {
        const jobIdExistsInTable = this.tableItems.find((x: any) => x.id === job.id);
        if (!jobIdExistsInTable) {
          this.tableItems.push(job);
        }
      }
      this.totalCount = result.listCount;
      this.isJobsTabLoaded = true;
    })
  }
  showAllTasksInDepartment(deptId: number) {
    this.isTasksTabLoaded = false;
    let searchCriteria = new SearchCriteria();
    searchCriteria.pageNumber = this.currentPage;
    searchCriteria.count = this.rowCount;
    searchCriteria.sortField = 'Task.Name';
    searchCriteria.sortDir = "asc";
    this.tasksService.getPagedTaskSetsForJobDepartment(deptId, searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.jobs);
      for (const task of results) {
        const taskIdExistsInTable = this.tableItems.find((x: any) => x.taskId === task.task.id);
        if (!taskIdExistsInTable) {
          this.tableItems.push(task);
        }

      }
      this.totalCount = result.listCount;
      this.isTasksTabLoaded = true;
    })
  }
  showAssociatedTasksForJob(jobId: number) {
    this.isTasksTabLoaded = false;
    let searchCriteria = new SearchCriteria();
    searchCriteria.pageNumber = this.currentPage;
    searchCriteria.count = this.rowCount;
    searchCriteria.sortField = 'Task.Name';
    searchCriteria.sortDir = "asc";

    this.tasksService.getPagedTaskSetsForJob(jobId, searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.jobs);
      this.tableItems = [];
      //filter essential
      var essentialTasks = results.filter(x=> x.req?.id == 1).sort((a: any, b: any) => a.task?.name > b.task?.name ? 1: -1);
      for (const task of essentialTasks) {
        let taskIdExistsInTable = this.tableItems.find((x: any) => x.taskId === task.task.id);
        if (!taskIdExistsInTable) {
          this.tableItems.push(task);
        }
      }
      //filter non-essential
      var nonEssentialTasks = results.filter(x=> x.req?.id == 2).sort((a: any, b: any) => a.task?.name > b.task?.name ? 1: -1);
      for (const task of nonEssentialTasks) {
        let taskIdExistsInTable = this.tableItems.find((x: any) => x.taskId === task.task.id);
        if (!taskIdExistsInTable) {
          this.tableItems.push(task);
        }
      }
      this.totalCount = result.listCount;
      this.isTasksTabLoaded = true;
    })
  }
  showAllWorkersInDepartment(deptId: number) {
    this.isWorkersTabLoaded = false;
    let searchCriteria = new EmploymentSearchCriteria();
    searchCriteria.departmentId = deptId;
    searchCriteria.pageNumber = this.currentPage;
    searchCriteria.count = this.rowCount;
    searchCriteria.sortField = 'LastName';
    searchCriteria.sortDir = 'asc';
    this.workersService.GetPagedWorkersEmployedInDepartment(deptId, searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.workers);
      for (const worker of results) {
        const workerIdExistsInTable = this.tableItems.find((x: any) => x.workerId === worker.workerId);
        if (!workerIdExistsInTable) {
          this.tableItems.push(worker);
        }
      }
      this.totalCount = result.listCount;
      this.isWorkersTabLoaded = true;
    });
  }
  showAssociatedWorkersForJob(jobId: number, deptId: number) {
    this.isWorkersTabLoaded = false;
    let searchCriteria = new EmploymentSearchCriteria();
    searchCriteria.pageNumber = this.currentPage;
    searchCriteria.count = this.rowCount;
    searchCriteria.sortField = 'LastName';
    searchCriteria.sortDir = "asc";
    searchCriteria.departmentId = deptId;
    this.workersService.getAllEmploymentsForJobs(jobId, searchCriteria).subscribe(result => {
      const results = _.cloneDeep(result.employments);
      for (const emp of results) {

        const workerIdExistsInTable = this.tableItems.find((x: any) => x.workerId === emp.workerId && x.employmentTypeId === emp.employmentTypeId);
        if (!workerIdExistsInTable) {
          this.tableItems.push(emp);
        }
      }
      this.totalCount = result.listCount;
       this.isWorkersTabLoaded = true;
    });
  }
  onAdd(entityType: string, buttonHeader: string) {
    this.entityType = entityType;
    this.modalHeader = buttonHeader;
    this.showModal = true;
  }
  resetPaging() {
    this.first = 0;
    this.currentPage = 1;
    this.rowCount = 10;
  }
  refreshTableAfterSave() {
    this.resetPaging();
    const jobId = this.selectedDept.id;
    const deptId = Number(this.selectedDept.parentId);

    switch (this.entityType) {
      case "task":
        this.showAssociatedTasksForJob(jobId);
        break;
      case "worker":
        this.showAssociatedWorkersForJob(jobId, deptId);
        break;
      case "job":
        this.getDeptTreeWithJobs();
        break;
    }
  }
  refreshGrid() {
    this.onTreeNodeSelect(this.selectedElement);
  }

}
