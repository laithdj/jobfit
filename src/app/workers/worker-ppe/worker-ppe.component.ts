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
import { Worker } from 'src/app/shared/models/worker.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchPPETree, FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectPPETree, selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { PPE, PPETree } from '../../shared/models/ppe.model';
import { WorkersService } from '../workers.service';

@Component({
  selector: 'app-worker-ppe',
  templateUrl: './worker-ppe.component.html',
  styleUrls: ['./worker-ppe.component.css']
})
export class WorkerPpeComponent implements OnInit {
  workerId: any;
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  ppeTree$ = this.store.pipe(select(selectPPETree));
  workerDetails: Worker = new Worker();
  ppeTree:PPETree[] = [];
  ppeList: PPE[] = [];
  selectedPPETree:PPETree[] = [];
  PPELoaded = false;
  assignPPEBox = false;
  selectedPpe: number = 0;
  selectedPPENode: PPETree[] = [];
  selectedPPENumbs: number[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  ppeNote: CheckedEntity = new CheckedEntity();
  editPPENote: boolean = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  selectedPPEId: number = 0;
  empLoaded = false;
  breadCrumbs: MenuItem[] = [];
  ppeSaved: boolean = true;
  notesSaved: boolean = true;
  constructor(private workersService: WorkersService,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.workerId = params?.workerId;
        this.workersService.setMenu(params?.workerId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewPPEs] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
            this.getWorker(params?.workerId);
            this.getPPETree();
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
  getPPETree() {
    this.store.dispatch(new FetchPPETree());
    this.ppeTree$.subscribe(result => {
      this.ppeTree = _.cloneDeep(result);
      this.getAssignedPPETree();
      this.selectedPPENode = [];
      this.getSelectedNodes(this.ppeTree);
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
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
  getAssignedPPETree(){
    this.PPELoaded = false;
    this.workersService.getSelectedWorkerPPETree(this.workerId).subscribe(result => {
      this.selectedPPETree =_.cloneDeep(result);
      this.PPELoaded = true;
    });
  }
  getWorker(workerId: number) {
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(result => {
      this.workerDetails = _.cloneDeep(result);
      this.ppeList = _.cloneDeep(result.ppe);

      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Workers', url: 'workers'},
        {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
        {label:'PPE'},
      ];

      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      if (this.workerDetails) {
        this.workerDetails.ppe.forEach(element => {
          this.selectedPPENumbs.push(element.id);
        });
      }
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
              fit: node.fit,
              specificNote: this.ppeList?.find((x) => x.id === node.id)?.specificNote ?? '',
              expanded:false
            };
            ppeTree.push(ppe);
            this.selectedPPENumbs.push(node.id);
          }

      });
    }
    this.workersService.saveWorkerPPE(this.workerId, ppeTree).subscribe(result => {
      this.getAssignedPPETree();
      this.updatePPE();
      this.ppeSaved = true;
      this.assignPPEBox = false;
    });

  }
  savePPENote(){
    this.notesSaved = false;
    this.ppeNote.id = this.selectedPpe;
    this.ppeNote.entityId = this.workerId;
    this.ppeNote.jobFitEntityType = "Workers";
    this.ppeNote.existingPpes= this.ppeList;
    let indx = this.ppeList?.find((x) => x.id === this.selectedPpe);
  //  this.ppeNote.existingPpes = this.workerDetails?.ppe;
  //  let indx = this.workerDetails?.ppe.find((x) => x.id === this.selectedPpe);
    if(indx){
      indx.specificNote = this.ppeNote.specificNote;
    }
    this.tasksService.savePPENoteEntity(this.workerId , this.ppeNote).subscribe(result => {
      this.notesSaved = true;
      this.editPPENote = false;
    //  this.getPPETree();
    });
}
  getPPENote(env:PPETree){
    this.ppeNote.specificNote = '';
    let indx = this.workerDetails?.ppe?.find((x) => x.id === env.id);
    if(indx){
      this.ppeNote.specificNote = indx.specificNote;
    }
    this.editPPENote = true;
    this.ppeNote.id = env.id;
    this.ppeNote.generalNote = env.note?.text ?? '';
    this.selectedPpe = env.id;
  }
  assignPPE(functionId: number) {
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.selectedPPENode = [];
          this.refreshPPEPopUp();
        //  this.getSelectedNodes(this.ppeTree);
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
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getSpecificNote(id: number) : string | null{
    let indx = this.ppeList?.find((x) => x.id === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }

  refreshPPEPopUp(){
    this.ppeTree$.subscribe(result => {
      this.ppeTree = _.cloneDeep(result);
      this.selectedPPENode = [];
      this.getSelectedNodes(this.ppeTree);
    });
  }
  updatePPE(){
    this.store.dispatch(new FetchWorkerDetails(this.workerId));
    this.workerDetails$.subscribe(result => {
      this.ppeList = _.cloneDeep(result.ppe);
    });
  }
}
