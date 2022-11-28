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
import { FetchEnvironmentalFactorTree, FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectEnviromentalTree, selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { Environmental, EnvironmentalTree } from '../../shared/models/enviromental.model';
import { WorkersService } from '../workers.service';

@Component({
  selector: 'app-worker-enviroment',
  templateUrl: './worker-enviroment.component.html',
  styleUrls: ['./worker-enviroment.component.css']
})
export class WorkerEnvironmentComponent implements OnInit {
  workerId: any;
  envLoaded = true;
  envList: Environmental[] = [];
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  environmentalTree$ = this.store.pipe(select(selectEnviromentalTree));
  workerDetails: Worker = new Worker();
  worker: Worker = new Worker();
  enviromentalTree:EnvironmentalTree[] = [];
  selectedEnvTree: EnvironmentalTree[] = [];
  assignEnvBox = false;
  selectedEnvironmentNode: EnvironmentalTree[] = [];
  selectedEnvNumbs: number[] = [];
  selectedEnv: number = 0;
  functionList$ = this.store.pipe(select(selectFunctionList));
  envNote: CheckedEntity = new CheckedEntity();
  editEnvNote: boolean = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  selectedEnvId: number = 0;
  empLoaded = false;
  breadCrumbs: MenuItem[] = [];
  envSaved: boolean = true;
  notesSaved: boolean = true;
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
          if (this.authorisedFunctionList.Function[EFunctions.ViewEnvironmentalFactors] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
            this.getWorker(params?.workerId);
            this.getEnvTree();
          } else {
            this.empLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }
        //  this.getWorkerDetails(params?.workerId);

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
  getSpecificNote(id: number) : string | null{
    let indx = this.envList.find((x) => x.id === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null;
    }
  }
  saveEnvNote(){
    this.notesSaved = false;
    this.envNote.id = this.selectedEnv;
    this.envNote.entityId = this.workerId;
    this.envNote.jobFitEntityType = "Workers";
    this.envNote.existingEnvs = this.envList;
    let indx = this.envList?.find((x) => x.id === this.selectedEnv);
  //  this.envNote.existingEnvs = this.worker?.environmentalFactors;
  //  let indx = this.worker?.environmentalFactors.find((x) => x.id === this.selectedEnv);
    if(indx){
      indx.specificNote = this.envNote.specificNote;
    }
    this.tasksService.saveEnvNoteEntity(this.workerId , this.envNote).subscribe(result => {
      this.notesSaved = true;
      this.editEnvNote = false;
    //  this.getEnvTree();
    });
}
getWorker(id:number){
  this.workersService.getWorkerDetails(id).subscribe(result => {
    this.worker = _.cloneDeep(result);
    this.envList = _.cloneDeep(result.environmentalFactors);
    if (result) {
      result.environmentalFactors.forEach(element => {
        this.selectedEnvNumbs.push(element.id);
      });
    }
    this.breadCrumbs = [
      {icon: 'pi pi-home', url: 'home'},
      {label:'Workers', url: 'workers'},
      {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
      {label:'Environment'},
    ];
    this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
  });

}
  getEnvTree() {
    this.store.dispatch(new FetchEnvironmentalFactorTree([]));
    this.environmentalTree$.subscribe(result => {
      this.enviromentalTree = _.cloneDeep(result);
      this.selectedEnvironmentNode = [];
      this.getSelectedNodes(this.enviromentalTree);
    });
    this.getAssignedEnv();
  }

  getAssignedEnv(){
    this.envLoaded = false;
    this.workersService.getSelectedWorkerEnvTree(this.workerId).subscribe(result => {
      this.selectedEnvTree =_.cloneDeep(result);
      this.envLoaded = true;
    });

  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getWorkerDetails(workerId: number) {
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(result => {
      this.workerDetails = _.clone(result);
        if (this.workerDetails) {
          this.workerDetails.environmentalFactors.forEach(element => {
            this.selectedEnvNumbs.push(element.id);
          });
        }
    });
  }
  getSelectedNodes(envTree:EnvironmentalTree[]) {
     // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < envTree.length ; i++) {
      for(let j=0 ; j < envTree[i].children.length ; j++) {
          if(this.selectedEnvNumbs.includes(envTree[i].children[j].id) && envTree[i].children[j].typeId !== 3) {
              if(!this.selectedEnvironmentNode.includes(envTree[i].children[j])){
                  this.selectedEnvironmentNode.push(envTree[i].children[j]);
              }
          }
      }
      this.getSelectedNodes(envTree[i].children);
      let count = envTree[i].children.length;
      let c = 0;
      for(let j=0 ; j < envTree[i].children.length ; j++) {
          if(this.selectedEnvironmentNode.includes(envTree[i].children[j])) {
              c++;
          }
          if(envTree[i].children[j].partialSelected) {
            envTree[i].partialSelected = true;
          }

      }
      if(c == 0) {}
      else if(c == count) {
          envTree[i].partialSelected = false;
          if(!this.selectedEnvironmentNode.includes(envTree[i])){
              this.selectedEnvironmentNode.push(envTree[i]);
          }
      }
      else {
          envTree[i].partialSelected = true;
      }
    }

  }
  saveEnvironmentalFactors() {
    var envTree: EnvironmentalTree[] = [];
    this.selectedEnvNumbs = [];
    if(this.selectedEnvironmentNode.length > 0){
        this.selectedEnvironmentNode.forEach((node:any) => {
          if (node.typeId != 3) {
            var env: EnvironmentalTree = {
              id : Number(node.id),
              name: node.name,
              children : node.children,
              parent: undefined,
              typeId: node.typeId,
              companyId: node.companyId,
              parentId: node.parentId,
              note: node.note,
              fit:node.fit,
              specificNote: this.envList?.find((x) => x.id === node.id)?.specificNote ?? '',
            };
            envTree.push(env);
            this.selectedEnvNumbs.push(node.id);
          }

      });
    }
    this.workersService.saveWorkerEnvironmentalFactors(this.workerId, envTree).subscribe(result => {
      this.getAssignedEnv();
      this.updateEnvList();
      this.assignEnvBox = false;
    });

  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getEnvNote(env:EnvironmentalTree){
    this.envNote.specificNote = '';
    let indx = this.worker?.environmentalFactors.find((x) => x.id === env.id);
    if(indx){
      this.envNote.specificNote = indx.specificNote;
    }
    this.editEnvNote = true;
    this.envNote.id = env.id;
    this.envNote.generalNote = env.generalNote ?? '';
    this.selectedEnv = env.id;
}
assignEnvironment(functionId:number){
  this.functionList$.pipe(take(1)).subscribe((result) => {
    if (result) {
      var indx = result.find((x) => x === functionId);
      if(indx){
        this.selectedEnvironmentNode = [];
        //  this.getSelectedNodes(this.enviromentalTree);
          this.refreshEnvPopUp();
          this.assignEnvBox = true;        } else {
        console.log('message dispatched');
      //  this.editMessage = true; // dispatch error message
      this.store.dispatch(new SetError({
         errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
          title: 'Access Denied'}));
      }
    }
  });

}
  saveEnvironmentalFactorNote() {
    this.envNote.id = this.selectedEnvId;
    this.envNote.entityId = this.workerId;
    this.envNote.jobFitEntityType = "Workers"

    this.workersService.saveEnvironmentalNoteEntity(this.workerId , this.envNote).subscribe(result => {
      var workerDetails = _.cloneDeep(this.workerDetails);
      let envIndex = workerDetails.environmentalFactors.findIndex(x=> x.id === this.selectedEnvId);
      if(envIndex > -1){
      //  workerDetails.environmentalFactors[envIndex].note = this.envNote.specificNote;
        this.workerDetails = workerDetails;
      }
      this.editEnvNote = false;
    });
  }
  getEnvironmentalNote(envId:number){
    this.envNote = new CheckedEntity();
    this.editEnvNote = true;
    this.selectedEnvId = envId;
    let envSpecific = this.worker.environmentalFactors.find(x=> x.id === this.selectedEnvId);
    if(envSpecific){
    //  this.envNote.specificNote = envSpecific.note;
    }
    let envGeneralNote = this.selectedEnvTree.find(x=> x.id === this.selectedEnvId && x.typeId !== 3);
    if(envGeneralNote){
      this.envNote.generalNote = envGeneralNote.note.text ?? "None";
    }
    this.envNote.id = this.selectedEnvId;
  }

  refreshEnvPopUp(){
    this.environmentalTree$.subscribe(result => {
      this.enviromentalTree = _.cloneDeep(result);
      this.getSelectedNodes(this.enviromentalTree);
    });
  }
  updateEnvList(){
    this.workersService.getWorkerDetails(this.workerId).subscribe(result => {
      this.envList = _.cloneDeep(result.environmentalFactors);
    });
  }
}
