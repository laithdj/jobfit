import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { AssociatedTask, JobTask } from 'src/app/shared/models/associatedtasks.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { Jobs, JobsDetails } from 'src/app/shared/models/jobs.model';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { Group } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchAssociatedTasks, FetchJobDetails, FetchJobGroupTree } from 'src/app/store/jobs-store/jobs.actions';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectAssociatedTasks, selectJobDetails, selectJobGroupTree } from 'src/app/store/jobs-store/jobs.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { GroupsTree } from '../../shared/models/groups.models';
import { Note } from '../../shared/models/note.model';
import { JobsService } from '../jobs.service';
export class JASGroupDropDown{
  label:string = '';
  items:ItemOption[] = [];
}
export class ItemOption {
  id: number = 0;
  label: string = '';
  type?: number = 0;
}
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  jobId = 0;
  jobsDetails: JobsDetails = new JobsDetails();
  assignGroupBox = false;
  associatedLoader = false;
  editGroupNote = false;
  selectedGroupNode: GroupsTree[] = [];
  job: Jobs | undefined = new Jobs();
  note: Note = new Note();
  groupsLoaded = false;
  associatedTasks$ = this.store.pipe(select(selectAssociatedTasks));
  editFlagNote: boolean = false;
  groupOptions:JASGroupDropDown[] = [];
  selectedGroup: number = 0;
  groupTree$ = this.store.pipe(select(selectJobGroupTree));
  groupTree: GroupsTree[] = [];
  selectedGroupNumbs:number[] = [];
  isJob:boolean = false;
  jobTaskSelection: any;
  selectedGroupTree: GroupsTree[] = [];
  associatedGroupTree: GroupsTree[] = [];
  jobsDetails$ = this.store.pipe(select(selectJobDetails));
  groupNote: CheckedEntity = new CheckedEntity();
  breadCrumbs: MenuItem[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  groupsSaved: boolean = true;
  notesSaved: boolean = true;
  groups: Group[] = [];
  taskGroups: Group[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  empLoaded = false;

  constructor(
    private jobsService: JobsService,
    private route: ActivatedRoute,
    private store: Store<JobsAppState>,
    private tasksService: TasksService,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.jobId = params?.jobId;
        this.jobsService.setMenu(params?.jobId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewGroups] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
            this.getJobDetails(params?.jobId);
            this.getGroupsTree();
            this.getAssignedGroups();
            this.getAssociatedTaskList();
          } else {
            this.empLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }


        this.functionList$.subscribe(result => {
          this.functionList = result;
          this.authorisedList = [];
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
          this.authorisedList.push(this.isFunctionValid(EFunctions.AssignGroups));
        });
      });
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
        this.store.dispatch(new ShowSideMenu(true));
        this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
      }
   }

  ngOnInit(): void {
  }

  getAssociatedTaskList(){
      let sc = new SearchCriteria();
      sc.pageNumber = 1;
      sc.count = 10000;
      sc.sortField = 'Task.Name';
      this.store.dispatch(new FetchAssociatedTasks({jobId: this.jobId,searchCriteria: sc}));
      let taskItems: ItemOption[] = [];
      this.jobsService.getAssociatedTasksForJob(this.jobId, sc).subscribe(result => {
        result.tasks.forEach(element => {
          let item = new ItemOption();
          item.id = element?.taskId ?? element?.originalRevisionId
          item.label = element?.task?.name;
          taskItems.push(item);
        });
      });

      this.jobsService.getJob(this.jobId).subscribe(result => {
          let group1 = new JASGroupDropDown();
          group1.label = 'Job';
          let group = new ItemOption();
          group.id = this.jobId;
          group.label = result.name;
          group.type = 1;
          let groupArr: ItemOption[] = [];
          groupArr.push(group);
          group1.items = groupArr;
          this.groupOptions.push(group1);
          let group2 = new JASGroupDropDown();
          group2.label = 'Included Task Associations';
          group2.items = taskItems;
          this.groupOptions.push(group2);
          this.jobTaskSelection = _.cloneDeep(this.groupOptions[0].items[0]);
          this.associatedLoader = true;
          this.isJob = true;
          this.jobsService.getJobCombinedGroups(this.jobId).subscribe(result => {
            this.associatedGroupTree =_.cloneDeep(result);
            this.associatedLoader = false;
        });
      });
  }
  getAssociatedTaskGroupTree(e: any){
    this.associatedLoader = true;
    let id = e?.value.id;
    if(e?.value.type === 1){ // is job
      this.isJob = true;
      // call the service for getJobcombinedGroups()
      this.jobsService.getJobCombinedGroups(this.jobId).subscribe(result => {
        this.associatedGroupTree =_.cloneDeep(result);
        this.associatedLoader = false;
    });
    } else {
      this.isJob = false;
      this.getTaskGroupList(id);
      // call the service to get selected group tree by taskId
        this.tasksService.getSelectedGroups(id).subscribe(result => {
          this.associatedGroupTree =_.cloneDeep(result);
          this.associatedLoader = false;
      });
    }
  }
  getAscSpecificNote(id: number) : string | null{
    let indx = this.taskGroups?.find((x) => x.id === id);
    if((indx) && (indx.specificNote) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }
  goToReport(){
    this.router.navigate([`./reports/job/${this.jobId}`]);
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  cancelAssignedGroups(){
    this.selectedGroupNode = [];
    this.refreshFlagsPopUp();
    this.assignGroupBox = false
   }
   refreshFlagsPopUp(){
    this.groupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
      this.jobsService.getSelectedJobGroups(this.jobId).subscribe(result => {
          this.getSelectedNodes(this.groupTree);
      });
      });
  }
  getSelectedNodes(groupTree:GroupsTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < groupTree.length ; i++) {
      for(let j=0 ; j < groupTree[i].children.length ; j++) {
          if(this.selectedGroupNumbs.includes(groupTree[i].children[j].id) && groupTree[i].children[j].typeId !== 2) {
              if(!this.selectedGroupNode.includes(groupTree[i].children[j])){
                  this.selectedGroupNode.push(groupTree[i].children[j]);
              }
          }
      }
      this.getSelectedNodes(groupTree[i].children);
      let count = groupTree[i].children.length;
      let c = 0;
      for(let j=0 ; j < groupTree[i].children.length ; j++) {
          if(this.selectedGroupNode.includes(groupTree[i].children[j])) {
              c++;
          }
          if(groupTree[i].children[j].partialSelected) {
            groupTree[i].partialSelected = true;
          }
      }
      if(c == 0) {}
      else if(c == count) {
          groupTree[i].partialSelected = false;
          if(!this.selectedGroupNode.includes(groupTree[i])){
              this.selectedGroupNode.push(groupTree[i]);
          }
      }
      else {
          groupTree[i].partialSelected = true;
      }
    }
  }
getGroupsTree() {
  this.groupsLoaded = false;
  this.groupTree$.subscribe(result => {
    this.groupTree = _.cloneDeep(result);
    this.jobsService.getSelectedJobGroups(this.jobId).subscribe(result => {
        this.selectedGroupNode = [];
        this.getSelectedNodes(this.groupTree);
    });
    });
}
getAssignedGroups(){
  this.groupsLoaded = false;
  this.jobsService.getSelectedJobGroups(this.jobId).subscribe(result => {
    this.selectedGroupTree =_.cloneDeep(result);
      this.groupsLoaded = true;
  });
}

getJobDetails(jobId: number) {
  this.jobsService.getJobsDetails(this.jobId).subscribe(result => {
    this.jobsDetails = result;
    this.groups = _.cloneDeep(result.groups);
    this.breadCrumbs = [
      {icon: 'pi pi-home', url: 'home'},
      {label:'Jobs', url: 'jobs'},
      {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobId}` },
      {label:'Groups'},
    ];
    this.store.dispatch(new FetchJobGroupTree(this.jobsDetails.groups));
    this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    this.jobsDetails.groups.forEach(element => {
      this.selectedGroupNumbs.push(element.id);
    });
  });

}
  getSpecificNote(id: number) : string | null{
  //  let indx = this.job?.groups?.find((x) => x.id === id);
    let indx = this.groups?.find((x) => x.id === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }

  getGroupNote(group:GroupsTree){
    this.groupNote.specificNote = '';
    let indx = this.groups?.find((x) => x.id === group.id);
    if(indx){
      this.groupNote.specificNote = indx.specificNote;
    }
    this.editGroupNote = true;
    this.groupNote.id = group.id;
    this.groupNote.generalNote = group.note ? group.note.text : '';
    this.selectedGroup = group.id;
  }
  saveGroupNote() {
    this.notesSaved = false;
    this.groupNote.id = this.selectedGroup;
    this.groupNote.entityId = this.jobId;
    this.groupNote.jobFitEntityType = "Jobs";
    this.groupNote.existingGroups = this.groups;
    let indx = this.groups?.find((x) => x.id === this.selectedGroup);
  //  this.groupNote.existingGroups = this.job?.groups;
  //  let indx = this.job?.groups?.find((x) => x.id === this.selectedGroup);
    if(indx){
      indx.specificNote = this.groupNote.specificNote;
    }
    this.tasksService.saveGroupNoteEntity(this.jobId , this.groupNote).subscribe(result => {
      this.editGroupNote = false;
      this.notesSaved = true;
    //  this.getGroupsTree()
    });
  }
  saveGroup(){
    var groupsTree: GroupsTree[] = [];
    this.selectedGroupNumbs = [];
    if(this.selectedGroupNode.length > 0) {
      this.selectedGroupNode.forEach((node:any) => {
          if (node.typeId != 2) {
            var groups: GroupsTree = {
              id : Number(node.id),
              label: node.label,
              children : node.children,
              parent: undefined,
              typeId: node.typeId,
              companyId: node.companyId,
              parentId: node.parentId,
              flagId: node.flagId,
              supplementaryId: node.supplementaryId,
              specificNote: this.groups?.find((x) => x.id === node.id)?.specificNote ?? ''
            };
            this.selectedGroupNumbs.push(node.id);
            groupsTree.push(groups);
          }
      });
    }
    this.jobsService.saveJobsGroup(this.jobId, groupsTree).subscribe(result => {
      if(result){
        this.getAssignedGroups();
        this.updateGroupList();
      }
    //  this.getAssignedGroups();
    //  this.updateGroupList();
    //  this.getGroupsTree();
      this.assignGroupBox = false;
    });
  }
  updateGroupList(){
    this.store.dispatch(new FetchJobDetails(this.jobId));
    this.jobsDetails$.subscribe(result => {
      this.jobsDetails = result;
      this.groups = _.cloneDeep(result.groups);
    });
  }
  getTaskGroupList(id: number){
    this.tasksService.getTask(id).subscribe(result => {
      this.taskGroups = _.cloneDeep(result.groups);
    });
  }
  assignGroups(functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.assignGroupBox = true;
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
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
}

