import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { FetchMaterialHandlingGroups } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCustomerSettings, selectMaterialHandlingGroups } from 'src/app/store/job-fit.selectors';
import { CustomerCompanySettings } from '../../../shared/models/functional-analysis.model';
import { EMaterialHandlingFrequency, MaterialHandling, MaterialHandlingGroup } from '../../../shared/models/materialHandling.model';

@Component({
  selector: 'jobfit-material-handling',
  templateUrl: './material-handling.component.html',
  styleUrls: ['./material-handling.component.css']
})
export class JobFitMaterialHandlingComponent implements OnInit {
  materialHandlingGroups$ = this.store.pipe(select(selectMaterialHandlingGroups));
  customerSettings$ = this.store.pipe(select(selectCustomerSettings));
  customerSettings: CustomerCompanySettings = new CustomerCompanySettings();
  materialHandlingGroups: MaterialHandlingGroup[] = [];
  materialHandlingResultItems: MaterialHandling[] = [];
  mainMaterialHandlingList: MaterialHandling[] = [];
  occasionalMaterialHandlingList: MaterialHandling[] = [];
  frequentMaterialHandlingList: MaterialHandling[] = [];
  continuousMaterialHandlingList: MaterialHandling[] = [];
  materialHandlingOutput: MaterialHandling[] = [];
  @Input() set materialHandlingResults( materialHandlingResults: MaterialHandling[] ) {
    this.materialHandlingResultItems = materialHandlingResults;
    this.materialHandlingGroups$.subscribe(result => {
      this.materialHandlingGroups = result;
      this.mainMaterialHandlingList = [];
      this.occasionalMaterialHandlingList = [];
      this.frequentMaterialHandlingList = [];
      this.continuousMaterialHandlingList = [];
      this.materialHandlingOutput = [];
      var units = this.customerSettings?.measurementType?.units ?? "kg";
      this.materialHandlingGroups.forEach((mhg) => {
          let matHandling = new MaterialHandling();
          let awkwardLoad = false;
          let forceFullPush = false;
          let forceFullPull = false;
          let isActive = false;
          var occasional = new MaterialHandling();
          var frequent = new MaterialHandling();
          var continuous = new MaterialHandling
          var mhResultItems = this.materialHandlingResultItems.filter(x=> x.materialHandlingItemId == mhg.id);

          if (mhResultItems.length > 0) {
            awkwardLoad = mhResultItems[0].awkwardLoad;
            forceFullPush = mhResultItems[0].forceFullPush;
            forceFullPull = mhResultItems[0].forceFullPull;
            isActive = mhResultItems[0].isActive;
          } 

          matHandling.isActive = isActive;
          matHandling.awkwardLoad = awkwardLoad;
          matHandling.forceFullPush = forceFullPush;
          matHandling.forceFullPull = forceFullPull;
          matHandling.materialHandlingItemId = mhg.id;
         
          this.mainMaterialHandlingList.push(matHandling);
          var occassionalIndex = mhResultItems.findIndex(x=> x.materialHandlingFreqId == EMaterialHandlingFrequency.Occasional);
          occasional = _.cloneDeep(matHandling);
          occasional.materialHandlingFreqId = EMaterialHandlingFrequency.Occasional;
          if (occassionalIndex > -1) {
            occasional.id = mhResultItems[occassionalIndex].id;
            occasional.value = this.convert(mhResultItems[occassionalIndex].value, units);
          } else {
            occasional.id = 0;
            occasional.value = 0;
          }
          this.occasionalMaterialHandlingList.push(occasional);
          
          var frequentIndex = mhResultItems.findIndex(x=> x.materialHandlingFreqId == EMaterialHandlingFrequency.Frequent);
          frequent = _.cloneDeep(matHandling);
          frequent.materialHandlingFreqId = EMaterialHandlingFrequency.Frequent;
          if (frequentIndex > -1) {
            frequent.id = mhResultItems[frequentIndex].id;
            frequent.value = this.convert(mhResultItems[frequentIndex].value, units);
          } else {
            frequent.id = 0;
            frequent.value = 0;
          }
          this.frequentMaterialHandlingList.push(frequent);
          
          var continuousIndex = mhResultItems.findIndex(x=> x.materialHandlingFreqId == EMaterialHandlingFrequency.Continuous);
          continuous = _.cloneDeep(matHandling);
          continuous.materialHandlingFreqId = EMaterialHandlingFrequency.Continuous;
          if (continuousIndex > -1) {
            continuous.id = mhResultItems[continuousIndex].id;
            continuous.value = this.convert(mhResultItems[continuousIndex].value, units);
          } else {
            continuous.id = 0;
            continuous.value = 0;
          }
          this.continuousMaterialHandlingList.push(continuous);
        });
        this.materialHandlingOutput = this.occasionalMaterialHandlingList.concat(this.frequentMaterialHandlingList).concat(this.continuousMaterialHandlingList);
        
    });
  } 
    
  constructor(private store: Store<JobFitAppState>) {
    this.store.dispatch(new FetchMaterialHandlingGroups());
   
    this.customerSettings$.subscribe(result => {
      this.customerSettings = result;
    });
  }


    ngOnInit(): void {
    }
    convert(val: number , unit:string | undefined): number{
      if(unit === 'lb'){
        return Math.round(val * 2.20462);
      }else{
        return val
      }
    }
    
}


