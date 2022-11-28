import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { FetchCustomerSettings, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { selectPosturalToleranceGroups, selectTaskOverviewId } from 'src/app/store/job-fit.selectors';
import { FunctionalAnalysis, PosturalToleranceGroup, PosturalToleranceResult, RiskToolResult } from '../../shared/models/functional-analysis.model';
import { Task } from '../../shared/models/task.model';
import { selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import * as _ from 'lodash';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingService } from '../job-fitting.service';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { JobFitOptions, JobFitSummary } from 'src/app/shared/models/job-fitting.model';
import { JFSGroupDropDown } from '../postural-tolerances/postural-tolerances.component';
import { Grips } from 'src/app/shared/models/grips.model';
import { MaterialHandling } from 'src/app/shared/models/materialHandling.model';

@Component({
  selector: 'app-task-overview',
  templateUrl: './task-overview.component.html',
  styleUrls: ['./task-overview.component.css']
})
export class TaskOverviewComponent implements OnInit {
jobId: any;
task: Task | undefined = new Task();
selectedCategory: any = null;
visibleSidebar4 = false;
jobDetails$ = this.store.pipe(select(selectJobDetails));
posturalGroups$ = this.store.pipe(select(selectPosturalToleranceGroups));
editMode = false;
jobDetails: JobsDetails = new JobsDetails();
currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
posturalGroups: PosturalToleranceGroup[]= [];
selectedFlagTree: FlagsTree[] = [];
groupOptions:JFSGroupDropDown[] = [];
jobFitSummary: JobFitSummary[] = [];
jobFitSummaryTasks: JobFitSummary[] = [];
taskId:number = 0;
selectedJobFitSummary: JobFitSummary = new JobFitSummary();
selectedTaskOverviewId: number = 0;
selectedTaskOverviewId$ = this.store.pipe(select(selectTaskOverviewId));
gripResultItems: Grips[] = [];
materialHandlingResults: MaterialHandling[] = [];
posturalToleranceResults: PosturalToleranceResult[] = [];
loaded: boolean = true;
constructor(private store: Store<JobFitAppState>,
  private jobFitService:JobFittingService,
  private route:ActivatedRoute,
  private tasksService: TasksService,
  private jobFittingService: JobFittingService) {
  this.store.dispatch(new ShowSideMenu(true));
  this.store.dispatch(new SetSideMenu(this.jobFitService?.menuList));
  this.store.dispatch(new FetchCustomerSettings());
  this.route.params.subscribe((params: Params) => {
    if ((params?.workerId) && (params?.jobId)) {
      if(params?.taskId){
        this.selectedTaskOverviewId = parseInt(params?.taskId);
      }
      this.jobFitService.setMenu(params?.workerId, params?.jobId);
      this.store.dispatch(new SetSideMenu(this.jobFitService?.menuList));
      this.getJobFitSummary(params?.workerId, params?.jobId);
    }
  }); 
 }

  ngOnInit(): void {
  }
  getRiskToolResults(e: RiskToolResult[]){
    this.currentFunctionalAnalysis.riskToolResults = e;
  } 
  getJobFitSummary(workerId:number , jobId:number){
    let options = new JobFitOptions();
    options.associatedId = jobId;
    this.jobFittingService.getJobFitSummary(workerId,options).subscribe(result => {
      this.jobFitSummary = result;
      this.jobFitSummaryTasks = _.cloneDeep(result.filter((x) => !x.isJob));
      let group2 = new JFSGroupDropDown();
      group2.label = 'Included Task Associations';
      group2.items = this.jobFitSummaryTasks;
      this.groupOptions.push(group2);
      if(this.selectedTaskOverviewId > 0){
        let indx = this.jobFitSummaryTasks.findIndex((x) => x.id === this.selectedTaskOverviewId);
        if(indx > -1){
          this.selectedJobFitSummary = this.groupOptions[0]?.items[indx];
          this.getFunctionalAnalysis(null , this.selectedJobFitSummary);
        }
      } 
    });
  }
  getFunctionalAnalysis(e : any, summaryInit?:JobFitSummary) {
    this.loaded = false;
    let item = e?.value ?? summaryInit;
    if(this.selectedTaskOverviewId > 0){
      this.taskId = this.selectedTaskOverviewId;
    } else {
      this.taskId = item?.id;
    }
    
    this.selectedFlagTree = [];
    if (this.taskId > 0) {
      this.tasksService.getCurrentFunctionalAnalysis(this.taskId).subscribe(result => {
        this.currentFunctionalAnalysis = _.cloneDeep(result);
        if (result) {
          this.gripResultItems = _.cloneDeep(result.gripItemResults);
          this.materialHandlingResults = _.cloneDeep(result.materialHandlingResults);
          this.posturalToleranceResults = _.cloneDeep(result.posturalToleranceResults);
          this.getFlagsTree();
        }
        this.loaded = true;
      });
    } else {
      this.loaded = true;
    }
  }
  
  getSpecificNote(id: number) : string | null{
    let indx = this.currentFunctionalAnalysis.flags.find((x) => x.flagId === id);
    if((indx) && (indx.note) && (indx.note?.text?.length > 0)){
      return 'Specific Note: ' + indx.note?.text;
    } else {
      return 'Specific Note: ';
    }
  }
  
  getFlagsTree() {
    this.tasksService.getSelectedTaskFAFlags(this.taskId).subscribe(result => {
      this.selectedFlagTree =_.cloneDeep(result);
    });
   
  }
  
}
