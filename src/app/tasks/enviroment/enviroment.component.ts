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
import { FetchEnvironmentalFactorTree, FetchTaskDetails, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectEnviromentalTree, selectFunctionList, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { Environmental, EnvironmentalTree } from '../../shared/models/enviromental.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { TasksService } from '../tasks-service.service';

@Component({
  selector: 'app-enviroment',
  templateUrl: './enviroment.component.html',
  styleUrls: ['./enviroment.component.css']
})
export class EnviromentComponent implements OnInit {
  taskId: any;
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  environmentalTree$ = this.store.pipe(select(selectEnviromentalTree));
  taskDetails: TaskDetails = new TaskDetails();
  enviromentalTree:EnvironmentalTree[] = [];
  selectedEnvTree: EnvironmentalTree[] = [];
  envNote: CheckedEntity = new CheckedEntity();
  assignEnvBox = false;
  empLoaded = false;
  selectedEnvironmentNode: EnvironmentalTree[] = [];
  selectedEnvNumbs: number[] = [];
  task: Task = new Task();
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  EnvLoaded = false;
  envList: Environmental[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  editEnvNote: boolean = false;
  selectedEnv: number = 0;
  breadCrumbs: MenuItem[] = [];
  envSaved: boolean = true;
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
          if (this.authorisedFunctionList.Function[EFunctions.ViewEnvironmentalFactors] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
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
  getTask(id:number){

    this.tasksService.getTask(id).subscribe(result => {
      this.task = result;
      this.envList = _.cloneDeep(result.environmentalFactors);
      this.store.dispatch(new FetchEnvironmentalFactorTree(result.environmentalFactors));
      this.selectedEnvNumbs = [];
      result.environmentalFactors.forEach(element => {
        this.selectedEnvNumbs.push(element.id);
      });
      this.getEnvTree();

      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Tasks', url: 'tasks'},
        {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
        {label:'Environment'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    });
  }
  goToReport(){
    this.router.navigate([`../reports/task/${this.taskId}`]);
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }

  getEnvTree() {
    this.environmentalTree$.subscribe(result => {
      this.enviromentalTree = _.cloneDeep(result);
      this.getAssignedEnv();
    });
  }
  refreshEnvPopUp(){
    this.environmentalTree$.subscribe(result => {
      this.enviromentalTree = _.cloneDeep(result);
      this.getSelectedNodes(this.enviromentalTree);
    });
  }
  getAssignedEnv(){
    this.EnvLoaded = false;
    this.tasksService.getSelectedEnv(this.taskId).subscribe(result => {
      this.selectedEnvTree =_.cloneDeep(result);
      this.selectedEnvironmentNode = [];
      this.getSelectedNodes(this.enviromentalTree);
      this.EnvLoaded = true;
      this.selectedEnvTree = _.cloneDeep(result);
    });
  }
  getEnvNote(env:EnvironmentalTree){
      this.envNote.specificNote = '';
      let indx = this.task?.environmentalFactors?.find((x) => x.id === env.id);
      if(indx){
        this.envNote.specificNote = indx.specificNote;
      }
      this.editEnvNote = true;
      this.envNote.id = env.id;
      this.envNote.generalNote = env.generalNote ?? '';
      this.selectedEnv = env.id;
  }
  getSpecificNote(id: number) : string | null{
    let indx = this.envList.find((x) => x.id === id);
    if((indx) && (indx.specificNote?.length > 0)){
      return 'Specific Note: ' + indx.specificNote;
    } else {
      return null
    }
  }
  saveEnvNote(){
    this.notesSaved = false;
      this.envNote.id = this.selectedEnv;
      this.envNote.entityId = this.taskId;
      this.envNote.jobFitEntityType = "Tasks";
      this.envNote.existingEnvs = this.envList;
      let indx = this.envList?.find((x) => x.id === this.selectedEnv);
      if(indx){
        indx.specificNote = this.envNote.specificNote;
      }
      this.tasksService.saveEnvNoteEntity(this.taskId , this.envNote).subscribe(result => {
        this.notesSaved = true;
        this.editEnvNote = false;
      //  this.getEnvTree();
      });
  }
  getTaskDetails(taskId: number) {
    this.store.dispatch(new FetchTaskDetails(taskId));
    this.taskDetails$.subscribe(result => {
      this.taskDetails = result;
      this.store.dispatch(new FetchEnvironmentalFactorTree(this.taskDetails.environmentalFactors));
      this.selectedEnvNumbs = [];
      this.taskDetails.environmentalFactors.forEach(element => {
        this.selectedEnvNumbs.push(element.id);
      });
      this.getEnvTree();
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
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  saveEnvironmentalFactors() {
    this.envSaved = false;
    var envTree: EnvironmentalTree[] = [];
    this.selectedEnvNumbs = [];
    if(this.selectedEnvironmentNode.length > 0){
      console.log(this.selectedEnvironmentNode);
      console.log(this.envList);
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
    this.tasksService.saveTaskEnvironmentalFactors(this.taskId, envTree).subscribe(result => {
      this.envSaved = true;
      this.assignEnvBox = false;
      this.getAssignedEnv();
      this.updateEnvList();
    });
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
  updateEnvList(){
    this.tasksService.getTask(this.taskId).subscribe(result => {
      this.envList = _.cloneDeep(result.environmentalFactors);
      console.log(this.envList);
    });
  }
}
