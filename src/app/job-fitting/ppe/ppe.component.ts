import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { JobFitOptions, JobFitSummary } from 'src/app/shared/models/job-fitting.model';
import { PPETree } from 'src/app/shared/models/ppe.model';
import { SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobFittingService } from '../job-fitting.service';
import { JFSGroupDropDown } from '../postural-tolerances/postural-tolerances.component';

@Component({
  selector: 'app-ppe',
  templateUrl: './ppe.component.html',
  styleUrls: ['./ppe.component.css']
})
export class PpeComponent implements OnInit {
  groupOptions:JFSGroupDropDown[] = [];
  jobFitSummary: JobFitSummary[] = [];
  jobFitSummaryJobs: JobFitSummary[] = [];
  jobFitSummaryTasks: JobFitSummary[] = [];
  selectedPPETree:PPETree[] = [];
  fullList:PPETree[] = [];
  filtered = false;
  workerId: number = 0;
  response = false;
  selectedJobFitSummary: JobFitSummary = new JobFitSummary();
  filterOptions = [{id:1, label:'Show All Items'}, {id:2, label:'Show only items that dont fit'}, {id:3 , label:'Show items that do fit'}]
  visibleSidebar4 = false;
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
  filterFit(e:any){
    this.selectedStatus = e.value;
    if(this.filtered){
      this.selectedPPETree =_.cloneDeep(this.fullList);
      this.filtered = false;
    }
      if(e.value > 1){
        if (this.selectedPPETree) {
          let choice = e.value === 3;
          this.filterPPEFit(this.selectedPPETree, choice);
          // this.selectedPPETree.forEach(element => {
          //   if(element.typeId === 3){
          //     element.children = element.children.filter((item) => (item.fit === choice));
          //   }
          // });
        }
        this.filtered = true;
      }
  }
  filterPPEFit(selectedPPETree: PPETree[], isFit: boolean)
  {
    if (selectedPPETree.length > 0) {
      for (var i= selectedPPETree.length - 1; i >= 0; i--)
      {
          var currentNode = selectedPPETree[i];
          if (currentNode) {
            // are we a child node
            if (currentNode.children.length < 1)
            {
                if (currentNode.fit != isFit)
                {
                  selectedPPETree.splice(i, 1);
                }
            }
            else
            {
                // are we a parent node of the correct typeId
                if (currentNode.typeId == 3)
                {
                    // recursive
                    this.filterPPEFit(currentNode.children, isFit);

                    // are we childless now
                    if (currentNode.children.length < 1)
                    {
                      selectedPPETree.splice(i, 1);
                    }
                }
            }
          }
        
      }
    }
    
  }
  getJobFitSummary(workerId:number , jobId:number, associatedId:number){
    this.response = false;
    let options = new JobFitOptions();
    options.associatedId = jobId;
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
        this.getPPE(null , this.selectedJobFitSummary);
       }
      });
  }
  getAssociatedTaskInit(workerId:number , taskSetId:number){
    let options = new JobFitOptions();
    options.taskId = taskSetId;
    options.jobId = taskSetId;
    this.response = false;
    this.jobFittingService.getTasksPPETreeSummary(this.workerId,options).subscribe(result => {
      this.selectedPPETree = _.cloneDeep(result);

      this.fullList = _.cloneDeep(result);
      this.filtered = false;
      this.response = true;
    });
  }
  getPPE(e:any, summaryInit?:JobFitSummary){
    this.response = false;
    let item = e?.value ?? summaryInit;
    let options = new JobFitOptions();
    options.jobId = item?.id;
    options.taskId = item?.id;
    this.selectedStatus = 1; //All
    if(item?.isJob) {
      this.jobFittingService.getJobsPPETreeSummary(this.workerId , options).subscribe(result => {
        this.selectedPPETree =_.cloneDeep(result);

        this.fullList = _.cloneDeep(result);
        this.filtered = false;
        this.response = true;
      
      });
    } else {
      this.jobFittingService.getTasksPPETreeSummary(this.workerId,options).subscribe(result => {
        this.selectedPPETree = _.cloneDeep(result);

        this.fullList = _.cloneDeep(result);
        this.filtered = false;
        this.response = true;
      });
    }
  }
}
