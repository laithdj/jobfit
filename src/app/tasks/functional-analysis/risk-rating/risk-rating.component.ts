import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { CustomerCompanySettings, RiskToolResult } from 'src/app/shared/models/functional-analysis.model';
import { RiskTool } from 'src/app/shared/models/risk.ratings.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCustomerSettings } from 'src/app/store/job-fit.selectors';
import { TasksService } from '../../tasks-service.service';

@Component({
  selector: 'risk-rating',
  templateUrl: './risk-rating.component.html',
  styleUrls: ['./risk-rating.component.css']
})
export class RiskRatingComponent implements OnInit {
  NULL_VALUE: number = 0;
  MIN_VALUE: number = 1;
  MAX_VALUE: number = 9;

  riskRatings:RiskTool[] = [];
  selectedRiskRatings:RiskTool[] = [];
  @Input() editMode: boolean = false;
  @Input() set functionalAnalysisId(functionalAnalysisId: number) {
    this.currentFunctionalAnalysisId = functionalAnalysisId;
    this.riskTools = [];
    this.selectedRiskRatings = [];
    this.getRiskTools();
    if (functionalAnalysisId > 0) {
      this.getFunctionalAnalysisForRisks(functionalAnalysisId);
    } 
  } 
  @Output() riskToolResultsOutput =  new EventEmitter<RiskToolResult[]>();
  riskToolResults: RiskToolResult[] = [];
  currentFunctionalAnalysisId: number = 0;
  settings:CustomerCompanySettings = new CustomerCompanySettings();
  riskTools: RiskTool[] = [];
  customerSettings$ = this.store.pipe(select(selectCustomerSettings));


  constructor(private tasksService: TasksService,
    private store: Store<JobFitAppState>) {

   }

  ngOnInit(): void {
  }
  getSettings() {
    this.tasksService.getCustomerSettings().subscribe(result => {
      this.settings = result;
    });
  }
  saveRiskRating() {
    if(this.riskTools){
      this.selectedRiskRatings = [];
      let risksToSave: RiskToolResult[] = [];
      for (const riskRating of this.riskTools) {
        if (!riskRating.isActive) continue;
        let tempRisk: RiskToolResult = new RiskToolResult();
        const find = risksToSave.find(x => x.riskToolId === riskRating.id);
        if (find) {
          tempRisk = find;
        } else {
          tempRisk.functionalAnalysisId = this.currentFunctionalAnalysisId;
          tempRisk.riskToolId = riskRating.id;
        }
        tempRisk.riskAssessmentValue = riskRating.riskAssessmentValue;
        tempRisk.isActive = true;
        risksToSave.push(tempRisk);

        if (tempRisk.riskAssessmentValue >= this.MIN_VALUE
          && (this.selectedRiskRatings.length === 0 || this.selectedRiskRatings.some(srr => srr.id !== riskRating.id))
        ) {
          this.selectedRiskRatings.push(riskRating)
        }
      };
      this.riskToolResultsOutput.emit(risksToSave);
    }
  }

  getFunctionalAnalysisForRisks(id:number){
    this.tasksService.getRiskTools(this.settings.id).subscribe(riskRatings => {
      this.tasksService.getFunctionalAnalysisForRisks(id).subscribe(fa => {
        this.riskToolResults = _.cloneDeep(fa.riskToolResults);
        this.riskRatings = riskRatings.map(risk => {
          const existingRisk = this.riskToolResults.some(f => f.riskToolId === risk.id && f.riskAssessmentValue >= this.MIN_VALUE);
          return { ...risk, isActive: existingRisk }
        });

        this.riskToolResults.forEach(element => {
          let indx = this.riskRatings.findIndex(risk => risk.id === element.riskToolId 
            && element.riskAssessmentValue >= this.MIN_VALUE
            && !this.selectedRiskRatings.some(srr => srr.id === risk.id)
          );
          if(indx > -1){
            let riskRating = this.riskRatings[indx];
            riskRating.riskAssessmentValue = element.riskAssessmentValue;
            riskRating.riskRangeRate = this.getRiskRating(element.riskAssessmentValue, riskRating);
            this.selectedRiskRatings.push(riskRating);
          }
        });
        //this.selectedRiskRatings = this.selectedRiskRatings.sort((a, b) => a.id - b.id);
        if(this.selectedRiskRatings.length > 0){
          let riskTools = _.cloneDeep(this.selectedRiskRatings);
          this.riskTools.forEach(element => {
            let indx = this.selectedRiskRatings.findIndex((x) => x.id === element.id);
            if(indx < 0){
              riskTools.push(element);
            }
          });
          this.riskTools = riskTools
        }
      });
    });
  }
  getRiskRating(score: number, riskTool: RiskTool) : string {
    if (!riskTool.isActive && score === 0) return "";
    const rangeRatings = riskTool.riskRangeRatings;
    let validatedScore: number;
    switch (true) {
      case score >= this.MAX_VALUE: 
        validatedScore = this.MAX_VALUE; break;
      case score <= this.MIN_VALUE: 
        validatedScore = this.MIN_VALUE; break;
      default: 
        validatedScore = score;
    }
    const rating = rangeRatings.find(x => validatedScore >= x.minValue && validatedScore <= x.maxValue);
    return rating?.name ?? "";
  }
  changeValue(e: any, riskTool: RiskTool){
    riskTool.riskAssessmentValue = e.value
    this.changeRisk(e, riskTool);
    this.saveRiskRating();
  }
  changeActive(e: any, riskTool: RiskTool){
    riskTool.isActive = e.checked;
    e.value = e.checked ? this.MIN_VALUE : this.NULL_VALUE;
    this.changeValue(e, riskTool);
  }
  getRiskTools(){
    this.customerSettings$.subscribe(result => {
      this.settings = result;
      if(result.id > 0){
        this.tasksService.getRiskTools(this.settings.id).subscribe(riskTools => {
          this.riskTools = _.cloneDeep(riskTools);
          this.riskTools.forEach ((x) => {
            x.riskAssessmentValue = 1;
            const rating = x.riskRangeRatings.find(x => 1 >= x.minValue && 1 <= x.maxValue);
            x.riskRangeRate = rating?.name ?? "";
          });
          
      });
      
      }
    });

  }
  changeRisk(e: any, riskTool: RiskTool){
    const oldRating = riskTool.riskRangeRate;
    const newRating = this.getRiskRating(riskTool.riskAssessmentValue, riskTool);
    riskTool.riskRangeRate = (oldRating != newRating)
      ? newRating
      : oldRating
  }
}
