import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { CustomerCompanySettings, DominantGripSide, GripStrengthData } from 'src/app/shared/models/functional-analysis.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCustomerSettings } from 'src/app/store/job-fit.selectors';
import { FetchGripItems } from 'src/app/store/workers-store/workers.actions';
import { selectGripItems } from 'src/app/store/workers-store/workers.selectors';
import { EGripsDominance, GripData, GripItemView, Grips } from '../../../shared/models/grips.model';

@Component({
  selector: 'worker-grip-strength',
  templateUrl: './grip-strength.component.html',
  styleUrls: ['./grip-strength.component.css']
})
export class GripStrengthComponent implements OnInit {
  gripItems$ = this.store.pipe(select(selectGripItems));
  gripItems: GripItemView[] = [];
  gripItemResultItems: Grips[] = [];
  customerSettings$ = this.store.pipe(select(selectCustomerSettings));
  customerSettings: CustomerCompanySettings = new CustomerCompanySettings();
  gripDataItems: GripData[]= [];
  dominantGripResult: DominantGripSide = new DominantGripSide();
  dominance = [
    {name: "Not Tested", code: EGripsDominance.NotTested},
    {name: "Right", code: EGripsDominance.Right},
    {name: "Left", code: EGripsDominance.Left}
  ];
  gripResultsLeft: Grips[] =[];
  gripResultsRight: Grips[] =[];
  percentNormLeft: string[]= [];
  percentNormRight: string[]= [];
  @Input() editMode: boolean = false;
  @Input() set gripStrengthData(gripStrengthData: GripStrengthData) {
    this.gripItemResultItems = _.cloneDeep(gripStrengthData.gripItemResults);
    this.dominantGripResult = _.cloneDeep(gripStrengthData.dominantGrip);
    this.gripDataItems = _.cloneDeep(gripStrengthData.gripData);
    this.gripResultsLeft = [];
    this.gripResultsRight = [];
    this.percentNormLeft = [];
    this.percentNormRight = [];
    this.gripItems$.subscribe(result => {
      this.gripItems = result;
      this.gripItems.forEach(grip => {
          var leftGripItem = new Grips();
          var leftGripIndex = this.gripItemResultItems.findIndex(x=> x.gripItemId == grip.id && x.gripSideId == EGripsDominance.Left);
          leftGripItem.isTested = false;
          if (leftGripIndex > -1) {
            var item = this.gripItemResultItems[leftGripIndex];
            leftGripItem.id = item.id;
            leftGripItem.value = item.value;
            leftGripItem.functionalAnalysisId = item.functionalAnalysisId;
            leftGripItem.isTested = true;
          } 
          leftGripItem.gripItemId = grip.id;
          leftGripItem.gripSideId = EGripsDominance.Left;
          this.gripResultsLeft.push(leftGripItem);
          this.percentNormLeft.push(this.calculateValue(leftGripItem.gripSideId, leftGripItem.gripItemId, leftGripItem.value));
          
          var rightGripItem = new Grips();
          var rightGripIndex = this.gripItemResultItems.findIndex(x=> x.gripItemId == grip.id && x.gripSideId == EGripsDominance.Right);
          rightGripItem.isTested = false;
          if (rightGripIndex > -1) {
            var item = this.gripItemResultItems[rightGripIndex];
            rightGripItem.id = item.id;
            rightGripItem.value = item.value;
            rightGripItem.functionalAnalysisId = item.functionalAnalysisId;
            rightGripItem.isTested = true;
          } 
          rightGripItem.gripItemId = grip.id;
          rightGripItem.gripSideId = EGripsDominance.Right;
          this.gripResultsRight.push(rightGripItem);
          this.percentNormRight.push(this.calculateValue(rightGripItem.gripSideId, rightGripItem.gripItemId, rightGripItem.value));
      });
    });

  } 
  @Output() onGripChange =  new EventEmitter<Grips[]>(); 
  @Output() onDominantChange =  new EventEmitter<DominantGripSide>(); 
  
  constructor(private store: Store<JobFitAppState>) {
    this.store.dispatch(new FetchGripItems());
    
    this.customerSettings$.subscribe(result => {
      this.customerSettings = result;
    });
   }

  ngOnInit(): void {
  }
  onDominanceChange(e:any) {
    this.dominantGripResult.gripSideId = e.value;
    if (this.dominantGripResult.gripSideId == EGripsDominance.NotTested) {
      this.gripItemResultItems = [];
      this.onGripChange.emit(this.gripItemResultItems);
      for(let i = 0; i < this.gripItems.length; i++) {
        this.gripResultsLeft[i].isTested = false;
        this.gripResultsRight[i].isTested = false;
        this.gripResultsLeft[i].value = 0;
        this.gripResultsRight[i].value = 0;
        this.percentNormLeft[i] = '-';
        this.percentNormRight[i] = '-';
      }
    }
 
    this.onDominantChange.emit(this.dominantGripResult);
  }
  calculateValue(sideId: number, gripItemId: number, value: number) {
    var percentNorm = "-";
    if (this.dominantGripResult.gripSideId != EGripsDominance.NotTested){
      var gripNorm = this.gripDataItems != null ? this.gripDataItems.filter(n => n.gripItemId == gripItemId) : null;
      
      if (gripNorm != null && gripNorm.length > 0 && value)
      {
        var normMean = (this.dominantGripResult.gripSideId == sideId) ? gripNorm[0].dominantMean : gripNorm[0].nonDominantMean;
        var percentNormDecimal = ((value * 100) / normMean );
        percentNorm = percentNormDecimal.toFixed(2) + ' %';
      }
    }
    return percentNorm;
  }

  onActiveChange(e:any, gripItemId: number, sideId:number){
    let index = this.gripItemResultItems.findIndex((x) => x.gripItemId === gripItemId && x.gripSideId === sideId);
    if (index > -1) {
      this.gripItemResultItems[index].isTested = e.checked;

      if(e.checked == false) {
        //reset the values
        if ( sideId == EGripsDominance.Left) {
          let index = this.gripResultsLeft.findIndex((x) => x.gripItemId === gripItemId);
          this.gripResultsLeft[index].value = 0;
          this.percentNormLeft[index] = '-';
        } else {
          let index = this.gripResultsRight.findIndex((x) => x.gripItemId === gripItemId);
          this.gripResultsRight[index].value = 0;
          this.percentNormRight[index] = '-';
        }
        this.gripItemResultItems[index].value = 0;
      }
      this.onGripChange.emit(this.gripItemResultItems);
    }
  }
  onInputChange(e:any, gripSideId:number, gripItemId: number, normIndex:number) {
    var index = this.gripItemResultItems.findIndex(x=> x.gripItemId == gripItemId && x.gripSideId == gripSideId);
    var value = e.value ?? 0;
    //update calculation of percent norm
    if (gripSideId == EGripsDominance.Left) {
      this.percentNormLeft[normIndex] = this.calculateValue(gripSideId, gripItemId, value);
    } else {
      this.percentNormRight[normIndex] = this.calculateValue(gripSideId, gripItemId, value);
    }
    if (index > -1) {
      this.gripItemResultItems[index].value = value;
    }
    else {
      var gripItem = new Grips();
      gripItem.gripItemId = gripItemId;
      gripItem.gripSideId = gripSideId;
      gripItem.value = value;
      this.gripItemResultItems.push(gripItem);
    }
   
    this.onGripChange.emit(this.gripItemResultItems);
  }

}
