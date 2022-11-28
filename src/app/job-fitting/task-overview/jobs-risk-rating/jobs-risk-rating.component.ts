import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { FunctionalAnalysis, RiskToolResult } from 'src/app/shared/models/functional-analysis.model';
import { RiskRangeRatings, RiskTool } from 'src/app/shared/models/risk.ratings.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis } from 'src/app/store/job-fit.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';

@Component({
  selector: 'risk-rating',
  templateUrl: './jobs-risk-rating.component.html',
  styleUrls: ['./jobs-risk-rating.component.css']
})
export class JobsRiskRatingComponent implements OnInit,  OnChanges {

  riskRatings:RiskTool[] = [];
  selectedRiskRatings:RiskTool[] = [];
  @Input() editMode: boolean = false;
  riskToolResults: RiskToolResult[] = [];
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  currentFunctionalAnalysis:FunctionalAnalysis = new FunctionalAnalysis();
  currentFunctionalAnalysisId: number = 0;
  riskToolResultsSave: RiskToolResult[] = [];
  @Output() riskToolResultsOutput =  new EventEmitter<RiskToolResult[]>();

  
  constructor(private tasksService: TasksService,
    private store: Store<JobFitAppState>) {
    this.getCurrentFA();
    this.getRiskTools();
   }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    let currentFunctionalAnalysis = changes['currentFunctionalAnalysisInput'];
    this.currentFunctionalAnalysis = currentFunctionalAnalysis.currentValue;
    if(this.currentFunctionalAnalysis?.originalRevisionId > 0) {
      this.currentFunctionalAnalysisId = this.currentFunctionalAnalysis?.originalRevisionId;
      this.getFunctionalAnalysisForRisks(this.currentFunctionalAnalysis?.originalRevisionId);
    }
  }
  saveRiskRating() {
    if(this.riskRatings){
      this.riskRatings.forEach(element => {
        let indx = this.riskToolResultsSave.findIndex((x) => x.riskToolId === element.id);
        if(indx > -1){
          let riskToolResult = this.riskToolResultsSave[indx];
          riskToolResult.riskAssessmentValue = element.riskAssessmentValue;
          riskToolResult.isActive = element.isActive;
        } else {
          let riskToolResult: RiskToolResult = new RiskToolResult();
          riskToolResult.functionalAnalysisId = this.currentFunctionalAnalysisId;
          riskToolResult.isActive = element.isActive;
          riskToolResult.riskAssessmentValue = element.riskAssessmentValue;
          riskToolResult.riskToolId = element.id;
          this.riskToolResultsSave.push(riskToolResult);
        }
      });
      this.riskToolResultsOutput.emit(this.riskToolResultsSave);

    }

  }
  getCurrentFA(){
    this.currentFunctionalAnalysis$.subscribe(result => {
      if(result){
        this.currentFunctionalAnalysis = result;
        if(this.currentFunctionalAnalysis?.originalRevisionId > 0) {
          this.currentFunctionalAnalysisId = this.currentFunctionalAnalysis?.originalRevisionId;
          this.getFunctionalAnalysisForRisks(this.currentFunctionalAnalysis?.originalRevisionId);
        }
      }
    });
  }
  getRiskTools(){
    this.tasksService.getRiskTools(0).subscribe(result => {
      this.riskRatings = _.cloneDeep(result);
    });
  }
  getFunctionalAnalysisForRisks(id:number){
    let selectedIds:number[] = [];
    this.tasksService.getFunctionalAnalysisForRisks(id).subscribe(result => {
      this.riskToolResults = result.riskToolResults;
    //  console.log(result);
      if(this.riskToolResults){
        this.riskToolResults.forEach(element => {
          let indx = this.riskRatings.findIndex((x) => x.id === element.riskToolId);
          if(indx > -1){
            let riskRating = this.riskRatings[indx];
            riskRating.riskAssessmentValue = element.riskAssessmentValue;
            riskRating.riskRangeRate = this.getRiskRating(element.riskAssessmentValue , indx , this.riskRatings)
            this.selectedRiskRatings.push(riskRating);
            console.log(this.selectedRiskRatings);
          }
        //  selectedIds.push(element.riskToolId);
        });
      //  this.riskRatings = this.riskRatings.filter(item => selectedIds.indexOf(item.id) > -1);
      //  console.log(this.riskRatings);
      }
    });
  }
  getRiskRating(score:number, index:number,riskTool:RiskTool[]) : string {
    if(riskTool.length > 0){
      let a = riskTool[index].riskRangeRatings;
      let rating = a.find((x) => score > x.minValue && score < x.maxValue) ?? new RiskRangeRatings();
      return rating.name
    } else {
      return '';
    }

  }
  changeValue(e: any, index:number, riskTool: RiskTool[]){
    this.changeRisk(e,index,riskTool);
    this.saveRiskRating();
  }
  changeActive(e: any , index:number){
    console.log(e);
    this.riskRatings[index].isActive = e.checked;
  }
  changeRisk(e: any, index:number, riskTool: RiskTool[]){
    let val = e.value ?? e;
    if(val){
      let temp = riskTool[index].riskRangeRate;
      if((this.getRiskRating(val , index,riskTool).length > 0) && (temp != this.getRiskRating(val , index,riskTool))){
        riskTool[index].riskRangeRate = this.getRiskRating(val , index,riskTool);
      } else {
        riskTool[index].riskRangeRate = temp;
      }
    }
  }

}
