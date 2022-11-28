import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { FunctionalAnalysis } from 'src/app/shared/models/functional-analysis.model';
import { Flag } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchWorkerDetails, FetchWorkerFlagTree } from 'src/app/store/workers-store/workers.actions';
import { selectWorkerDetails, selectWorkerFlagTree } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { Flags, FlagsTree } from '../../shared/models/flags.models';
import { Note } from '../../shared/models/note.model';
import { Worker } from '../../shared/models/worker.model';
import { WorkersService } from '../workers.service';


@Component({
  selector: 'app-worker-flags',
  templateUrl: './worker-flags.component.html',
  styleUrls: ['./worker-flags.component.css']
})
export class WorkerFlagsComponent implements OnInit {
  workerId = 0;
  flagNote: CheckedEntity = new CheckedEntity();
  flags: Flags = new Flags();
  worker: Worker = new Worker();
  assignFlagBox = false;
  flagList: Flag[] = [];
  functionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  availableFlags: Flags[] = [];
  selectedFlagNode: FlagsTree[] = [];
  flagsLoaded = false;
  selectedFlags: FlagsTree[] = [];
  editFlagNote = false;
  selectedFlagNumbs: number [] = [];
  selectedFlag: number = 0;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  note:Note = new Note();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  flagTree$ = this.store.pipe(select(selectWorkerFlagTree));
  selectedFlagTree: FlagsTree[] = [];
  selectedFAFlagTree: FlagsTree[] = [];
  flagTree: FlagsTree[] = [];
  empLoaded = false;
  functionList$ = this.store.pipe(select(selectFunctionList));
  breadCrumbs: MenuItem[] = [];
  flagsSaved = true;
  notesSaved = true;
  constructor(private workersService: WorkersService,
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private store: Store<JobFitAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.workerId = params?.workerId;
        this.workersService.setMenu(params?.workerId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewFlags] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
            this.getWorker(params?.workerId);
            this.getFlagsTree();
            this.getAssignedFlags();
            this.getFAFlagsTree();
            this.getAFunctionalAnalysis(this.workerId);

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
        this.store.dispatch(new SetSideMenu(this.workersService?.menuList));
      }
  }
  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`../reports/worker/${this.workerId}`]);
  }
  getWorker(workerId: number) {
    this.workersService.getWorkerDetails(this.workerId).subscribe(result => {
      this.worker = result;
      this.flagList = result.flags;

      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Workers', url: 'workers'},
        {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
        {label:'Flags'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.store.dispatch(new FetchWorkerFlagTree());
      this.selectedFlagNumbs = [];
      this.worker.flags.forEach(element => {
        this.selectedFlagNumbs.push(element.id);
      });
    });
    this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
  }
  getAssignedFlags(){
    this.flagsLoaded = false;
    this.workersService.getSelectedWorkerFlags(this.workerId).subscribe(result => {
      this.selectedFlagTree =_.cloneDeep(result);
      this.selectedFlagNode = [];
      this.getSelectedNodes(this.flagTree);

      this.flagsLoaded = true;
    });
  }
  getFlagsTree() {
    this.flagTree$.subscribe(result => {
        this.flagTree = _.cloneDeep(result);
        this.workersService.getSelectedWorkerFlags(this.workerId).subscribe(result => {
          this.getSelectedNodes(this.flagTree);
        });
      });
  }
  getFAFlagsTree() {
    this.flagsLoaded = false;
    this.workersService.getSelectedWorkerFAFlags(this.workerId).subscribe(result => {
      this.selectedFAFlagTree =_.cloneDeep(result);
      this.flagsLoaded = true;
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  cancelAssignedFlags(){
    this.selectedFlagNode = [];
    this.refreshPopUp();
  //  this.getSelectedNodes(this.flagTree);
    this.assignFlagBox = false
   }
   refreshPopUp(){
    this.flagTree$.subscribe(result => {
      this.flagTree = _.cloneDeep(result);
      this.getSelectedNodes(this.flagTree);
    });
  }
  saveFlags(){
    var flagsTree: FlagsTree[] = [];
    this.selectedFlagNumbs = [];
    if(this.selectedFlagNode.length > 0){
      this.selectedFlagNode.forEach((node:any) => {
          if (node.typeId != 1) {
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
    this.workersService.saveFlags(this.workerId, flagsTree).subscribe(result => {
      this.assignFlagBox = false;
      this.store.dispatch(new FetchWorkerFlagTree());
      this.getFlagsTree();
      this.updateGroupList();
      this.getAssignedFlags();
      this.flagsSaved = true;
    });
  }
  getSelectedNodes(flagTree:FlagsTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < flagTree.length ; i++) {
      for(let j=0 ; j < flagTree[i].children.length ; j++) {
          if(this.selectedFlagNumbs.includes(flagTree[i].children[j].id) && flagTree[i].children[j].typeId !== 1) {
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
  assignFlag(functionId: number) {
    this.functionList$.subscribe(result => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.assignFlagBox = true;
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

getSpecificNote(id: number) : string | null{
  let indx = this.flagList?.find((x) => x.id === id);
  if((indx) && (indx.specificNote?.length > 0)){
    return 'Specific Note: ' + indx.specificNote;
  } else {
    return null
  }
}
getFASpecificNote(id: number) : string | null{
  let indx = this.selectedFAFlagTree?.find((x) => x.id === id);
  if((indx) && (indx.specificNote?.length > 0)){
    return 'Specific Note: ' + indx.specificNote;
  } else {
    return null
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


  saveFlagNote() {
    this.flagNote.id = this.selectedFlag;
    this.flagNote.entityId = this.workerId;
    this.flagNote.jobFitEntityType = "Workers";

    this.flagNote.existingFlags = this.flagList;
    let indx = this.flagList?.find((x) => x.id === this.selectedFlag);
  //  this.flagNote.existingFlags = this.worker?.flags;
  //  let indx = this.worker?.flags.find((x) => x.id === this.selectedFlag);
    if(indx){
      indx.specificNote = this.flagNote.specificNote;
    }
    this.notesSaved = false;
    this.tasksService.saveFlagNoteEntity(this.workerId , this.flagNote).subscribe(result => {
      this.editFlagNote = false;
      /*
      this.getFlagsTree();
      setTimeout(() => {
        this.getWorker(this.workerId);
      }, 2000);
      */
      this.notesSaved = true;
    });
  }
  updateGroupList(){

    this.workersService.getWorkerDetails(this.workerId).subscribe(result => {
      this.flagList = _.clone(result.flags);
    });
  }
  getFFASpecificNote(id: number) : string | null{
    let indx = this.functionalAnalysis?.flags.find((x) => x.flagId === id);
    if((indx) && (indx.note) && (indx.note?.text?.length > 0)){
      return 'Specific Note: ' + indx.note?.text;
    } else {
      return null
    }
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  
  getAFunctionalAnalysis(id : number){
    this.workersService.getWorkerCurrentFunctionalAnalysis(id).subscribe(result => {
      this.tasksService.getFunctionalAnalysis(result.originalRevisionId ?? result.id).subscribe(result => {
        this.functionalAnalysis = _.cloneDeep(result);
      });
    });
  }
}
