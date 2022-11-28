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
import { FetchPPETree, FetchTaskDetails, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList, selectPPETree, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { PPE, PPETree } from '../../shared/models/ppe.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { TasksService } from '../tasks-service.service';

@Component({
  selector: 'app-ppe',
  templateUrl: './ppe.component.html',
  styleUrls: ['./ppe.component.css']
})
export class PpeComponent implements OnInit {
  taskId: any;
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  ppeTree$ = this.store.pipe(select(selectPPETree));
  taskDetails: TaskDetails = new TaskDetails();
  ppeTree:PPETree[] = [];
  PPELoaded = false;
  task: Task = new Task();
  selectedPPETree:PPETree[] = [];
  ppeNote: CheckedEntity = new CheckedEntity();
  assignPPEBox = false;
  editPpeNote = false;
  ppeList: PPE[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  selectedPpe: number = 0;
  selectedPPENode: PPETree[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  selectedPPENumbs: number[] = [];
  empLoaded = false;
  breadCrumbs: MenuItem[] = [];
  ppeSaved: boolean = true;
  notesSaved: boolean = true;
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
          if (this.authorisedFunctionList.Function[EFunctions.ViewPPEs] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
            this.getTask(params?.taskId);

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
  getPPETree() {
    this.ppeTree$.subscribe(result => {
      this.ppeTree = _.cloneDeep(result);
      this.getAssignedPPE();
      this.selectedPPENode = [];
      this.getSelectedNodes(this.ppeTree);
    });
  }
  refreshEnvPopUp(){
    this.ppeTree$.subscribe(result => {
      this.ppeTree = _.cloneDeep(result);
      this.selectedPPENode = [];
      this.getSelectedNodes(this.ppeTree);
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getSelectedNodes(ppeTree:PPETree[]) {
     // Iterate through each node of the tree and select nodes
     for(let i=0 ; i < ppeTree.length ; i++) {
      for(let j=0 ; j < ppeTree[i].children.length ; j++) {
          if(this.selectedPPENumbs.includes(ppeTree[i].children[j].id) && ppeTree[i].children[j].typeId !== 3) {
              if(!this.selectedPPENode.includes(ppeTree[i].children[j])){
                  this.selectedPPENode.push(ppeTree[i].children[j]);
              }
          }
      }
      this.getSelectedNodes(ppeTree[i].children);
      let count = ppeTree[i].children.length;
      let c = 0;
      for(let j=0 ; j < ppeTree[i].children.length ; j++) {
          if(this.selectedPPENode.includes(ppeTree[i].children[j])) {
              c++;
          }
          if(ppeTree[i].children[j].partialSelected) {
            ppeTree[i].partialSelected = true;
          }

      }
      if(c == 0) {}
      else if(c == count) {
          ppeTree[i].partialSelected = false;
          if(!this.selectedPPENode.includes(ppeTree[i])){
              this.selectedPPENode.push(ppeTree[i]);
          }
      }
      else {
          ppeTree[i].partialSelected = true;
      }
    }

  }
  getAssignedPPE(){
    this.PPELoaded = false;
    this.tasksService.getSelectedPPE(this.taskId).subscribe(result => {
      this.selectedPPETree =_.cloneDeep(result);
      this.PPELoaded = true;
    });
  }

  getTaskDetails(taskId: number) {
    this.store.dispatch(new FetchTaskDetails(taskId));
    this.taskDetails$.subscribe(result => {
      this.taskDetails = result;
      this.store.dispatch(new FetchPPETree(this.taskDetails.ppe));
      if (this.taskDetails) {
        this.taskDetails.ppe.forEach(element => {
          this.selectedPPENumbs.push(element.id);
        });
        this.getPPETree();
      }
    });
  }
  getTask(id:number){
    this.taskDetails$.subscribe(result => {
      this.taskDetails = result;
      if (this.taskDetails) {
        this.taskDetails.ppe.forEach(element => {
          this.selectedPPENumbs.push(element.id);
        });
        this.getPPETree();
      }
    });

    this.tasksService.getTask(id).subscribe(result => {
      this.task = result;
      this.ppeList = _.cloneDeep(result.ppe);
      this.store.dispatch(new FetchPPETree(this.taskDetails.ppe));
      if (result) {
        result.ppe.forEach(element => {
          this.selectedPPENumbs.push(element.id);
        });
        this.getPPETree();
      }
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Tasks', url: 'tasks'},
        {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
        {label:'PPE'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    });
  }
  savePPE(){
    this.ppeSaved = false;
    var ppeTree: PPETree[] = [];
    this.selectedPPENumbs = [];
    if(this.selectedPPENode.length > 0){
        this.selectedPPENode.forEach((node:any) => {
          if (node.typeId != 3) {
            var ppe: PPETree = {
              id : Number(node.id),
              label: node.label,
              children : node.children,
              parent: undefined,
              typeId: node.typeId,
              companyId: node.companyId,
              parentId: node.parentId,
              note: node.note,
              specificNote: this.ppeList?.find((x) => x.id === node.id)?.specificNote ?? '',
              fit: node.fit,
              expanded: false
            };
            ppeTree.push(ppe);
            this.selectedPPENumbs.push(node.id);
          }

      });
    }
    this.tasksService.saveTaskPPE(this.taskId, ppeTree).subscribe(result => {
      this.ppeSaved = true;
      this.assignPPEBox = false;
      this.getAssignedPPE();
      this.updatePPE();
    });

  }
  assignPPE(functionId: number) {
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.selectedPPENode = [];
          //   this.getSelectedNodes(this.ppeTree);
             this.refreshEnvPopUp();
             this.assignPPEBox = true;        } else {
          console.log('message dispatched');
        //  this.editMessage = true; // dispatch error message
        this.store.dispatch(new SetError({
           errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
            title: 'Access Denied'}));
        }
      }
    });

  }

  getEnvNote(env:PPETree){
    this.ppeNote.specificNote = '';
    let indx = this.task?.ppe?.find((x) => x.id === env.id);
    if(indx){
      this.ppeNote.specificNote = indx.specificNote;
    }
    this.editPpeNote = true;
    this.ppeNote.id = env.id;
    this.ppeNote.generalNote = env.note.text;
    this.selectedPpe= env.id;
}
getSpecificNote(id: number) : string | null{
  let indx = this.ppeList?.find((x) => x.id === id);
  if((indx) && (indx.specificNote?.length > 0)){
    return 'Specific Note: ' + indx.specificNote;
  } else {
    return null
  }
}
savePPENote(){
  this.notesSaved = false;
    this.ppeNote.id = this.selectedPpe;
    this.ppeNote.entityId = this.taskId;
    this.ppeNote.jobFitEntityType = "Tasks";
    this.ppeNote.existingPpes= this.ppeList;
    let indx = this.ppeList?.find((x) => x.id === this.selectedPpe);
    if(indx){
      indx.specificNote = this.ppeNote.specificNote;
    }
    this.tasksService.savePPENoteEntity(this.taskId , this.ppeNote).subscribe(result => {
      this.notesSaved = true;
      this.editPpeNote = false;
    //  this.getPPETree();
    });
}
getPPENote(env:PPETree){
  this.ppeNote.specificNote = '';
  let indx = this.task?.ppe?.find((x) => x.id === env.id);
  if(indx){
    this.ppeNote.specificNote = indx.specificNote;
  }
  this.editPpeNote = true;
  this.ppeNote.id = env.id;
  this.selectedPpe = env.id;
  this.ppeNote.generalNote = env.note?.text;
}
updatePPE(){
  this.tasksService.getTask(this.taskId).subscribe(result => {
    this.ppeList = _.cloneDeep(result.ppe);
  });
}
}
