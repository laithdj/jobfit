import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { FetchAssociatedJobs, FetchTask, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectAssociatedJobs, selectFunctionList, selectTask } from 'src/app/store/job-fit.selectors';
import { AssociatedJob, TaskJobs } from '../../shared/models/associatedjobs.model';
import { JobListName } from '../../shared/models/job.list.names.model';
import { Jobs } from '../../shared/models/jobs.model';
import { TasksService } from '../tasks-service.service';
import { TasksComponent } from '../tasks.component';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { MenuItem } from 'primeng/api';
import { FlagsTree, JobTaskFlag } from 'src/app/shared/models/flags.models';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { Note } from 'src/app/shared/models/note.model';
import { Flag } from 'src/app/shared/models/task.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { take } from 'rxjs/operators';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-associated-jobs',
  templateUrl: './associated-jobs.component.html',
  styleUrls: ['./associated-jobs.component.css']
})
export class AssociatedJobsComponent implements OnInit {
  jobs: TaskJobs[] = [];
  jobList: Jobs[] = [];
  allJobList: Jobs[] = [];
  job: TaskJobs = new TaskJobs();
  reqOptions = [
    {id:1, name:"Essential"},
    {id:2, name:"Non-Essential"}
];
  newJobBox = false;
  editMode = false;
  editJobBox = false;
  chosenFlag: FlagsTree = new FlagsTree();
  flagNote: CheckedEntity = new CheckedEntity();
  currentPage = 1;
  first:number = 0;
  rowCount = 10;
  note:Note = new Note();
  selectedFlagNode: FlagsTree[] = [];
  associatedTaskFlags: FlagsTree[] = [];
  selectedFlag: number = 0;
  selectedFlagNumbs: number [] = [];
  taskId: number = 0;
  associatedJobsLoaded = false;
  editFlagNote = false;
  selectedFlagTree: FlagsTree[] = [];
  notesSaved: boolean = true;
  jobName = '';
  associatedJobs$ = this.store.pipe(select(selectAssociatedJobs));
  associatedJob : AssociatedJob = new AssociatedJob();
  errorMessage = '';
  displayError = false;
  showArchive = false;
  totalCount = 0;
  rowOptions = [10,20,30];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  task$ = this.store.pipe(select(selectTask));
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  empLoaded = false;
  isLoaded: boolean = true;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();

  constructor(private tasksService: TasksService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<JobFitAppState>,
    private titleService: Title,
    ) {
        this.titleService.setTitle('Associated Jobs');
        this.route.params.subscribe((params: Params) => {
        this.taskId = params?.taskId;
        this.tasksService.setMenu(params?.taskId);

        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewJobs] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
            this.getAssociatedJobs(params?.taskId, 1 , 10);
            this.getAllAssociatedTasksFlagsTree();
            this.functionList$.subscribe(result => {
              this.functionList = result;
              this.authorisedList = [];
              this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
            });
            this.store.dispatch(new FetchTask(this.taskId));
            this.task$.subscribe(result => {
              this.breadCrumbs = [
                {icon: 'pi pi-home', url: 'home'},
                {label:'Tasks', url: 'tasks'},
                {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
                {label:'Associated Jobs'},
              ];
              this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
            });
          } else {
            this.empLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }



      });
      if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
      this.store.dispatch(new ShowSideMenu(true));
      this.store.dispatch(new SetSideMenu(this.tasksService?.menuList));
      }
    }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`../reports/task/${this.taskId}`]);
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getAssociatedJobs(taskId:number, pageNumber:number , count:number){
    let s = new SearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'Job.Name';
    s.sortDir = 'asc';
    this.currentPage = pageNumber;
    this.associatedJobsLoaded = false;
    this.tasksService.getAssociatedJobsForTask(taskId, s).subscribe(result => {
      this.associatedJob = _.cloneDeep(result);
      this.getAllJobs();
      this.totalCount = result.listCount;
      this.associatedJobsLoaded = true;
    });
  }
  getSelectedAssociatedTasksFlagsTree(taskId:number, jobId:number){
    this.selectedFlagNode = [];
    let criteria = new SearchCriteria();
    criteria.jobId = jobId
    this.tasksService.getSelectedAssociatedTasksFlagsTree(taskId, criteria).subscribe(result => {
      this.selectedFlagTree = result;
      this.getAllAssociatedTasksFlagsTree();
    });
  }
  getAllAssociatedTasksFlagsTree(){

    this.tasksService.getAllAssociatedTasksFlagsTree().subscribe(result => {
      this.associatedTaskFlags = _.cloneDeep(result);
      this.getSelectedNodes(this.selectedFlagTree);

    });
  }
  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getAssociatedJobs(this.taskId , this.currentPage , e.value);
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getAssociatedJobs(this.taskId , e.page + 1 , this.rowCount);
  }
  saveTaskJob() {
    if(this.job.job.id == 0){
      this.errorMessage = "A Job Name is required"
      this.displayError = true;
    }
    else if(this.job.req.id == 0){
      this.errorMessage = "A Requirement is required"
      this.displayError = true;
    }
    else{

    //  this.selectedFlagNumbs = [];
      if(this.selectedFlagNode.length > 0){
        var flagsTree: JobTaskFlag[] = [];
        this.selectedFlagNode.forEach((node:any) => {
              if (node.typeId != 12) {
                var flags: JobTaskFlag = {
                  id : Number(node.id),
                  entityId: node.id,
                  isActive: true,
                  lastUpdate:new Date(),
                  originalRevisionId:node.originalRevisionId,
                  specificNote: this.job.flags.find((x) => x.supplementaryEntityId === node.id)?.specificNote ?? '' ,
                  supplementaryEntityId: node.id,
                };
                flagsTree.push(flags);
              //  this.selectedFlagNumbs.push(node.id);
              }
          });
        //  functionalAnalysis.flags = flagsTree;
        this.job.flags = flagsTree;
      } else {
        this.selectedFlagTree = [];
        this.job.flags = [];
      }

      this.detailsSaved = false;
      this.job.taskId = this.taskId; // the selected Associated Task. Taskid = this.taskId
      if(!this.job.originalRevisionId){
        if(this.job.id > 0){
          this.job.originalRevisionId = _.cloneDeep(this.job.id);
        }
      }
      this.tasksService.saveTaskSet(this.job).subscribe(response => {
          this.newJobBox = false;
          this.editJobBox = false;
          this.detailsSaved = true;
          this.editMode = false;
          this.getAssociatedJobs(this.taskId , this.currentPage , this.rowCount);
      });
    }
  }
  getSelectedNodes(flagTree:FlagsTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < flagTree.length ; i++) {
      for(let j=0 ; j < flagTree[i].children.length ; j++) {
          if(this.selectedFlagNumbs.includes(flagTree[i].children[j].id) && flagTree[i].children[j].typeId !== 12) {
              if(!this.selectedFlagNode.includes(flagTree[i].children[j])){
                  this.selectedFlagNode.push(flagTree[i].children[j]);
              }
          }
      }
      this.getSelectedNodes(flagTree[i].children);
      let count = flagTree[i].children.length;
      let c = 0;
      for(let j=0 ; j < flagTree[i].children.length ; j++) {
          if(this.selectedFlagNode.includes(flagTree[i].children[j])) {
              c++;
          }
          if(flagTree[i].children[j].partialSelected) {
          //  flagTree[i].partialSelected = true;
          }

      }
      if(c == 0) {}
      else if(c == count) {
         // flagTree[i].partialSelected = false;
          if(!this.selectedFlagNode.includes(flagTree[i])){
              this.selectedFlagNode.push(flagTree[i]);
          }
      }
      else {
         // flagTree[i].partialSelected = true;
      }
    }
    this.selectedFlagNode.forEach(element => {
    //  element.faNote = this.getNote(element.id);
    });

  }
  check(e:any){

  }
  checked(id: number) : boolean{
    let indx = this.selectedFlagNode.findIndex((x) => x.id === id);
    if(indx > -1){
      return true;
    } else {
      return false
    }
  }
  getFlagNote(flag:FlagsTree){
    this.flagNote.specificNote = '';
    let indx = this.job.flags?.find((x) => x.supplementaryEntityId === flag.id);
    if(indx){
      this.flagNote.specificNote = indx.specificNote;
    }
    this.editFlagNote = true;
    this.flagNote.id = flag.id;
    this.selectedFlag = flag.id;
    this.note.generalNotes = flag.note ? flag.note.text : '';
  }
  getSpecificNote(id: number) : string | null{

    let indx = this.job?.flags.find((x) => x.supplementaryEntityId === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }
  goToJobsDetails(job:Jobs) {
    let jobId = job;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['../jobs/jobs-details/' + jobId])
    );
    window.open(url);
  }
  archiveJob(){
    this.tasksService.archiveAssociatedJob(this.job.originalRevisionId ?? this.job.id).subscribe(response => {
        this.editJobBox = false;
        this.getAssociatedJobs(this.taskId , this.currentPage , this.rowCount);
        this.getAllJobs();
      });
    this.showArchive = false;
  }
  editJob(job: TaskJobs){
    this.selectedFlagNumbs = [];

    this.editJobBox = true;
    this.job = _.cloneDeep(job);
    this.job.flags.forEach(element => {
      this.selectedFlagNumbs.push(element.supplementaryEntityId);
    });
    this.getSelectedAssociatedTasksFlagsTree(this.taskId, job.id);
  }
  cancelPopUp(job: TaskJobs){
    this.getSelectedAssociatedTasksFlagsTree(this.taskId, job.id);
    this.newJobBox = false;
    this.editJobBox = false;
    this.editMode = false;
  }
  setJobName(e : any){

  }
  addNew(){
    this.selectedFlagNumbs = [];
    this.selectedFlagNode = [];
    this.newJobBox = true;
    this.editMode = true;
    this.job = new TaskJobs();
    this.getSelectedAssociatedTasksFlagsTree(this.taskId, this.jobList[0].id);


  }
  getAllJobs(){
    this.isLoaded = false;
    this.tasksService.quickSearchJobs('%20').subscribe(response => {
      if(response){
        this.jobList = _.cloneDeep(response.filter(t => !this.associatedJob.jobs.some((tj:TaskJobs) => tj.jobId == (t.originalRevisionId ?? t.id))));
        this.allJobList = _.cloneDeep(response);
        this.isLoaded = true;
      }
    });
  }

  saveFlagNote() {
    let indx = this.job.flags?.findIndex((x) => x.supplementaryEntityId === this.selectedFlag);
    if(indx > -1){
      this.job.flags[indx].specificNote = this.flagNote.specificNote;
    }else if(this.selectedFlagNode.length > 0){
      let newIndx = this.selectedFlagNode?.find((x) => x.id === this.selectedFlag);
      if(newIndx){
        var flags: JobTaskFlag = {
          id : Number(newIndx.id),
          entityId: newIndx.id,
          isActive: true,
          lastUpdate:new Date(),
        //  originalRevisionId:0,
          specificNote: this.flagNote.specificNote ,
          supplementaryEntityId: newIndx.id,
        };
        this.job.flags.push(flags);
      }
    }
    this.notesSaved = true;
    this.editFlagNote = false;
  }

  editJobAsc(functionId: number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.editMode = true;
        } else {
          console.log('message dispatched');
        //  this.editMessage = true; // dispatch error message
        this.store.dispatch(new SetError({
           errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
            title: 'Access Denied'}));
        }
      }
    });
  }
}
