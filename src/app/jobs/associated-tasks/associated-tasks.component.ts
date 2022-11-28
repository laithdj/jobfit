import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { TaskJobs } from 'src/app/shared/models/associatedjobs.model';
import { AssociatedTask, JobTask } from 'src/app/shared/models/associatedtasks.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { FlagsTree, JobTaskFlag } from 'src/app/shared/models/flags.models';
import { Note } from 'src/app/shared/models/note.model';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Task } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { selectAssociatedTasks, selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-associated-tasks',
  templateUrl: './associated-tasks.component.html',
  styleUrls: ['./associated-tasks.component.css']
})
export class AssociatedTasksComponent {
  jobsTaskList: TaskJobs[] = [];
  note:Note = new Note();
  selectedFlagNode: FlagsTree[] = [];
  selectedFlagNumbs: number [] = [];
  tasks:Task[] = [];
  editMode = false;
  allTasks:Task[] = [];
  selectedFlagTree: FlagsTree[] = [];
  task: Task = new Task();
  totalCount: number = 0;
  associatedTaskFlags: FlagsTree[] = [];
  flagNote: CheckedEntity = new CheckedEntity();
  editFlagNote = false;
  selectedFlag: number = 0;
  first: number = 0;
  errorMessage = '';
  displayError = false;
  jobTask: JobTask = new JobTask();
  reqOptions = [
    {id:1, name:"Essential"},
    {id:2, name:"Non-Essential"}
];
  openTaskBox = false;
  jobId: number = 0;
  jobName = '';
  notesSaved: boolean = true;
  loadedAssociatedTasks = false;
  associatedTasks$ = this.store.pipe(select(selectAssociatedTasks));
  associatedTask : AssociatedTask = new AssociatedTask();
  header: string = '';
  editTaskBox = false;
  showArchive = false;
  currentPage = 1;
  rowCount = 10;
  rowOptions = [10,20,30];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  empLoaded = false;
  job$ = this.store.pipe(select(selectJobDetails));
  breadCrumbs: MenuItem[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  detailsSaved: boolean = true;
  isLoaded: boolean = true;
  constructor(private router: Router,
    private jobsService: JobsService,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    ) {
      this.route.params.subscribe((params: Params) => {
        this.jobId = params?.jobId;
        this.jobsService.setMenu(params?.jobId);

        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewTasks] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
            this.getAssociatedTasks(params?.jobId , 1 , 10);

            this.functionList$.subscribe(result => {
              this.functionList = result;
              this.authorisedList = [];
              this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
            });
             this.store.dispatch(new FetchJobDetails(this.jobId));
              this.job$.subscribe(result => {
                this.breadCrumbs = [
                  {icon: 'pi pi-home', url: 'home'},
                  {label:'Jobs', url: 'jobs'},
                  {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobId}` },
                  {label:'Associated Jobs'}
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
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
      this.store.dispatch(new ShowSideMenu(true));
      this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
      }
    }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`./reports/job/${this.jobId}`]);
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
  getAssociatedTasks(jobId:number , pageNumber: number , count: number){
    this.loadedAssociatedTasks = false;
    let sc = new SearchCriteria();
    sc.pageNumber = pageNumber;
    sc.count = count;
    this.currentPage = pageNumber;
    sc.sortField = 'Task.Name';

    this.jobsService.getAssociatedTasksForJob(jobId, sc).subscribe(result => {
      this.associatedTask = _.cloneDeep(result);
      this.totalCount = result.listCount;
      this.getTasks();
      this.loadedAssociatedTasks = true;
    });
  }
  goToTaskDetails(taskId:number) {
    this.tasksService.setMenu(taskId);
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['../tasks/tasks-details/' + taskId])
    );
    window.open(url);
  }
  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getAssociatedTasks(this.jobId,this.currentPage , e.value);
  }
  archiveTask(jobId: number){
    this.jobTask.jobId = this.jobId;
    this.loadedAssociatedTasks = false;
    this.jobsService.archiveAssociatedTask(this.jobTask.id).subscribe(response => {
      this.editTaskBox = false;
      this.getAssociatedTasks(this.jobId , this.currentPage , 10);
      this.getTasks();
    });
    this.showArchive = false;
  }
  getSpecificNote(id: number) : string | null{

    let indx = this.jobTask?.flags.find((x) => x.supplementaryEntityId === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }
  getTasks(){
    this.isLoaded = false;
    let s = new SearchCriteria();
    s.sortField = 'Name';
    this.tasksService.getTaskList(s).subscribe(result => {
      this.allTasks = _.cloneDeep(result.tasks);
      this.tasks = _.cloneDeep(result.tasks.filter(t => !this.associatedTask.tasks.some((ta:JobTask) => ta.taskId == (t.originalRevisionId ?? t.id))));
      this.isLoaded = true;
    });
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getAssociatedTasks( this.jobId,e.page + 1,this.rowCount);
  }
  checked(id: number) : boolean{
    let indx = this.selectedFlagNode.findIndex((x) => x.id === id);
    if(indx > -1){
      return true;
    } else {
      return false
    }
  }
  saveTaskSet(){
    if (this.jobTask.taskId == 0) {
      this.errorMessage = "A task name is required";
      this.displayError = true;
    } else if (this.jobTask.req.id == 0){
      this.errorMessage = "A requirement is required";
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
                      specificNote: this.jobTask.flags.find((x) => x.supplementaryEntityId === node.id)?.specificNote ?? '' ,
                      supplementaryEntityId: node.id,
                    };
                    flagsTree.push(flags);
                  //  this.selectedFlagNumbs.push(node.id);
                  }
              });
            //  functionalAnalysis.flags = flagsTree;
            this.jobTask.flags = flagsTree;
          } else {
            this.selectedFlagTree = [];
            this.jobTask.flags = [];
          }

      this.detailsSaved = false;
      this.jobTask.jobId = this.jobId;
      this.jobsService.saveTaskSet(this.jobTask).subscribe(response => {
          this.openTaskBox = false;
          this.editTaskBox = false;
          this.detailsSaved = true;
          this.editMode = false;
          this.getAssociatedTasks(this.jobId , this.currentPage , 10);
      });
    }

  }

  editTask(job: JobTask){
    this.selectedFlagNumbs = [];
    this.selectedFlagNode = [];

    this.editTaskBox = true;
    this.jobTask = _.cloneDeep(job);
    this.jobTask.flags.forEach(element => {
      this.selectedFlagNumbs.push(element.supplementaryEntityId);
    });
    this.getSelectedAssociatedTasksJobsFlagsTree(this.jobId, this.jobTask.id);
  }
  openTaskWindow(){
    this.selectedFlagNode = [];
    this.selectedFlagNumbs = [];
    this.header = this.jobTask.id > 0 ? "Edit Task Association" :  "Add New Task Association" ;
    this.openTaskBox = true;
    this.editMode = true;
    this.jobTask = new JobTask();
    this.getSelectedAssociatedTasksJobsFlagsTree(this.jobId, this.tasks[0].id);

  }
  getFlagNote(flag:FlagsTree){
    this.flagNote.specificNote = '';
    let indx = this.jobTask.flags?.find((x) => x.supplementaryEntityId === flag.id);
    if(indx){
      this.flagNote.specificNote = indx.specificNote;
    }
    this.editFlagNote = true;
    this.flagNote.id = flag.id;
    this.selectedFlag = flag.id;
    this.note.generalNotes = flag.note ? flag.note.text : '';
  }
  setJobName(e : any){
    // this.jobName = e?.value?.name;
    //console.log(e);
  }
  getSelectedAssociatedTasksJobsFlagsTree(jobId:number, taskId:number){
    let criteria = new SearchCriteria();
    criteria.taskId = taskId
    this.tasksService.getSelectedAssociatedTasksJobsFlagsTree(jobId, criteria).subscribe(result => {
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
  cancelPopUp(job: JobTask){
    this.getSelectedAssociatedTasksJobsFlagsTree(this.jobId, job.id);
    this.openTaskBox = false;
    this.editTaskBox = false;
    this.editMode = false;
  }
  saveFlagNote() {
      let indx = this.jobTask.flags?.findIndex((x) => x.supplementaryEntityId === this.selectedFlag);
      if(indx > -1){
        this.jobTask.flags[indx].specificNote = this.flagNote.specificNote;
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
          this.jobTask.flags.push(flags);
        }
      }

      this.notesSaved = true;
      this.editFlagNote = false;

    }
    editTaskAsc(functionId: number){
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
