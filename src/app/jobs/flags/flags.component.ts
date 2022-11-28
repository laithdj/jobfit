import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { AssociatedTask, JobTask } from 'src/app/shared/models/associatedtasks.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { Flags, FlagsTree } from 'src/app/shared/models/flags.models';
import { Jobs, JobsDetails } from 'src/app/shared/models/jobs.model';
import { Note } from 'src/app/shared/models/note.model';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Flag } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchAssociatedTasks, FetchJobDetails, FetchJobFlagTree } from 'src/app/store/jobs-store/jobs.actions';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectAssociatedTasks, selectJobDetails, selectJobFlagTree } from 'src/app/store/jobs-store/jobs.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { ItemOption, JASGroupDropDown } from '../groups/groups.component';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-flags',
  templateUrl: './flags.component.html',
  styleUrls: ['./flags.component.css']
})
export class FlagsComponent  {
  jobsId = 0;
  flags: Flags = new Flags();
  job: Jobs | undefined = new Jobs();
  assignFlagBox = false;
  jobDetails: JobsDetails = new JobsDetails();
  selectedFlagNode: FlagsTree[] = [];
  flagOptions:JASGroupDropDown[] = [];
  associatedTasks$ = this.store.pipe(select(selectAssociatedTasks));
  editFlagNote = false;
  selectedFlagNumbs: number [] = [];
  flagsLoaded = false;
  flagList: Flag[] = [];
  fAassociatedLoader = false;
  jobTaskSelection: any;
  fAjobTaskSelection: any;
  isJob:boolean = false;
  isJobFA:boolean = false;

  note:Note = new Note();
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  jobFlagTree$ = this.store.pipe(select(selectJobFlagTree));
  selectedFlagTree: FlagsTree[] = [];
  associatedLoader = false;
  associatedFlagTree: FlagsTree[] = [];
  associatedFAFlagTree: FlagsTree[] = [];
  flagTree: FlagsTree[] = [];
  selectedFAFlagTree: FlagsTree[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  flagNote: CheckedEntity = new CheckedEntity();
  selectedFlag: number = 0;
  taskFlags:Flag[] = [];
  empLoaded = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  faFlagsList:FlagsTree[] = [];
  breadCrumbs: MenuItem[] = [];
  flagsSaved: boolean = true;
  notesSaved: boolean = true;
  constructor(private jobsService: JobsService,
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private store: Store<JobsAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.jobsId = params?.jobId;
        this.jobsService.setMenu(params?.jobId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewFlags] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
            this.getJobDetails(params?.jobId);
            this.getFlagsTree();
            this.getFAFlagsTree();
            this.getAssignedFlags();
            this.getAssociatedTaskList();
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
    this.router.navigate([`./reports/job/${this.jobsId}`]);
  }
  cancelAssignedFlags(){
    this.selectedFlagNode = [];
  //  this.getSelectedNodes(this.flagTree);
    this.refreshPopUp();
    this.assignFlagBox = false
   }

  getJobDetails(jobId: number) {
    this.jobsService.getJobsDetails(this.jobsId).subscribe(result => {
      this.jobDetails = result;
      this.flagList = _.cloneDeep(result.flags);
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Jobs', url: 'jobs'},
        {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobsId}` },
        {label:'Flags'},
      ];
      this.store.dispatch(new FetchJobFlagTree());
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.selectedFlagNumbs = [];
      this.jobDetails.flags.forEach(element => {
        this.selectedFlagNumbs.push(element.id);
      });
    });
  }

  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getFlagsTree() {
    this.flagsLoaded = false;
    this.jobFlagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
      this.jobsService.getSelectedJobFlags(this.jobsId).subscribe(result => {
        this.selectedFlagNode =[];
        this.getSelectedNodes(this.flagTree);
      });
    });
  }
  refreshPopUp(){
    this.jobFlagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
      this.getSelectedNodes(this.flagTree);

    });
  }
  getAssignedFlags(){
    this.jobsService.getSelectedJobFlags(this.jobsId).subscribe(result => {
      this.selectedFlagTree =_.cloneDeep(result);
      this.getSelectedNodes(this.flagTree);
      this.flagsLoaded = true;
    });
  }

  getFAFlagsTree() {
    this.flagsLoaded = false;
    this.jobsService.getSelectedJobFAFlags(this.jobsId).subscribe(result => {
      this.selectedFAFlagTree =_.cloneDeep(result);
      this.flagsLoaded = true;
    });
  }

  saveFlags(){
    var flagsTree: FlagsTree[] = [];
    this.selectedFlagNumbs = [];
    this.flagsSaved = false;
    if(this.selectedFlagNode.length > 0){
        this.selectedFlagNode.forEach((node:any) => {
          if (node.typeId != 2) {
            var flags: FlagsTree = {
              id : Number(node.id),
              label: node.label,
              children : node.children,
              parent: undefined,
              typeId: node.typeId,
              companyId: node.companyId,
              parentId: node.parentId,
            //  specificNote: node.specificNote,
              specificNote: this.flagList?.find((x) => x.id === node.id)?.specificNote ?? '',
              flagId: node.flagId,
              supplementaryId: node.supplementaryId,
              isActive: true
            };
            this.selectedFlagNumbs.push(node.id);
            flagsTree.push(flags);
          }
      });
    }
    this.jobsService.saveJobsFlag(this.jobsId, flagsTree).subscribe(result => {
      this.getJobDetails(this.jobsId);
      this.getFlagsTree();
      this.getAssignedFlags();
      this.flagsSaved = true;
      this.assignFlagBox = false;
    });

  }
  getSelectedNodes(flagTree:FlagsTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < flagTree.length ; i++) {
      for(let j=0 ; j < flagTree[i].children.length ; j++) {
          if(this.selectedFlagNumbs.includes(flagTree[i].children[j].id) && flagTree[i].children[j].typeId !== 2) {
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
            flagTree[i].partialSelected = true;
          }

      }
      if(c == 0) {}
      else if(c == count) {
          flagTree[i].partialSelected = false;
          if(!this.selectedFlagNode.includes(flagTree[i])){
              this.selectedFlagNode.push(flagTree[i]);
          }
      }
      else {
          flagTree[i].partialSelected = true;
      }
    }
  }

  getFlagNote(flag:FlagsTree){
    this.flagNote.specificNote = '';
    let indx = this.flagList.find((x) => x.id === flag.id);
    if(indx){
      this.flagNote.specificNote = indx.specificNote;
    }
    this.editFlagNote = true;
    this.flagNote.id = flag.id;
    this.selectedFlag = flag.id;
    this.note.generalNotes = flag.note ? flag.note.text : '';
  }
  getSpecificNote(id: number) : string | null{
  //  let indx = this.job?.flags.find((x) => x.id === id);
  let indx = this.flagList?.find((x) => x.id === id);

    if((indx) && (indx.specificNote) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }
  updateGroupList(){
    this.jobsService.getJobsDetails(this.jobsId).subscribe(result => {
      this.flagList = _.cloneDeep(result.flags);
    });
  }
  saveFlagNote() {
    this.flagNote.id = this.selectedFlag;
    this.flagNote.entityId = this.jobsId;
    this.flagNote.jobFitEntityType = "Jobs";
  //  this.flagNote.existingFlags = this.job?.flags;
  //  let indx = this.job?.flags.find((x) => x.id === this.selectedFlag);
    this.flagNote.existingFlags = this.flagList;
    let indx = this.flagList?.find((x) => x.id === this.selectedFlag);
    if(indx){
      indx.specificNote = this.flagNote.specificNote;
    }
    this.notesSaved = false;
    this.tasksService.saveFlagNoteEntity(this.jobsId , this.flagNote).subscribe(result => {
      this.editFlagNote = false;
      this.notesSaved = true;
    //  this.updateGroupList();
    //  this.getFlagsTree();
    });
  }

  getAssociatedTaskList(){
    let sc = new SearchCriteria();
    sc.pageNumber = 1;
    sc.count = 10000;
    sc.sortField = 'Task.Name';
    this.store.dispatch(new FetchAssociatedTasks({jobId: this.jobsId,searchCriteria: sc}));
    let taskItems: ItemOption[] = [];
    this.jobsService.getAssociatedTasksForJob(this.jobsId, sc).subscribe(result => {
      result.tasks.forEach((element: { taskId: any; originalRevisionId: any; task: { name: string; }; }) => {
        let item = new ItemOption();
        item.id = element?.taskId ?? element?.originalRevisionId
        item.label = element?.task?.name;
        taskItems.push(item);
      });
    });

    this.jobsService.getJob(this.jobsId).subscribe(result => {
        let group1 = new JASGroupDropDown();
        group1.label = 'Job';
        let group = new ItemOption();
        group.id = this.jobsId;
        group.label = result.name;
        group.type = 1;
        let groupArr: ItemOption[] = [];
        groupArr.push(group);
        group1.items = groupArr;
        this.flagOptions.push(group1);
        let group2 = new JASGroupDropDown();
        group2.label = 'Included Task Associations';
        group2.items = taskItems;
        this.flagOptions.push(group2);
        this.jobTaskSelection = _.cloneDeep(this.flagOptions[0].items[0]);
        this.fAjobTaskSelection = _.cloneDeep(this.flagOptions[0].items[0]);
        this.associatedLoader = true;
        this.fAassociatedLoader = true;
        this.isJob = true;
        this.isJobFA = true;

        this.jobsService.getJobCombinedFlags(this.jobsId).subscribe(result => {
          this.associatedFlagTree =_.cloneDeep(result);
          this.associatedLoader = false;
      });
      this.jobsService.getSelectedJobFAFlags(this.jobsId).subscribe(result => {
        this.associatedFAFlagTree =_.cloneDeep(result);
        this.fAassociatedLoader = false;
      });
    });
}
getAssociatedTaskGroupTree(e: any){
  this.associatedLoader = true;
  let id = e?.value.id;
  if(e?.value.type === 1){ // is job
    this.isJob = true;
    // call the service for getJobcombinedGroups()
    this.jobsService.getJobCombinedFlags(this.jobsId).subscribe(result => {
      this.associatedFlagTree =_.cloneDeep(result);
      this.associatedLoader = false;
  });
  } else {
    this.isJob = false;
    this.getTaskFlagList(id);

    // call the service to get selected group tree by taskId
      this.tasksService.getSelectedFlags(id).subscribe(result => {
        this.associatedFlagTree =_.cloneDeep(result);
        this.associatedLoader = false;
    });
  }
}
getFAAssociatedTaskGroupTree(e: any){
  this.fAassociatedLoader = true;
  let id = e?.value.id;
  if(e?.value.type === 1){ // is job
    console.log(e);
    this.isJobFA = true;
    this.jobsService.getSelectedJobFAFlags(this.jobsId).subscribe(result => {
      this.associatedFAFlagTree =_.cloneDeep(result);
      this.fAassociatedLoader = false;
    });
    // call the service for getJobcombinedGroups()

  } else {
    this.isJobFA = false;
    this.getFAFlagList(id);
    // call the service to get selected group tree by taskId
      this.tasksService.getSelectedTaskFAFlags(id).subscribe(result => {
        this.associatedFAFlagTree =_.cloneDeep(result);
        this.fAassociatedLoader = false;
    });
  }
}

getAscSpecificNote(id: number) : string | null{
  let indx = this.taskFlags?.find((x) => x.id === id);
  if((indx) && (indx.specificNote) && (indx.specificNote?.length > 0)){
    return 'Specific Note: ' + indx.specificNote;
  } else {
    return null
  }
}
getFAAscSpecificNote(id: number) : string | null{
  let indx = this.faFlagsList.find((x) => x.flagId === id);
  if((indx) && (indx.note) && (indx.note?.text?.length > 0)){
    return 'Specific Note: ' + indx.note?.text;
  } else {
    return null
  }
}
getTaskFlagList(id: number){
  this.tasksService.getTask(id).subscribe(result => {
    this.taskFlags = _.cloneDeep(result.flags);
  });
}
getFAFlagList(id: number){
  this.tasksService.getCurrentFunctionalAnalysis(id).subscribe(result => {
    this.tasksService.getFunctionalAnalysis(result.originalRevisionId ?? result.id).subscribe(result => {
      this.faFlagsList = _.cloneDeep(result.flags);
    });
  });
}
assignFlagBtn(functionId:number){
  this.functionList$.pipe(take(1)).subscribe((result) => {
    if (result) {
      var indx = result.find((x) => x === functionId);
      if(indx){
        this.assignFlagBox = true
      } else {
        console.log('message dispatched');
      //  this.editMessage = true; // dispatch error message
      this.store.dispatch(new SetError({
         errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
          title: 'Access Denied'}));
      }
    }
  });
  // store object to local storage
//  localStorage.setItem('assignedFlags', JSON.stringify(this.selectedFlagNode));
//  this.selectedFlagNodeTemp = _.cloneDeep(this.selectedFlagNode);
}
isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
  if(functionList)
  var indx = functionList.find((x) => x === functionId);
  return indx ? false : true
}
}
