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
import { FetchHumanFactorTree, FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectHumanFactorTree, selectWorkerDetails} from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { HumanFactor, HumanFactorTree } from '../../shared/models/human-factors.model';
import { WorkersService } from '../workers.service';

@Component({
  selector: 'app-worker-human-factors',
  templateUrl: './worker-human-factors.component.html',
  styleUrls: ['./worker-human-factors.component.css']
})
export class WorkerHumanFactorsComponent implements OnInit {
  workerId: any;
  HFLoaded = false;
  HFList: HumanFactor[] = [];
  selectedHFTreeNode: HumanFactorTree[] = [];
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  humanFactorTree$ = this.store.pipe(select(selectHumanFactorTree));
  workerDetails: Worker = new Worker();
  humanFactorTree:HumanFactorTree[] = [];
  selectedHFTree:HumanFactorTree[] = [];
  selectedHFNumbs: number[] = [];
  empLoaded = false;
  assignHF:boolean = false;
  hfNote: CheckedEntity = new CheckedEntity();
  editHFNote: boolean = false;
  selectedHFId: number = 0;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  selectedHf: number = 0;
  functionList$ = this.store.pipe(select(selectFunctionList));
  breadCrumbs: MenuItem[] = [];
  humanFactorSaved: boolean = true;
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
          if (this.authorisedFunctionList.Function[EFunctions.ViewHumanFactors] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
            this.getWorker(params?.workerId);
            this.getHumanFactorTree();
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
  getHumanFactorTree() {
    this.humanFactorTree = [];
    this.humanFactorTree$.subscribe(result => {
      this.humanFactorTree = _.cloneDeep(result);
      this.getAssignedHFTree();
      this.selectedHFTreeNode = [];
      this.getSelectedNodes(this.humanFactorTree);
    });
  }
  getAssignedHFTree(){
    this.HFLoaded = false;
    this.workersService.getSelectedWorkerHFTree(this.workerId).subscribe(result => {
      this.selectedHFTree =_.cloneDeep(result);
      this.HFLoaded = true;
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getWorker(workerId: number) {
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(result => {
      this.workerDetails = _.cloneDeep(result);
      this.HFList = _.cloneDeep(result.humanFactors);
      if (this.workerDetails) {
        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Workers', url: 'workers'},
          {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
          {label:'Human Factors'},
        ];

        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
        this.workerDetails.humanFactors.forEach(element => {
          this.selectedHFNumbs.push(element.id);
        });
      }
    });
    this.store.dispatch(new FetchHumanFactorTree());
  }
  saveHumanFactors(){
    this.humanFactorSaved = false;
    var hfTree: HumanFactorTree[] = [];
    this.selectedHFNumbs = [];
    if(this.selectedHFTreeNode.length > 0){
      this.selectedHFTreeNode.forEach((node:any) => {
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
    this.workersService.saveWorkerHumanFactors(this.workerId, hfTree).subscribe(result => {
      this.getAssignedHFTree();
      this.getHFList();
      this.humanFactorSaved = true;
      this.assignHF = false;
    });

  }

  getSelectedNodes(hfTree:HumanFactorTree[]) {
    // Iterate through each node of the tree and select nodes
    for(let i=0 ; i < hfTree.length ; i++) {
      for(let j=0 ; j < hfTree[i].children.length ; j++) {
          if(this.selectedHFNumbs.includes(hfTree[i].children[j].id) && hfTree[i].children[j].typeId !== 3) {
              if(!this.selectedHFTreeNode.includes(hfTree[i].children[j])){
                  this.selectedHFTreeNode.push(hfTree[i].children[j]);
              }
          }
      }
      this.getSelectedNodes(hfTree[i].children);
      let count = hfTree[i].children.length;
      let c = 0;
      for(let j=0 ; j < hfTree[i].children.length ; j++) {
          if(this.selectedHFTreeNode.includes(hfTree[i].children[j])) {
              c++;
          }
          if(hfTree[i].children[j].partialSelected) {
            hfTree[i].partialSelected = true;
          }

      }
      if(c == 0) {}
      else if(c == count) {
          hfTree[i].partialSelected = false;
          if(!this.selectedHFTreeNode.includes(hfTree[i])){
              this.selectedHFTreeNode.push(hfTree[i]);
          }
      }
      else {
          hfTree[i].partialSelected = true;
      }
    }

  }
  

  assignHumanfactor(functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.selectedHFTreeNode = [];
          this.refreshHFPopUp();
        //  this.getSelectedNodes(this.humanFactorTree);
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
  refreshHFPopUp(){
    this.humanFactorTree$.subscribe(result => {
      this.humanFactorTree = _.cloneDeep(result);
      this.selectedHFTreeNode = [];
      this.getSelectedNodes(this.humanFactorTree);
    });
  }
  saveHumanFactorNote() {
    this.hfNote.id = this.selectedHFId;
    this.hfNote.entityId = this.workerId;;
    this.hfNote.jobFitEntityType = "Workers"
    this.notesSaved = false;
    this.workersService.saveHumanFactorNoteEntity(this.workerId , this.hfNote).subscribe(result => {
      var workerDetails = _.cloneDeep(this.workerDetails);
      let idx = workerDetails.humanFactors.findIndex(x=> x.id === this.selectedHFId);
      if(idx > -1){
        workerDetails.humanFactors[idx].note = this.hfNote.specificNote;
        this.workerDetails = workerDetails;
      }
      this.notesSaved = true;
      this.editHFNote = false;
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
  saveHFNote(){
    this.hfNote.id = this.selectedHf;
    this.hfNote.entityId = this.workerId;
    this.hfNote.jobFitEntityType = "Workers";
    this.hfNote.existingHumanFactors= this.HFList;
    let indx = this.HFList.find((x) => x.id === this.selectedHf);
  //  this.hfNote.existingHumanFactors= this.workerDetails?.humanFactors;
  //  let indx = this.workerDetails?.humanFactors.find((x) => x.id === this.selectedHf);
    if(indx){
      indx.specificNote = this.hfNote.specificNote;
    }
    this.notesSaved = false;
    this.tasksService.saveHFNoteEntity(this.workerId , this.hfNote).subscribe(result => {
      this.editHFNote = false;
      this.notesSaved = true;
    //  this.getHumanFactorTree();
    });
}
  getHumanFactorNote(env:HumanFactorTree){
    this.hfNote.specificNote = '';
    let indx = this.workerDetails?.humanFactors?.find((x) => x.id === env.id);
    if(indx){
      this.hfNote.specificNote = indx.specificNote;
    }
    this.editHFNote = true;
    this.hfNote.id = env.id;
    this.selectedHf = env.id;
    this.hfNote.generalNote = env.note?.text ?? '';
    this.hfNote.generalNote = env.note.text;
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getHFList(){
    this.store.dispatch(new FetchWorkerDetails(this.workerId));
    this.workerDetails$.subscribe(result => {
      this.HFList = _.cloneDeep(result.humanFactors);
    });
  }
}
