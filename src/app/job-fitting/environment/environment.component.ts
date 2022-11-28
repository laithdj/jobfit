import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { EnvironmentalTree } from 'src/app/shared/models/enviromental.model';
import { JobFitOptions, JobFitSummary } from 'src/app/shared/models/job-fitting.model';
import { SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingService } from '../job-fitting.service';
import { JFSGroupDropDown } from '../postural-tolerances/postural-tolerances.component';

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.css']
})
export class EnvironmentComponent implements OnInit {
  groupOptions:JFSGroupDropDown[] = [];
  jobFitSummary: JobFitSummary[] = [];
  visibleSidebar4 = false;
  jobFitSummaryJobs: JobFitSummary[] = [];
  jobFitSummaryTasks: JobFitSummary[] = [];
  selectedEnvTree: EnvironmentalTree[] = [];
  fullList: EnvironmentalTree[] = [];
  selectedJobFitSummary: JobFitSummary = new JobFitSummary();
  workerId: number = 0;
  filtered = false;
  response = false;
  filterOptions = [{id:1, label:'Show All Items'}, {id:2, label:'Show only items that dont fit'}, {id:3 , label:'Show items that do fit'}]
  selectedStatus: number = 1;
  constructor(private store: Store<JobFitAppState>,
    private jobFitService:JobFittingService,
    private route:ActivatedRoute,
    private jobFittingService: JobFittingService) {
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.jobFitService?.menuList));
    this.route.params.subscribe((params: Params) => {
      if ((params?.workerId) && (params?.jobId)) {
        this.workerId = params?.workerId;
        this.jobFitService.setMenu(params?.workerId, params?.jobId);
        this.store.dispatch(new SetSideMenu(this.jobFitService?.menuList));
        this.getJobFitSummary(params?.workerId, params?.jobId, params?.associatedId);
       }
    }); 
   }

  ngOnInit(): void {
  }
  getJobFitSummary(workerId:number , jobId:number, associatedId:number){
    let options = new JobFitOptions();
    options.associatedId = jobId;
    this.response = false;
    this.jobFittingService.getJobFitSummary(workerId,options).subscribe(result => {
      this.jobFitSummary = result;
      this.jobFitSummaryJobs = _.cloneDeep(result.filter((x) => x.isJob));
      this.jobFitSummaryTasks = _.cloneDeep(result.filter((x) => !x.isJob));
      let group1 = new JFSGroupDropDown();
      group1.label = 'Job';
      group1.items = this.jobFitSummaryJobs;
      this.groupOptions.push(group1);
      let group2 = new JFSGroupDropDown();
      group2.label = 'Included Task Associations';
      group2.items = this.jobFitSummaryTasks;
      this.groupOptions.push(group2);
      if(associatedId){
        var selectedTaskIndex = this.groupOptions[1].items.findIndex(x=> x.id == associatedId);
        this.selectedJobFitSummary = _.cloneDeep(this.groupOptions[1].items[selectedTaskIndex]);
        this.getAssociatedTaskInit(workerId,associatedId);
       }else{
        this.selectedJobFitSummary = _.cloneDeep(this.groupOptions[0].items[0]);
        this.getEnvironmental(null , this.selectedJobFitSummary);
       }
       
      });
  }
  getAssociatedTaskInit(workerId:number , taskSetId:number){
    let options = new JobFitOptions();
    options.taskId = taskSetId;
    options.jobId = taskSetId;
    this.response = false;
    this.jobFittingService.getTasksEnviromentalTreeSummary(this.workerId,options).subscribe(result => {
      this.selectedEnvTree = _.cloneDeep(result);

      this.fullList = _.cloneDeep(result);
      this.filtered = false;
      this.response = true;
    });
  }
  filterFit(e:any){
    this.response = false;
    this.selectedStatus = e.value;
    if(this.filtered){
      this.selectedEnvTree =_.cloneDeep(this.fullList);
      this.filtered = false;
    }
    if(e.value > 1){
      if (this.selectedEnvTree) {
        let choice = e.value === 3;
        this.filterEnvFit(this.selectedEnvTree, choice);
      }
      this.filtered = true;
      
    }
    this.response = true;
  }
 
  filterEnvFit(selectedEnvTree: EnvironmentalTree[], isFit: boolean)
  {
    if (selectedEnvTree.length > 0) {
      for (var i= selectedEnvTree.length - 1; i >= 0; i--)
      {
          var currentNode = selectedEnvTree[i];
          if (currentNode) {
            // are we a child node
            if (currentNode.children.length < 1)
            {
                if (currentNode.fit != isFit)
                {
                  selectedEnvTree.splice(i, 1);
                }
            }
            else
            {
                // are we a parent node of the correct typeId
                if (currentNode.typeId == 3)
                {
                    // recursive
                    this.filterEnvFit(currentNode.children, isFit);

                    // are we childless now
                    if (currentNode.children.length < 1)
                    {
                      selectedEnvTree.splice(i, 1);
                    }
                }
            }
          }
        
      }
    }
    
  }
  getEnvironmental(e:any, summaryInit?:JobFitSummary){
    this.response = false;
    let item = e?.value ?? summaryInit;
    let options = new JobFitOptions();
    options.jobId = item?.id;
    options.taskId = item?.id;
    this.selectedStatus = 1; //All
    if(item?.isJob) {
      this.jobFittingService.getJobsEnviromentalTreeSummary(this.workerId , options).subscribe(result => {
        this.selectedEnvTree =_.cloneDeep(result);

        this.fullList = _.cloneDeep(result);
        this.filtered = false;
        this.response = true;
      });
    } else {
      this.jobFittingService.getTasksEnviromentalTreeSummary(this.workerId,options).subscribe(result => {
        this.selectedEnvTree = _.cloneDeep(result);

        this.fullList = _.cloneDeep(result);
        this.filtered = false;
        this.response = true;
      });
    }
  }
}
