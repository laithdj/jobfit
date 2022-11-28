import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { SetSideMenu, ShowSideMenu, SetBreadCrumb } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { FetchAssociatedTasks, FetchJobDetails, FetchJobFlagTree, FetchJobGroupTree } from 'src/app/store/jobs-store/jobs.actions';
import { selectAssociatedTasks, selectJobDetails, selectJobFlagTree, selectJobGroupTree } from 'src/app/store/jobs-store/jobs.selectors';
import { BatchCopyOptions, Jobs, JobsDetails, SupplementaryEntity } from 'src/app/shared/models/jobs.model';
import { JobsService } from '../jobs.service';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { selectGroupTree } from 'src/app/store/job-fit.selectors';
import { AssociatedTask } from 'src/app/shared/models/associatedtasks.model';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { MenuItem } from 'primeng/api';
import { DeptTree } from 'src/app/shared/models/department.model';
import { Title } from '@angular/platform-browser';
import { Attachments } from 'src/app/shared/models/attachments.model';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { AttachmentSearchCriteria } from 'src/app/shared/models/attachment.result.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-jobs-details',
  templateUrl: './jobs-details.component.html',
  styleUrls: ['./jobs-details.component.css']
})
export class JobsDetailsComponent implements OnInit {
  jobId: any;
  jobLastUpdate = '';
  editJobBox = false;
  groupTree$ = this.store.pipe(select(selectJobGroupTree));
  groupTree: GroupsTree[] = [];
  groupTaskTree: GroupsTree[] = [];
  flagTaskTree: FlagsTree[] = [];
  associatedTasks$ = this.store.pipe(select(selectAssociatedTasks));
  associatedTask : AssociatedTask = new AssociatedTask();
  selectedGroupTree: GroupsTree[] = [];
  selectedFlagOption: string = '';
  batchCopyOptions: BatchCopyOptions = new BatchCopyOptions();
  selectLinkTo: boolean = false;
  overviewImage: Attachments = new Attachments();
  selectLinkTask: boolean = false;
  copyJobsBox = false;
  selectedGroups: GroupsTree[] = [];
  selectedTaskGroups: GroupsTree[] = [];
  flagTree: FlagsTree[] = [];
  activeIndex: number = 0;
  jobDetailsLoaded = false;
  showThumbnails: boolean = true;
  selectedFlagTree: FlagsTree[] = [];
  selectedGroupOption: string = '1';
  selectedTaskGroupOption = '1';
  jobFlagTree$ = this.store.pipe(select(selectJobFlagTree));
  jobGroupTree$ = this.store.pipe(select(selectGroupTree));
  gallery: Attachments[] = [];
  selectedFlags: FlagsTree[] = [];
  selectedTaskFlags: FlagsTree[] = [];
  attachments: Attachments[] = [];
  selectedGroupNumbs: number[] = [];
  imageAttachmentIdSet: number[] = [];
  attachmentCriteria:AttachmentSearchCriteria = new AttachmentSearchCriteria();
  selectedFlagNumbs: number[] = [];
  breadCrumbs: MenuItem[] = [];
  selectedTaskFlagOption = '';
  imageLoaded = false;
  selectedOptions:any;
  copyBox = false;
  selectedOptionsTask:any;
  includeList = [{id:0 , value: 'Associated Tasks'} , {id:1 , value:'Notes'} , {id:2, value: 'Flags'},
  {id:3 , value:'Groups'}, {id:4, value: 'Attachments'} , {id:5 , value: 'Health & Hygiene'}];

  includeListTask = [{id:1 , value:'Notes'} , {id:2, value: 'Flags'},
  {id:3 , value:'Groups'}, {id:4 , value: 'Attachments'} , {id:5 , value: 'Health & Hygiene'},
  {id:6 , value: 'Functional Analysis Records'} , {id:7 , value: 'Human Factors'}, {id:8 , value: 'Environmental Factors'},
  {id:9 , value: 'Personal Protective Equipment'}]
  job:Jobs = new Jobs();
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  jobsDetails: JobsDetails = new JobsDetails();
  deptTree: DeptTree[] = [];
  selectedDeptNumbs: number[] = [];
  selectedDeptTree: DeptTree[] = [];
  editJob: Jobs = new Jobs();
  isLoading: boolean = false;
  job$ = this.store.pipe(select(selectJobDetails));
  detailsSaved: boolean = true;
  showArchiveJob: boolean = false;
  isArchiving: boolean = false;
  displayInfo: boolean = false;
  infoMessage: string = "";
  errorMessage = '';
  displayError = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(private router: Router,
    private translateService: TranslateService,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private titleService: Title,
    private jobService: JobsService,
    ) {
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.route.params.subscribe((params: Params) => {
        this.jobId = params?.jobId;

        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (Object.keys(this.authorisedFunctionList.Function).length > 0){
          if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
            this.getJobDetails(params?.jobId);
            this.getJob(params?.jobId);
            this.getFlagsTree();
            this.getGroupsTree();
            this.getJobFlagsTree();
            this.getJobGroupsTree();
            this.jobService.setMenu(params?.jobId);
            this.getAttachmentsOverview(params.jobId, 1 , 10);
            this.getSelectedFlagsTree();
            this.getSelectedGroupTree();
            this.getAssociatedTasks(this.jobId , 1 , 10);
            this.store.dispatch(new ShowSideMenu(true));
            this.store.dispatch(new SetSideMenu(this.jobService?.menuList));
          } else {
            this.jobDetailsLoaded= true;
            this.imageLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }
    });
  }
  ngOnInit(): void {
  }
  copyJob() {
    if (this.authorisedFunctionList.Function[EFunctions.CopyJobs]) {
      this.copyBox = true
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  showArchive() {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteJob]) {
      this.showArchiveJob = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
    
  }
  archive(){
    this.isArchiving = true;
    this.jobService.archiveJob(this.jobId).subscribe(result => {
      this.showArchiveJob = false;
      this.isArchiving = false;
      this.displayInfo = true;
      this.infoMessage = "The Job has been archived";
    });
  }
  navigateToJobList() {
    this.router.navigate([`../jobs`]);
  }
  getDeptTree() {
    this.isLoading = true;
    this.jobService.getDeptTreeForJob(this.jobId).subscribe((result:any) => {
      this.deptTree = _.cloneDeep(result);
      if (this.selectedDeptNumbs.length > 0) {
        this.getSelectedDept();
      }
      this.isLoading = false;
    });
  }

  getSelectedDept(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewDepartments] || this.authorisedFunctionList.Function[EFunctions.EditJob]) {
      this.jobService.getSelectedJobsDeptTree(this.jobId).subscribe(result => {
        this.selectedDeptTree =_.cloneDeep(result);
      });
    }
  }
  getAttachmentsOverview(taskId:number, page:number , count:number){
    if (this.authorisedFunctionList.Function[EFunctions.ViewAttachments]) {
      this.attachmentCriteria.pageNumber= page;
      this.attachmentCriteria.count= count;
      this.attachmentCriteria.type= "Jobs";
      this.attachmentCriteria.sortField= "EntryDate";
      this.tasksService.getAttachmentsOverview(taskId,this.attachmentCriteria).subscribe(result => {
        if(result){
          this.gallery = result.attachments;
          let reportableList = _.cloneDeep(this.gallery).filter((x) => x.isReportable);
          if(reportableList.length > 0){
            this.overviewImage = reportableList[0];
          }
          this.imageLoaded = true;
        }
      });
    } else {
      this.imageLoaded = true;
    }
    
  }
  saveDeptTree(){
    var deptIds: number[] = [];
    if(this.selectedDeptNumbs.length > 0){
      this.selectedDeptNumbs.forEach((id:number) => {
        deptIds.push(id);
      });
    }
    this.jobService.saveDepartmentsTree(this.jobId , deptIds).subscribe(result => {
      this.getJob(this.jobId);
      this.getJobDetails(this.jobId);
      this.detailsSaved = true;
      this.editJobBox = false;
    });

  }
  getJob(taskId: number){
    this.jobService.getJob(taskId).subscribe((result:any) => {
      this.job = result;
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Jobs', url: 'jobs'},
        {label:result.name}
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.titleService.setTitle(result.name);

    });
  }
  getAssociatedTasks(jobId:number , pageNumber: number , count: number){
    if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
      let sc = new SearchCriteria();
      sc.pageNumber = pageNumber;
      sc.count = count;
      sc.sortField = 'Task.Name';
      this.store.dispatch(new FetchAssociatedTasks({jobId: jobId,searchCriteria: sc}));
      this.associatedTasks$.subscribe(result => {
        this.associatedTask = _.cloneDeep(result);
      });
    }
  }
  getJobFlagsTree(){
    this.store.dispatch(new FetchJobFlagTree());
    this.jobFlagTree$.subscribe(result => {
      this.flagTaskTree = _.cloneDeep(result);
    });
  }
  getJobGroupsTree(){
    this.store.dispatch(new FetchJobGroupTree([]));
    this.jobGroupTree$.subscribe(result => {
      this.groupTaskTree = _.cloneDeep(result);
    });
  }
  getGroupsTree() {
      this.store.dispatch(new FetchJobGroupTree([]));
      this.groupTree$.subscribe(result => {
        this.groupTree = _.cloneDeep(result);
      });
  }
  getSelectedGroupTree() {
    if (this.authorisedFunctionList.Function[EFunctions.AssignGroups] || this.authorisedFunctionList.Function[EFunctions.ViewGroups]) {
      this.jobService.getSelectedJobGroups(this.jobId).subscribe(result => {
        this.selectedGroupTree = _.cloneDeep(result);
      });
    }
  }
  getJobDetails(jobId:number) {
    this.jobDetailsLoaded = false;
    this.store.dispatch(new FetchJobDetails(jobId));
    this.jobDetails$.subscribe(result => {
      this.jobsDetails = _.cloneDeep(result);
      this.jobLastUpdate = moment(result.lastUpdate).format('DD-MMM-YYYY');
      if (this.jobsDetails.departments.length > 0) {
        this.jobsDetails.departments.forEach(element => {
          this.selectedDeptNumbs.push(element.id);
        });
        this.getDeptTree();
      }
      result.flags.forEach(element => {
        this.selectedFlagNumbs.push(element.id);
      });
      result.groups.forEach(element => {
        this.selectedGroupNumbs.push(element.id);
      });
      this.jobDetailsLoaded = true;
    });
  }
  goToReport(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewReports] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
      this.router.navigate([`./reports/job/${this.jobId}`]);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  
  getFlagsTree() {
    this.store.dispatch(new FetchJobFlagTree());
    this.jobFlagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
    });
  }
  getSelectedFlagsTree() {
    if (this.authorisedFunctionList.Function[EFunctions.AssignFlags] || this.authorisedFunctionList.Function[EFunctions.ViewFlags]) {
      this.jobService.getSelectedJobFlags(this.jobId).subscribe(result => {
        this.selectedFlagTree = _.cloneDeep(result)
      });
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
  saveJob(job: Jobs){
    if (job.name == "") {
      this.errorMessage = "Jobs Name is required";
      this.displayError = true;
    } else if (this.selectedDeptNumbs.length < 1){
      this.errorMessage = "Job should be associated to Department";
      this.displayError = true;
    } else {
      this.detailsSaved = false;
      this.jobService.saveJob(job).subscribe(result => {
        this.saveDeptTree();
      });
    }
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
  copyJobs(){
    this.batchCopyOptions.primaryCopyOptions.copyAssociatedEntities = this.selectLinkTo;
    this.batchCopyOptions.primaryCopyOptions.copyIncludeOptions = this.selectedOptions;
    this.batchCopyOptions.entityIds[0] = this.jobId;

    this.batchCopyOptions.associatedCopyOptions.copyAssociatedEntities = this.selectLinkTask;
    this.batchCopyOptions.associatedCopyOptions.copyIncludeOptions = this.selectedOptionsTask;

    var flagsEntityArray: SupplementaryEntity[] = [];
    var groupsEntityArray: SupplementaryEntity[] = [];

    var flagsEntityArrayTasks: SupplementaryEntity[] = [];
    var groupsEntityArrayTasks: SupplementaryEntity[] = [];

    this.selectedTaskFlags.forEach(element => {
      let entity = new SupplementaryEntity();
      entity.Id = element.id;
      flagsEntityArrayTasks.push(entity);
    });
    this.selectedTaskGroups.forEach(element => {
      let entity = new SupplementaryEntity();
      entity.Id = element.id;
      groupsEntityArrayTasks.push(entity);
    });


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
      this.batchCopyOptions.primaryCopyOptions.groupsToSet = groupsEntityArray;
    } else {
      this.batchCopyOptions.primaryCopyOptions.groupsToRemove = groupsEntityArray;
    }
    if(this.selectedFlagOption === '1'){
      this.batchCopyOptions.primaryCopyOptions.flagsToSet = flagsEntityArray;
    } else {
      this.batchCopyOptions.primaryCopyOptions.flagsToRemove = flagsEntityArray;
    }
    if(this.selectedTaskGroupOption === '1'){
      this.batchCopyOptions.associatedCopyOptions.groupsToSet = groupsEntityArrayTasks;
    } else {
      this.batchCopyOptions.associatedCopyOptions.groupsToRemove = groupsEntityArrayTasks;
    }
    if(this.selectedTaskFlagOption === '1'){
      this.batchCopyOptions.associatedCopyOptions.flagsToSet = flagsEntityArrayTasks;
    } else {
      this.batchCopyOptions.associatedCopyOptions.flagsToRemove = flagsEntityArrayTasks;
    }
    this.jobService.copyJobs(this.batchCopyOptions).subscribe(response => {
      if(response){
        this.copyBox = false;
      }
    });
  }
  editRecord(){
    if (this.authorisedFunctionList.Function[EFunctions.EditJob]) {
      this.editJobBox = true;
      this.editJob = _.cloneDeep(this.job);
      this.getDeptTree() ;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  downloadAttachment(id: number, contentType:string){
    this.gallery.find((x) => x.id === id)
    this.tasksService.getAttachment(id).subscribe(result => {
      let file = new Blob([result], { type: contentType });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }
  changeToPlainText(text:string):string {
    let newText = text?.replace(/<[^>]+>/g, '');
    newText = newText?.replace(/\r?\n|\r/g, "");
    return newText;
  }
}


