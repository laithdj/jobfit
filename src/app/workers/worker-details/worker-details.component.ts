import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { select, Store } from '@ngrx/store';
import { AssociatedJob } from 'src/app/shared/models/associatedjobs.model';
import { GroupsTree } from 'src/app/shared/models/groups.models';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { Worker } from 'src/app/shared/models/worker.model';
import { WorkersService } from '../workers.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { selectLanguage, selectSideMenu} from 'src/app/store/job-fit.selectors';
import { selectWorkerDetails, selectWorkerFlagTree, selectWorkerGroupTree } from 'src/app/store/workers-store/workers.selectors';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { FetchWorkerDetails  } from 'src/app/store/workers-store/workers.actions';
import { EBiologicalSex, EGender } from 'src/app/shared/models/gender.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { Title } from '@angular/platform-browser';
import { Employment, EmploymentJob, EmploymentSearchCriteria, JobFitResultView, JobFitScoreView, Roster } from 'src/app/shared/models/employment.model';
import { DeptTree } from 'src/app/shared/models/department.model';
import { EmploymentType, JobsSearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { QuickSearch } from 'src/app/shared/models/quicksearch.model';
import { JobsService } from 'src/app/jobs/jobs.service';
import { FetchDeptTree } from 'src/app/store/jobs-store/jobs.actions';
import { Notes } from 'src/app/shared/models/notes.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Attachments } from 'src/app/shared/models/attachments.model';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { AttachmentSearchCriteria } from 'src/app/shared/models/attachment.result.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-worker-details',
  templateUrl: './worker-details.component.html',
  styleUrls: ['./worker-details.component.css']
})
export class WorkerDetailsComponent implements OnInit, OnDestroy {
  workerInformation: MenuItem[] = [];
  val: number = 3;
  workerDOB = '';
  workerAge: number = 0;;
  associatedJob: AssociatedJob = new AssociatedJob();
  doctors$ = this.store.pipe(select(selectLanguage));
  showThumbnails: boolean = true;
  fullscreen: boolean = false;
  imageAttachmentIdSet: number[] = [];
  activeIndex: number = 0;
  onFullScreenListener: any;
  employmentType = [{name:'Select Employment Type' , id:-1}, {name:'Employment' , id:EmploymentType.Employment} , {name:'Pre-Employment' , id:EmploymentType.PreEmployment}];
  images: any[] = [
    {
      "previewImageSrc": "assets/showcase/images/galleria/galleria1.jpg",
      "thumbnailImageSrc": "assets/showcase/images/galleria/galleria1s.jpg",
      "alt": "Description for Image 1",
      "title": "Title 1"
    }
  ];

  worker: Worker = new Worker();
  selectedWorker: Worker = new Worker();
  menuList$ = this.store.pipe(select(selectSideMenu));
  fetchWorkerGroupTree$ = this.store.pipe(select(selectWorkerGroupTree));
  groupTree: GroupsTree[] = [];
  flagTree$ = this.store.pipe(select(selectWorkerFlagTree));
  flagTree: FlagsTree[] = [];
  workerId: any;
  breadCrumbs: MenuItem[] = [];
  workerThings: any;
  attachmentCriteria:AttachmentSearchCriteria = new AttachmentSearchCriteria();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  tasksComponent: any;
  editWorkerBox: boolean = false;
  useHomeAddress: boolean = false;
  gallery: Attachments[] = [];
  dob?: Date;
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
  gender: string = "";
  sex: number = -1;
  genderDisplay: string = "";
  errorMessage = '';
  displayError = false;
  jobList: EmploymentJob[]=[];
  employee: Employment = new Employment();
  latestEmployments: Employment[] = [];
  roster: Roster[] = [];
  jobFitResults: JobFitResultView[] = [];
  jobFitScores: JobFitScoreView[] = [];
  selectedJobId: number = 0;
  workerDetailsLoaded = true;
  selectedDeptTree: DeptTree[] = [];
  selectedDeptTreeNode: TreeNode[] = [];
  isLoading: boolean = false;
  imageLoaded = true;
  selectedDeptNumbs: number[] = [];
  workerNotes: Notes[]=[];
  destroyed$: Subject<boolean> = new Subject<boolean>();
  selectedFlagTree: FlagsTree[] = [];
  selectedGroupTree: GroupsTree[] = [];
  detailsSaved: boolean = true;
  showArchiveWorker:boolean = false;
  displayInfo: boolean = false;
  infoMessage: string = "";
  isArchiving: boolean = false;
  nodeFoundCount: number = 0;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(private router: Router,
    private jobsService: JobsService,
    private store: Store<JobFitAppState>,
    private workerService: WorkersService,
    private route: ActivatedRoute,
    private titleService: Title,
    private tasksService: TasksService,
    private translateService: TranslateService,
    private workersService: WorkersService) {
    this.translateService.setDefaultLang('en');
    this.translateService.use(localStorage.getItem('lang') || 'en');
    this.route.params.subscribe((params: Params) => {
      if (params?.workerId) {
        this.workerId = params?.workerId;
        
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (Object.keys(this.authorisedFunctionList.Function).length > 0){
            if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
              this.workerService.setMenu(params?.workerId);
              this.getWDetails(params?.workerId);
              this.getAllJobs();
              this.getJobFitResults();
              this.getJobFitScores();
              this.store.dispatch(new FetchDeptTree());
              this.getPagedEmployees(this.workerId, 1, 10);
              this.getAttachmentsOverview(params.workerId, 1 , 10);
              this.getSelectedFlagsTree();
              this.getSelectedGroupsTree();
              this.store.dispatch(new ShowSideMenu(true));
              this.store.dispatch(new SetSideMenu(this.workerService?.menuList));
            } else {
              this.imageLoaded = true;
              this.workerDetailsLoaded = true;
              this.store.dispatch(new SetError({
                errorMessages: [ACCESS_DENIED_MESSAGE],
                title: ACCESS_DENIED_TITLE}));
            }
        }
      }
    });
  
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  navigateToWorkerList() {
    this.router.navigate([`../workers`]);
  }
  showArchive() {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteWorker]) {
      this.showArchiveWorker = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  archive(){
    this.isArchiving = true;
    this.workersService.archiveWorker(this.workerId).subscribe(result => {
      this.showArchiveWorker = false;
      this.isArchiving = false;
      this.displayInfo = true;
      this.infoMessage = "The Worker has been archived";
    });
  }
  getSelectedFlagsTree() {
    if (this.authorisedFunctionList.Function[EFunctions.ViewFlags]) {
      this.workerService.getSelectedWorkerFlags(this.workerId).subscribe(result => {
        this.selectedFlagTree = _.cloneDeep(result);
      });
    }
  }
  getSelectedGroupsTree() {
    if (this.authorisedFunctionList.Function[EFunctions.ViewGroups]) {
      this.workerService.getSelectedWorkerGroups(this.workerId).subscribe(result => {
        this.selectedGroupTree = _.cloneDeep(result);
      });
    }
  }
  getRoster(deptId:number){
    this.workersService.getRosterForOrgEntityTree(deptId).subscribe(response => {
      if(response){
        this.roster = response;
      }
    });
  }

  getAttachmentsOverview(taskId:number, page:number , count:number){
    if (this.authorisedFunctionList.Function[EFunctions.ViewAttachments]) {
      this.attachmentCriteria.pageNumber= page;
      this.attachmentCriteria.count= count;
      this.attachmentCriteria.type= "Workers";
      this.attachmentCriteria.sortField= "EntryDate";
      this.tasksService.getAttachmentsOverview(taskId,this.attachmentCriteria).subscribe(result => {
        if(result){
          this.gallery = result.attachments;
          this.imageLoaded = true;
        }
      });
    }
  }
  getAllJobs(){
    let s = new JobsSearchCriteria();
    s.pageNumber = 1;
    s.count = 1000;
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
        node.children.forEach((childNode:any[]) => {
            this.expandRecursive(childNode, isExpand);
        } );
    }
  }
  removeParents(deptTree: DeptTree[]) {
    deptTree.forEach(element => {
      if((element.typeId != 8) && (element.children.length < 1)){
        // remove parent
        const idx = deptTree.findIndex((x) => x.id === element.id);
        deptTree.splice(idx, 1);
        this.removeParents(this.selectedDeptTree);
      } else{
        this.removeParents(element.children);
      }
    });
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
  getPagedEmployees(workerId:number , page: number , count:number){
    //check if authorise for Employment or Edit Worker
    if (this.authorisedFunctionList.Function[EFunctions.ViewEmployments] || this.authorisedFunctionList.Function[EFunctions.EditWorker]) {
      let criteria = new EmploymentSearchCriteria();
      criteria.pageNumber = page ;
      criteria.count = count;
      criteria.sortField = 'DisplayGroup asc, StartDate';
      criteria.sortDir = 'desc';
      this.workerDetailsLoaded = false;
      this.workerService.getPagedEmploymentsForWorker(workerId, criteria).subscribe((result) => {
          this.employee = new Employment();
          this.latestEmployments = [];
          //get latest from current
          var current = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'Current'));
          if (current.length > 0) {
            this.employee = _.cloneDeep(current[0]);
            this.latestEmployments.push(current[0]);
          } else {
            // if current is not existing, get from future
            var future = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'Future'));
            if (future.length > 0) {
              this.employee = _.cloneDeep(future[0]);
              this.latestEmployments.push(future[0]);
            } else {
              //if future not existing, check from history
              var history = _.cloneDeep(result.employments.filter((x) => x.displayGroup === 'History'));
              this.employee = history.length > 0 ? _.cloneDeep(history[0]) : new Employment();
              this.latestEmployments.push(history[0]);
            }
          }
          this.employee.startDate = new Date(this.employee.startDate)
          this.workerDetailsLoaded = true;
      });
    }
    
  }
  getWDetails(workerId:number){
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetailsLoaded = false;
    this.workerDetails$.pipe(takeUntil(this.destroyed$)).subscribe(result => {
      if (result) {
        this.worker = _.cloneDeep(result);
        this.gender = this.worker.gender;
        this.genderDisplay = this.gender != null && this.gender == EGender.PreferNotToSay ? "Prefer not to say": this.gender;
        this.workerDOB = moment(this.worker.dob).format("DD-MMM-YYYY")
        this.workerAge = moment(moment()).diff(this.workerDOB, 'years');
        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Workers', url: 'workers'},
          {label:result.fullName},
        ];
        if(result.fullName.length > 0){
          this.workerDetailsLoaded = true;
        }
        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
        this.titleService.setTitle(result.fullName);
        this.workerNotes = _.cloneDeep(result.notes);
        this.workerNotes = this.workerNotes.sort(
                    (a, b) => new Date(b.entryDateField).getTime() - new Date(a.entryDateField).getTime(),
                  );
      }
      this.workerDetailsLoaded = true;
    });
  }

  ngOnInit(): void {
    this.workerInformation = [
      {"label": "Home Details"},
      {"label": "Mail Details"},
      {"label": "Work Address"}
    ];

  }
  editRecord() {
    if (this.authorisedFunctionList.Function[EFunctions.EditWorker]) {
      this.selectedWorker = _.cloneDeep(this.worker);
      this.dob = new Date(this.worker.dob);
      this.gender = this.selectedWorker.gender;
      this.sex = this.worker.isMale == true? EBiologicalSex.Male : EBiologicalSex.Female;
      this.useHomeAddress = false;
      this.employee = new Employment();
      if (this.latestEmployments.length > 0 && this.latestEmployments[0]) {
        this.employee = _.cloneDeep(this.latestEmployments[0]);
      }
      this.getSelectedDepartments(this.employee.jobId);
      this.employee.startDate = new Date(this.employee.startDate);
      this.employee.stopDate = this.employee.stopDate != null ? new Date(this.employee.stopDate) : undefined;
      this.editWorkerBox = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  setGenderField(e : any){
    var gender = e?.value;
    if (gender != "") {
      this.selectedWorker.gender = gender;
    }
  }
  setBiologicalSexField(e : any){
    var biologicalSex = e?.value;
    if (biologicalSex != -1) {
      this.selectedWorker.isMale = biologicalSex == EBiologicalSex.Male ? true: false;
    }
  }
  goToReport(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      this.router.navigate([`../reports/worker/${this.workerId}`]);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  getGroupsTree(id:number){
    this.fetchWorkerGroupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
    });
  }
  getFlagsTree() {
    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
    });
  }
  saveWorker(worker: Worker){
    if (this.useHomeAddress) {
      worker.mailAddress = worker.homeAddress;
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
    } else if (!(this.dob instanceof Date)) {
        this.errorMessage = "Please enter valid date for Date of Birth";
        this.displayError = true;
    } else if (this.sex == -1) {
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
      worker.workerId = this.workerId;
      this.workersService.saveWorker(worker).subscribe((result:any) => {
        this.saveEmployment(result);
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
  saveEmployment(workerId:number){
    this.employee.workerId = workerId;
    this.employee.isActive = true;
    if(this.selectedDeptNumbs.length > 0){
      this.employee.orgEntityId = this.selectedDeptNumbs[0];
    }
    this.employee.startDate = new Date(moment(this.employee.startDate).format('YYYY-MM-DD'));
    this.employee.stopDate = this.employee.stopDate ? new Date(moment(this.employee.stopDate).format('YYYY-MM-DD')): undefined;
    this.jobsService.saveEmployment(this.employee).subscribe(response => {
      if(response){
        this.editWorkerBox = false;
        this.getWDetails(this.workerId);
        this.getPagedEmployees(this.workerId, 1, 10);
      }
      this.detailsSaved = true;
    });
  }
  onDobChange(e: any){
    if (this.dob instanceof Date) {
      this.selectedWorker.dob = new Date(moment(this.dob).format('YYYY-MM-DD'));
    }

  }
  setJobScore(e:any){
    this.employee.jobFitSummaryScore.jobId = this.selectedJobId;
    this.employee.jobFitSummaryScore.workerId = this.worker.workerId;
    this.employee.jobFitSummaryScore.jobFitScoreId = e.value.value;
  }
  downloadAttachment(id: number, contentType:string){
    this.gallery.find((x) => x.id === id)
    this.tasksService.getAttachment(id).subscribe(result => {
      let file = new Blob([result], { type: contentType });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }
}
