import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { FetchGroupTree, FetchTaskDetails, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList, selectGroupTree, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { Flags, FlagsTree } from '../../shared/models/flags.models';
import { Groups, GroupsTree } from '../../shared/models/groups.models';
import { Note } from '../../shared/models/note.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { Group, Task } from '../../shared/models/task.model';
import { TasksService } from '../tasks-service.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  selectedCategories: any[] = [];
  taskId = 0;
  groupNote: CheckedEntity = new CheckedEntity();
  flags: Flags = new Flags();
  taskDetails: TaskDetails = new TaskDetails();
  assignGroupBox = false;
  editGroupNote = false;
  flagEntities: FlagsTree[] = [];
  availableGroups: Groups[] = [];
  selectedGroupNode: GroupsTree[] = [];
  task: Task | undefined = new Task();
  note: Note = new Note();
  groupsLoaded = false;
  empLoaded = false;
  selectedGroup: number = 0;
  groupTree$ = this.store.pipe(select(selectGroupTree));
  groupTree: GroupsTree[] = [];
  selectedGroupNumbs:number[] = [];
  selectedGroupTree: GroupsTree[] = [];
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  functionList$ = this.store.pipe(select(selectFunctionList));
  breadCrumbs: MenuItem[] = [];
  groupsSaved = true;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  notesSaved = true;
  groups: Group[] = [];
  constructor(private tasksService: TasksService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.taskId = params?.taskId;
        this.tasksService.setMenu(params?.taskId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewGroups] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
            this.getTask(params?.taskId);
            this.getGroupsTree();
          } else {
            this.empLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }
      //  this.getTaskDetails(params?.taskId);
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
saveGroupNote() {
  this.groupNote.id = this.selectedGroup;
  this.groupNote.entityId = this.taskId;
  this.groupNote.jobFitEntityType = "Tasks";
  this.groupNote.existingGroups = this.groups;
  let indx = this.groups?.find((x) => x.id === this.selectedGroup);
  if(indx){
    indx.specificNote = this.groupNote.specificNote;
  }
  this.notesSaved = false;
  this.tasksService.saveGroupNoteEntity(this.taskId , this.groupNote).subscribe(result => {
    this.editGroupNote = false;
    this.notesSaved = true;
  //  this.getGroupsTree();
  //  this.getTask(this.taskId);
  //  this.getTaskDetails(this.taskId);
  });
}
getGroupsTree() {
  this.groupsLoaded = false;
  this.groupTree$.subscribe(result => {
    this.groupTree = _.cloneDeep(result);
    this.groupsLoaded = true;
    this.getAssignedGroups();
  });
}
cancelAssignedGroups(){
  this.selectedGroupNode = [];
  this.refreshFlagsPopUp();
  this.assignGroupBox = false
 }
 refreshFlagsPopUp(){
  this.groupTree$.subscribe(result => {
    this.groupTree = _.cloneDeep(result);
    this.getSelectedNodes(this.groupTree);
  });
}
isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
  if(functionList)
  var indx = functionList.find((x) => x === functionId);
  return indx ? false : true
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

getTask(id:number){

  this.tasksService.getTask(id).subscribe(result => {
    this.task = _.cloneDeep(result);
    this.groups = _.cloneDeep(result.groups);
    this.store.dispatch(new FetchGroupTree());
    result.groups.forEach(element => {
      this.selectedGroupNumbs.push(element.id);
    });
    this.breadCrumbs = [
      {icon: 'pi pi-home', url: 'home'},
      {label:'Tasks', url: 'tasks'},
      {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
      {label:'Groups'},
    ];
    this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
  });
}
getTaskDetails(taskId: number) {
  this.store.dispatch(new FetchTaskDetails(taskId));
  this.taskDetails$.subscribe(result => {
    this.taskDetails = result;
    this.store.dispatch(new FetchGroupTree());
    this.taskDetails.groups.forEach(element => {
      this.selectedGroupNumbs.push(element.id);
    });
  });
}

  getAssignedGroups(){
    this.tasksService.getSelectedGroups(this.taskId).subscribe(result => {
      this.selectedGroupTree =_.cloneDeep(result);
      this.selectedGroupNode = [];
      this.getSelectedNodes(this.groupTree);
      console.log(this.selectedGroupTree);
    });
  }
  saveGroup(){
    var groupsTree: GroupsTree[] = [];
    this.selectedGroupNumbs = [];

    if(this.selectedGroupNode.length > 0){
      this.selectedGroupNode.forEach((node:any) => {
          if (node.typeId != 3) {
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
    this.groupsSaved = false;
    this.tasksService.saveTaskGroups(this.taskId, groupsTree).subscribe(result => {
      this.assignGroupBox = false;
      this.groupsSaved = true;
      if(result){
        this.getAssignedGroups();
        this.updateGroupList();
      }
    });
  }
  getSpecificNote(id: number) : string | null{
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
  getSelectedNodes(groupTree:GroupsTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < groupTree.length ; i++) {
      for(let j=0 ; j < groupTree[i].children.length ; j++) {
          if(this.selectedGroupNumbs.includes(groupTree[i].children[j].id) && groupTree[i].children[j].typeId !== 3) {
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
  updateGroupList(){
    this.tasksService.getTask(this.taskId).subscribe(result => {
      this.groups = _.cloneDeep(result.groups);
    });
  }
}
