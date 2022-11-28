import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { JobFitHealthHygiene, JobFitOptions, JobFitSummary } from 'src/app/shared/models/job-fitting.model';
import { SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingService } from '../job-fitting.service';
import { JFSGroupDropDown } from '../postural-tolerances/postural-tolerances.component';

@Component({
  selector: 'app-health-hygiene',
  templateUrl: './health-hygiene.component.html',
  styleUrls: ['./health-hygiene.component.css']
})
export class HealthHygieneComponent implements OnInit {
  jobFitSummary: JobFitSummary[] = [];
  jobFitSummaryJobs: JobFitSummary[] = [];
  jobFitSummaryTasks: JobFitSummary[] = [];
  jobFitItems: JobFitHealthHygiene[] = [];
  optionSelected = false;
  groupOptions:JFSGroupDropDown[] = [];
  jobFitItemsGroups:JobFitHealthHygiene[] = [];
  selectedJobFitSummary: JobFitSummary = new JobFitSummary();
  filterOptions = [{id:1, label:'Show All Items'}, {id:2, label:'Show only items that dont fit'}, {id:3 , label:'Show items that do fit'}]
  visibleSidebar4 = false;
  loaded: boolean = false;
  constructor(private store: Store<JobFitAppState>,
    private jobFitService:JobFittingService,
    private route:ActivatedRoute,
    private jobFittingService: JobFittingService) {
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.jobFitService?.menuList));
    this.route.params.subscribe((params: Params) => {
      if ((params?.workerId) && (params?.jobId)) {
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
    this.loaded = false;
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
        this.selectedJobFitSummary = this.groupOptions[0].items[0];
        this.getHealthHygiene(null , this.selectedJobFitSummary);
       }
       this.loaded = true;
    });
  }
    getAssociatedTaskInit(workerId:number , taskSetId:number){
    let options = new JobFitOptions();
    options.associatedId = taskSetId;
    
    this.optionSelected = true;
    options.associatedId = taskSetId;
    this.loaded = false;
    this.jobFittingService.getHealthHygieneTasksSummary(workerId,options).subscribe(result => {
      this.jobFitItems = result;
      this.loaded = true;
    });
  }
  getHealthHygiene(e: any, summaryInit?:JobFitSummary, filterType?:number){
    this.loaded = false;
    let item = e?.value ?? summaryInit;
    this.optionSelected = true;
    this.jobFitItems = [];
    this.jobFitItemsGroups = [];
    
    let workerId = item?.workerId;
    let type = item?.isJob ? 'Job' : 'Task'
    let options = new JobFitOptions();
    if(type === 'Job') {
      options.associatedId = item?.jobId
      this.jobFittingService.getHealthHygieneJobsSummary(workerId,options).subscribe(result => {
        this.jobFitItems = result;

        if(filterType === 2){
          this.jobFitItems = this.jobFitItems.filter((x) => x.fit == false)
        } else if (filterType === 3){
          this.jobFitItems = this.jobFitItems.filter((x) => x.fit)
        }
        this.loaded = true;
      });
    } else if(type === 'Task') {
      options.associatedId = item?.id;
      this.jobFittingService.getHealthHygieneTasksSummary(workerId,options).subscribe(result => {
        this.jobFitItems = result;

        if(filterType === 2){
          this.jobFitItems = this.jobFitItems.filter((x) => x.fit == false)
        } else if (filterType === 3){
          this.jobFitItems = this.jobFitItems.filter((x) => x.fit)
        }
        this.loaded = true;
      });
    }
  }
  filterFit(e:any){
    this.getHealthHygiene(null, this.selectedJobFitSummary, e?.value);
  }
}
