import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { Task } from 'src/app/shared/models/task.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { FetchHumanFactorTree, FetchTaskDetails, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList, selectHumanFactorTree, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { HumanFactor, HumanFactorTree } from '../../shared/models/human-factors.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { TasksService } from '../tasks-service.service';

@Component({
  selector: 'app-human-factors',
  templateUrl: './human-factors.component.html',
  styleUrls: ['./human-factors.component.css']
})
export class HumanFactorsComponent implements OnInit {
  taskId: any;
  selectedHFNode: HumanFactorTree[] = [];
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  humanFactorTree$ = this.store.pipe(select(selectHumanFactorTree));
  taskDetails: TaskDetails = new TaskDetails();
  humanFactorTree:HumanFactorTree[] = [];
  selectedHFTree:HumanFactorTree[] = [];
  task: Task = new Task();
  selectedHFNumbs: number[] = [];
  hfNote: CheckedEntity = new CheckedEntity();
  functionList$ = this.store.pipe(select(selectFunctionList));
  assignHF = false;
  editHFNote = false;
  HFLoaded = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  HFList: HumanFactor[] = [];
  empLoaded = false;
  selectedHf: number = 0;
  breadCrumbs: MenuItem[] = [];
  humanFactorSaved: boolean = true;
  notesSaved: boolean = true;
  constructor(private tasksService: TasksService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.taskId = params?.taskId;
        this.tasksService.setMenu(params?.taskId);
      //  this.getTaskDetails(params?.taskId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewHumanFactors] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
          this.getTask(params?.taskId);
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
  getHumanFactorTree() {
    this.humanFactorTree$.subscribe(result => {
      this.humanFactorTree = _.cloneDeep(result);
      this.getAssignedHFTree();
      this.selectedHFNode = [];
      this.getSelectedNodes(this.humanFactorTree);
    });
  }
  refreshHFPopUp(){
    this.humanFactorTree$.subscribe(result => {
      this.humanFactorTree = _.cloneDeep(result);
      this.selectedHFNode = [];
      this.getSelectedNodes(this.humanFactorTree);
    });
  }
  getAssignedHFTree(){
    this.HFLoaded = false;
    this.tasksService.getSelectedHFTree(this.taskId).subscribe(result => {
      this.selectedHFTree =_.cloneDeep(result);
      this.HFLoaded = true;
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getTaskDetails(taskId: number) {
    this.store.dispatch(new FetchTaskDetails(taskId));
    this.taskDetails$.subscribe(result => {
      this.taskDetails = result;
      this.store.dispatch(new FetchHumanFactorTree(this.taskDetails.humanFactors));
      if (this.taskDetails) {
        this.taskDetails.humanFactors.forEach(element => {
          this.selectedHFNumbs.push(element.id);
        });
        this.getHumanFactorTree();
      }
    });
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  saveHumanFactors(){
    this.humanFactorSaved = false;
    var hfTree: HumanFactorTree[] = [];
    this.selectedHFNumbs = [];
    if(this.selectedHFNode.length > 0){
      this.selectedHFNode.forEach((node:any) => {
        if (node.typeId != 3) {
          var hf: HumanFactorTree = {
            id : Number(node.id),
            label: node.label,
            children : node.children,
            parent: undefined,
            typeId: node.typeId,
            note: node.note,
            fit: node.fit,
            specificNote: this.HFList?.find((x) => x.id === node.id)?.specificNote ?? '',
            expanded: false
          };
          hfTree.push(hf);
          this.selectedHFNumbs.push(node.id);
        }
      });
    }
    this.tasksService.saveTaskHumanFactors(this.taskId, hfTree).subscribe(result => {
      this.humanFactorSaved = true;
      this.assignHF = false;
      this.getAssignedHFTree();
      this.getHFList();
    });

  }
  getSelectedNodes(hfTree:HumanFactorTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < hfTree.length ; i++) {
      for(let j=0 ; j < hfTree[i].children.length ; j++) {
          if(this.selectedHFNumbs.includes(hfTree[i].children[j].id) && hfTree[i].children[j].typeId !== 3) {
              if(!this.selectedHFNode.includes(hfTree[i].children[j])){
                  this.selectedHFNode.push(hfTree[i].children[j]);
              }
          }
      }
      this.getSelectedNodes(hfTree[i].children);
      let count = hfTree[i].children.length;
      let c = 0;
      for(let j=0 ; j < hfTree[i].children.length ; j++) {
          if(this.selectedHFNode.includes(hfTree[i].children[j])) {
              c++;
          }
          if(hfTree[i].children[j].partialSelected) {
            hfTree[i].partialSelected = true;
          }

      }
      if(c == 0) {}
      else if(c == count) {
          hfTree[i].partialSelected = false;
          if(!this.selectedHFNode.includes(hfTree[i])){
              this.selectedHFNode.push(hfTree[i]);
          }
      }
      else {
          hfTree[i].partialSelected = true;
      }
    }
  }
  getHumanFactorNote(env:HumanFactorTree){
    this.hfNote.specificNote = '';
    let indx = this.task?.humanFactor?.find((x) => x.id === env.id);
    if(indx){
      this.hfNote.specificNote = indx.specificNote;
    }
    this.editHFNote = true;
    this.hfNote.id = env.id;
    this.selectedHf = env.id;
    this.hfNote.generalNote = env.note.text;
  }
  assignHumanfactor(functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.selectedHFNode = [];
          //  this.getSelectedNodes(this.humanFactorTree);
            this.refreshHFPopUp();
            this.assignHF = true        } else {
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
    let indx = this.HFList?.find((x) => x.id === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }
  getGeneralNote(id: number) : string | null{
    let indx = this.task?.humanFactor?.find((x) => x.id === id);
    if(indx){
      return indx.specificNote;
    } else {
      return null
    }
  }
  getTask(id:number){
    this.tasksService.getTask(id).subscribe(result => {
      this.task = result;
      this.HFList = result.humanFactor;
      this.store.dispatch(new FetchHumanFactorTree(result.humanFactor));
      if (result) {
        result.humanFactor.forEach(element => {
          this.selectedHFNumbs.push(element.id);
        });
        this.getHumanFactorTree();
      }
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Tasks', url: 'tasks'},
        {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
        {label:'Human Factors'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    });
  }

  saveHFNote(){
    this.notesSaved = false;
    this.hfNote.id = this.selectedHf;
    this.hfNote.entityId = this.taskId;
    this.hfNote.jobFitEntityType = "Tasks";
    this.hfNote.existingHumanFactors= this.HFList;
    let indx = this.HFList.find((x) => x.id === this.selectedHf);
    if(indx){
      indx.specificNote = this.hfNote.specificNote;
    }
    this.tasksService.saveHFNoteEntity(this.taskId , this.hfNote).subscribe(result => {
      this.notesSaved = true;
      this.editHFNote = false;
    //  this.getHumanFactorTree();
    });
}
  getHFList(){
    this.tasksService.getTask(this.taskId).subscribe(result => {
      this.HFList = _.cloneDeep(result.humanFactor);
    });
  }
}
