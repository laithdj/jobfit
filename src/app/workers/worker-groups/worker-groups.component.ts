import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { Group } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { Worker } from 'src/app/shared/models/worker.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchWorkerDetails, FetchWorkerGroupTree } from 'src/app/store/workers-store/workers.actions';
import { WorkersAppState } from 'src/app/store/workers-store/workers.reducers';
import { selectWorkerDetails, selectWorkerGroupTree } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { Groups, GroupsTree } from '../../shared/models/groups.models';
import { WorkersService } from '../workers.service';

@Component({
  selector: 'app-worker-groups',
  templateUrl: './worker-groups.component.html',
  styleUrls: ['./worker-groups.component.css']
})
export class WorkerGroupsComponent implements OnInit {
  assignGroupBox = false;
  availableGroups: Groups[] = [];
  selectedGroupNode: GroupsTree[] = [];
  groupNote: CheckedEntity = new CheckedEntity();
  editGroupNote: boolean = false;
  groupsLoaded = false;
  groupTree$ = this.store.pipe(select(selectWorkerGroupTree));
  groupTree: GroupsTree[] = [];
  selectedGroupNumbs:number[] = [];
  selectedGroupTree: GroupsTree[] = [];
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  workerId = 0;
  functionList$ = this.store.pipe(select(selectFunctionList));
  workerDetails: Worker = new Worker();
  selectedGroup: number = 0;
  breadCrumbs: MenuItem[] = [];
  groupsSaved = true;
  notesSaved = true;
  empLoaded = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  groups: Group[] = [];

  constructor(private workerService: WorkersService,
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private store: Store<WorkersAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.workerId = params?.workerId;
        workerService.setMenu(params?.workerId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewGroups] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
            this.getWorker(params?.workerId);
            this.getGroupsTree();
            this.getAssignedGroups();
          } else {
            this.empLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }
      });
      if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
        this.store.dispatch(new ShowSideMenu(true));
        this.store.dispatch(new SetSideMenu(this.workerService?.menuList));
      }
   }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`../reports/worker/${this.workerId}`]);
  }
  getGroupsTree() {
    this.groupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
      this.workerService.getSelectedWorkerGroups(this.workerId).subscribe(result => {
        this.selectedGroupNode = [];
        this.getSelectedNodes(this.groupTree);
      });
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  cancelAssignedGroups(){
    this.selectedGroupNode = [];
  //  this.getSelectedNodes(this.groupTree);
    this.refreshFlagsPopUp();
    this.assignGroupBox = false
   }
   refreshFlagsPopUp(){
    this.groupTree$.subscribe(result => {
      this.groupTree = _.cloneDeep(result);
      this.getSelectedNodes(this.groupTree);
    });
  }
  getAssignedGroups(){
    this.groupsLoaded = false;
    this.workerService.getSelectedWorkerGroups(this.workerId).subscribe(result => {
      this.selectedGroupTree =_.cloneDeep(result);
    //  this.selectedGroupNode = [];
    //  this.getSelectedNodes(this.groupTree);
      this.groupsLoaded = true;
    });
  }

  getWorker(workerId: number){
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(result => {
      this.workerDetails = _.cloneDeep(result);
      this.groups = _.cloneDeep(result.groups);

      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Workers', url: 'workers'},
        {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
        {label:'Groups'},
      ];
      this.store.dispatch(new FetchWorkerGroupTree());
      this.selectedGroupNumbs = [];

      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      if (this.workerDetails) {
        this.workerDetails.groups.forEach((element:Group) => {
          this.selectedGroupNumbs.push(element.id);
        })
      }
    })
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
  getSpecificNote(id: number) : string | null{
  //  let indx = this.workerDetails?.groups?.find((x) => x.id === id);
    let indx = this.groups?.find((x) => x.id === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }
  check(){
    console.log(this.selectedGroupNode);
  }
  saveGroup(){
      var groupsTree: GroupsTree[] = [];
      this.selectedGroupNumbs = [];
      if(this.selectedGroupNode.length > 0){
        this.selectedGroupNode.forEach((node:any) => {
            if (node.typeId != 1) {
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
      this.workerService.saveWorkerGroups(this.workerId, groupsTree).subscribe(result => {
        this.getGroupsTree();
        this.getAssignedGroups();
        this.updateGroupList();
        this.assignGroupBox = false;
        this.groupsSaved = true;
      });

  }
  getSelectedNodes(groupTree:GroupsTree[]) {

    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < groupTree.length ; i++) {
      for(let j=0 ; j < groupTree[i].children.length ; j++) {
          if(this.selectedGroupNumbs.includes(groupTree[i].children[j].id) && groupTree[i].children[j].typeId !== 1) {
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
  saveGroupNote() {
    this.groupNote.id = this.selectedGroup;
    this.groupNote.entityId = this.workerId;
    this.groupNote.jobFitEntityType = "Workers";
    this.groupNote.existingGroups = this.groups;
    let indx = this.groups?.find((x) => x.id === this.selectedGroup);
  //  this.groupNote.existingGroups = this.workerDetails?.groups;
  //  let indx = this.workerDetails?.groups.find((x) => x.id === this.selectedGroup);
    if(indx){
      indx.specificNote = this.groupNote.specificNote;
    }
    this.notesSaved = false;
    this.tasksService.saveGroupNoteEntity(this.workerId , this.groupNote).subscribe(result => {
    //  this.getWorker(this.workerId);
      this.editGroupNote = false;
    //  this.getGroupsTree();
      this.notesSaved = true;
    });
  }
  updateGroupList(){
    this.store.dispatch(new FetchWorkerDetails(this.workerId));
    this.workerDetails$.subscribe(result => {
      this.groups = _.cloneDeep(result.groups);
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
