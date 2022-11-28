import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { FunctionalAnalysis } from 'src/app/shared/models/functional-analysis.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { FetchFlagTree, FetchTaskDetails, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFlagTree, selectFunctionList, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { Flags, FlagsTree } from '../../shared/models/flags.models';
import { Note } from '../../shared/models/note.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { Flag, Task } from '../../shared/models/task.model';
import { TasksService } from '../tasks-service.service';

@Component({
  selector: 'app-flags',
  templateUrl: './flags.component.html',
  styleUrls: ['./flags.component.css']
})
export class FlagsComponent implements OnInit {
  taskId = 0;
  flagNote: CheckedEntity = new CheckedEntity();
  flags: Flags = new Flags();
  task: Task | undefined = new Task();
  assignFlagBox = false;
  taskDetails: TaskDetails = new TaskDetails();
  availableFlags: Flags[] = [];
  flagList: Flag[] = [];
  selectedFlagNode: FlagsTree[] = [];
  selectedFlagNodeTemp: FlagsTree[] = [];
  functionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  selectedFlags: FlagsTree[] = [];
  editFlagNote = false;
  selectedFlagNumbs: number [] = [];
  selectedFlag: number = 0;
  selectedFAFlagTree: FlagsTree[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  note:Note = new Note();
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  flagTree$ = this.store.pipe(select(selectFlagTree));
  selectedFlagTree: FlagsTree[] = [];
  flagTree: FlagsTree[] = [];
  chosenFlag: FlagsTree = new FlagsTree();
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  flagsLoaded = false;
  breadCrumbs: MenuItem[] = [];
  flagsSaved = true;
  empLoaded = false;
  notesSaved = true;
  constructor(private tasksService: TasksService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.taskId = params?.taskId;
        this.tasksService.setMenu(params?.taskId);
        this.tasksService.setMenu(params.taskId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewFlags] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
            this.getTask(params?.taskId);
            this.getAFunctionalAnalysis(this.taskId);
            this.getFlagsTree();
            this.getFAFlagsTree();
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
  getTaskDetails(taskId: number) {
    this.store.dispatch(new FetchTaskDetails(taskId));
    this.taskDetails$.subscribe(result => {
      this.taskDetails = result;
      this.store.dispatch(new FetchFlagTree());
      this.selectedFlagNumbs =[];
      this.taskDetails.flags.forEach(element => {
        this.selectedFlagNumbs.push(element.id);
      });
    });
  }
  getTask(id:number){
    this.tasksService.getTask(id).subscribe(result => {
      this.task = result;
      this.flagList = result.flags;
      this.selectedFlagNumbs =[];
      result.flags.forEach(element => {
        this.selectedFlagNumbs.push(element.id);
      });
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Tasks', url: 'tasks'},
        {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
        {label:'Flags'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    });
    this.store.dispatch(new FetchFlagTree());

  }

  getAssignedFlags(){
    this.flagsLoaded = false;
    this.tasksService.getSelectedFlags(this.taskId).subscribe(result => {
      this.selectedFlagTree =_.cloneDeep(result);
      this.selectedFlagNode =[];
      this.getSelectedNodes(this.flagTree);
      this.flagsLoaded = true;
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
  getFlagsTree() {
    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
      this.getAssignedFlags();
    });
  }
  refreshFlagsPopUp(){

    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
      this.getSelectedNodes(this.flagTree);
    });
  }
 updateFlags(){
  this.flagTree$.subscribe(result => {
    this.flagTree = _.cloneDeep(result);
    this.tasksService.getSelectedFlags(this.taskId).subscribe(result => {
      this.selectedFlagTree =_.cloneDeep(result);
      this.selectedFlagNode =[];
      this.getSelectedNodes(this.flagTree);
    });
  });
 }
 cancelAssignedFlags(){
   this.selectedFlagNode = [];
  this.refreshFlagsPopUp();
  this.assignFlagBox = false
 }
  saveFlags(){
    var flagsTree: FlagsTree[] = [];
    this.selectedFlagNumbs = [];
    if(this.selectedFlagNode.length > 0){
      this.selectedFlagNode.forEach((node:any) => {
          if (node.typeId != 3) {
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
            flagsTree.push(flags);
            this.selectedFlagNumbs.push(node.id);
          }

      });
    }
    this.flagsSaved = false;
    this.tasksService.saveTaskFlags(this.taskId, flagsTree).subscribe(result => {
      this.assignFlagBox = false;
      this.flagsSaved = true;
      this.getFlagsTree();
      this.updateGroupList();
    });

  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getFAFlagsTree() {
    this.flagsLoaded = false;
    this.tasksService.getSelectedTaskFAFlags(this.taskId).subscribe(result => {
      this.selectedFAFlagTree =_.cloneDeep(result);
      this.flagsLoaded = true;
    });
  }
  getSelectedNodes(flagTree:FlagsTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < flagTree.length ; i++) {
      for(let j=0 ; j < flagTree[i].children.length ; j++) {
          if(this.selectedFlagNumbs.includes(flagTree[i].children[j].id) && flagTree[i].children[j].typeId !== 3) {
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
    let indx = this.flagList?.find((x) => x.id === flag.id);
    if(indx){
      this.flagNote.specificNote = indx.specificNote;
    }
    this.editFlagNote = true;
    this.flagNote.id = flag.id;
    this.selectedFlag = flag.id;
    this.note.generalNotes = flag.note ? flag.note.text : '';
    this.chosenFlag = flag;
  }
  getSpecificNote(id: number) : string | null{
    let indx = this.flagList?.find((x) => x.id === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }

  }
  saveFlagNote() {
    this.flagNote.id = this.selectedFlag;
    this.flagNote.entityId = this.taskId;
    this.flagNote.jobFitEntityType = "Tasks";
  //  this.flagNote.existingFlags = this.task?.flags;
  this.flagNote.existingFlags = this.flagList;
  let indx = this.flagList?.find((x) => x.id === this.selectedFlag);
  //  let indx = this.task?.flags.find((x) => x.id === this.selectedFlag);
    if(indx){
      indx.specificNote = this.flagNote.specificNote;
    }
    this.notesSaved = false;
    this.tasksService.saveFlagNoteEntity(this.taskId , this.flagNote).subscribe(result => {
      this.editFlagNote = false;
      this.chosenFlag.specificNote = this.flagNote.specificNote;
      setTimeout(() => {
      //  this.getTask(this.taskId);
      //  this.getTaskDetails(this.taskId);
      }, 2000);

    //  this.getFlagsTree();
    //  this.updateFlags();
      this.notesSaved = true;
    });
  }
  updateGroupList(){
    this.tasksService.getTask(this.taskId).subscribe(result => {
      this.flagList = _.clone(result.flags);
    });
  }
  getFASpecificNote(id: number) : string | null{
    let indx = this.functionalAnalysis?.flags.find((x) => x.flagId === id);
    if((indx) && (indx.note) && (indx.note?.text?.length > 0)){
      return 'Specific Note: ' + indx.note?.text;
    } else {
      return null
    }
  }
  getAFunctionalAnalysis(id : number){
    this.tasksService.getCurrentFunctionalAnalysis(id).subscribe(result => {
      this.tasksService.getFunctionalAnalysis(result.originalRevisionId ?? result.id).subscribe(result => {
        this.functionalAnalysis = _.cloneDeep(result);
      });
    });
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  
}
