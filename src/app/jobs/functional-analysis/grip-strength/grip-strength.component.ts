import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { FetchCustomerSettings, FetchGripItems } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis, selectCustomerSettings, selectGripItems, selectMaterialHandlingGroups } from 'src/app/store/job-fit.selectors';
import { CustomerCompanySettings, FunctionalAnalysis } from '../../../shared/models/functional-analysis.model';
import { Grips } from '../../../shared/models/grips.model';

@Component({
  selector: 'grip-strength',
  templateUrl: './grip-strength.component.html',
  styleUrls: ['./grip-strength.component.css']
})
export class GripStrengthComponent implements OnInit {
  gripStrength = [{
    id: 0,
    label: 'Power Grip',
  }]
  @Input() editMode: boolean = false;
  customerSettings$ = this.store.pipe(select(selectCustomerSettings));
  customerSettings: CustomerCompanySettings = new CustomerCompanySettings();
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  gripItems$ = this.store.pipe(select(selectGripItems));
  currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  gripItems: Grips[] = [];
  constructor(private store: Store<JobFitAppState>) {
    this.store.dispatch(new FetchGripItems());
    this.gripItems$.subscribe(result => {
      this.gripItems = result;
    });
    this.currentFunctionalAnalysis$.subscribe(result => {
      this.currentFunctionalAnalysis = result;
    });
    this.store.dispatch(new FetchCustomerSettings());
    this.customerSettings$.subscribe(result => {
      this.customerSettings = result;
    });
   }

  ngOnInit(): void {
  }


}
