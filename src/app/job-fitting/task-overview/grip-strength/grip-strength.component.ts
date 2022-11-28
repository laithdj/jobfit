import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { FetchGripItems } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCustomerSettings, selectGripItems } from 'src/app/store/job-fit.selectors';
import { CustomerCompanySettings } from '../../../shared/models/functional-analysis.model';
import { EGripsDominance, GripItemView, Grips } from '../../../shared/models/grips.model';
import * as _ from 'lodash';

@Component({
  selector: 'jobfit-grip-strength',
  templateUrl: './grip-strength.component.html',
  styleUrls: ['./grip-strength.component.css']
})
export class JobFitGripStrengthComponent implements OnInit {
  gripItems$ = this.store.pipe(select(selectGripItems));
  gripItems: GripItemView[] = [];
  gripItemResultItems: Grips[] = [];
  customerSettings$ = this.store.pipe(select(selectCustomerSettings));
  customerSettings: CustomerCompanySettings = new CustomerCompanySettings();
  gripResultsLeft: Grips[] =[];
  gripResultsRight: Grips[] =[];
  gripResultsBoth: Grips[] =[];
  gripResultsEither: Grips[] =[];

  @Input() set gripResultItems(gripResultItems: Grips[]) {
    this.gripItemResultItems = gripResultItems;
    this.gripItems$.subscribe(result => {
      this.gripItems = result;

      this.gripResultsLeft = [];
      this.gripResultsRight = [];
      this.gripResultsBoth = [];
      this.gripResultsEither = [];
      
      this.gripItems.forEach(grip => {
          var leftGripItem = new Grips();
          var leftGripIndex = this.gripItemResultItems.findIndex(x=> x.gripItemId == grip.id && x.gripSideId == EGripsDominance.Left);
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
                   
          var rightGripItem = new Grips();
          var rightGripIndex = this.gripItemResultItems.findIndex(x=> x.gripItemId == grip.id && x.gripSideId == EGripsDominance.Right);
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
          
          var bothGripItem = new Grips();
          var bothGripIndex = this.gripItemResultItems.findIndex(x=> x.gripItemId == grip.id && x.gripSideId == EGripsDominance.Both);
          if (bothGripIndex > -1) {
            var item = this.gripItemResultItems[bothGripIndex];
            bothGripItem.id = item.id;
            bothGripItem.value = item.value;
            bothGripItem.functionalAnalysisId = item.functionalAnalysisId;
            bothGripItem.isTested = true;
          } 
          bothGripItem.gripItemId = grip.id;
          bothGripItem.gripSideId = EGripsDominance.Both;
          this.gripResultsBoth.push(bothGripItem);

          var eitherGripItem = new Grips();
          var eitherGripIndex = this.gripItemResultItems.findIndex(x=> x.gripItemId == grip.id && x.gripSideId == EGripsDominance.Either);
          if (eitherGripIndex > -1) {
            var item = this.gripItemResultItems[eitherGripIndex];
            eitherGripItem.id = item.id;
            eitherGripItem.value = item.value;
            eitherGripItem.functionalAnalysisId = item.functionalAnalysisId;
            eitherGripItem.isTested = true;
          } 
          eitherGripItem.gripItemId = grip.id;
          eitherGripItem.gripSideId = EGripsDominance.Either;
          this.gripResultsEither.push(eitherGripItem);
      });
    });

  } 
   
  constructor(private store: Store<JobFitAppState>) {
    this.store.dispatch(new FetchGripItems());
    
    this.customerSettings$.subscribe(result => {
      this.customerSettings = result;
    });
   }

  ngOnInit(): void {
  }

}
