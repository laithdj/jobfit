import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { FetchMaterialHandlingGroups } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCustomerSettings, selectMaterialHandlingGroups } from 'src/app/store/job-fit.selectors';
import { CustomerCompanySettings } from '../../../shared/models/functional-analysis.model';
import { EMaterialHandlingFrequency, MaterialHandling, MaterialHandlingGroup } from '../../../shared/models/materialHandling.model';

@Component({
  selector: 'material-handling',
  templateUrl: './material-handling.component.html',
  styleUrls: ['./material-handling.component.css']
})
export class MaterialHandlingComponent implements OnInit {
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
  @Input() editMode: boolean = false;
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
  @Output() onChange =  new EventEmitter<MaterialHandling[]>();
  
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
    onInputChange(e:any,index:number, frequencyId: number, mhgId:number) {
      var value = e.value ?? 0;
      switch (frequencyId) {
        case EMaterialHandlingFrequency.Occasional:
        {
          this.occasionalMaterialHandlingList[index].value = value;
          break;
        }
        case EMaterialHandlingFrequency.Frequent:
        {
          this.frequentMaterialHandlingList[index].value = value;
          break;
        }
        case EMaterialHandlingFrequency.Continuous:
        {
          this.continuousMaterialHandlingList[index].value = value;
          break;
        }
      }
      var outputIndex = this.materialHandlingOutput.findIndex(x=> x.materialHandlingFreqId == frequencyId && x.materialHandlingItemId == mhgId);
      if (outputIndex > -1) {
        this.materialHandlingOutput[outputIndex].value = value;
      }
      this.onChange.emit(this.materialHandlingOutput);
    }
    onActiveChange(e: any, index: number){
      this.mainMaterialHandlingList[index].isActive = e.checked;
      this.occasionalMaterialHandlingList[index].isActive = e.checked;
      this.frequentMaterialHandlingList[index].isActive = e.checked;
      this.continuousMaterialHandlingList[index].isActive = e.checked;
      if (e.checked == false) {
        this.continuousMaterialHandlingList[index].value = 0;
        this.frequentMaterialHandlingList[index].value = 0;
        this.occasionalMaterialHandlingList[index].value = 0;
        this.continuousMaterialHandlingList[index].awkwardLoad = false;
        this.continuousMaterialHandlingList[index].forceFullPull = false;
        this.continuousMaterialHandlingList[index].forceFullPush = false;
        this.frequentMaterialHandlingList[index].awkwardLoad = false;
        this.frequentMaterialHandlingList[index].forceFullPull = false;
        this.frequentMaterialHandlingList[index].forceFullPush = false;
        this.occasionalMaterialHandlingList[index].awkwardLoad = false;
        this.occasionalMaterialHandlingList[index].forceFullPull = false;
        this.occasionalMaterialHandlingList[index].forceFullPush = false;
        this.mainMaterialHandlingList[index].awkwardLoad = false;
        this.mainMaterialHandlingList[index].forceFullPull = false;
        this.mainMaterialHandlingList[index].forceFullPush = false;
       
      }
      this.materialHandlingOutput = [];
      this.materialHandlingOutput = this.occasionalMaterialHandlingList.concat(this.frequentMaterialHandlingList).concat(this.continuousMaterialHandlingList);
      this.onChange.emit(this.materialHandlingOutput);
    }
    updateMaterialCheckboxes(e: any, checkbox: string, index:number) {
      switch(checkbox) {
        case "awkwardLoad":  
        {
           this.mainMaterialHandlingList[index].awkwardLoad = e.checked;
           this.occasionalMaterialHandlingList[index].awkwardLoad = e.checked;
           this.frequentMaterialHandlingList[index].awkwardLoad = e.checked;
           this.continuousMaterialHandlingList[index].awkwardLoad = e.checked;
           break;
        };
        case "forceFullPush": 
        {
          this.mainMaterialHandlingList[index].forceFullPush = e.checked;
          this.occasionalMaterialHandlingList[index].forceFullPush = e.checked;
          this.frequentMaterialHandlingList[index].forceFullPush = e.checked;
          this.continuousMaterialHandlingList[index].forceFullPush = e.checked;
          break;
        };
        case "forceFullPull": 
        {
          this.mainMaterialHandlingList[index].forceFullPull = e.checked;
          this.occasionalMaterialHandlingList[index].forceFullPull = e.checked;
          this.frequentMaterialHandlingList[index].forceFullPull = e.checked;
          this.continuousMaterialHandlingList[index].forceFullPull = e.checked;
          break;
        };
      }
      this.materialHandlingOutput.forEach(material => {
        if (this.mainMaterialHandlingList[index].materialHandlingItemId == material.materialHandlingItemId) {
          switch(checkbox) {
            case "awkwardLoad":
            { 
              material.awkwardLoad = e.checked;
              break;
            };
            case "forceFullPush": 
            { 
              material.forceFullPush = e.checked;
              break;
            };
            case "forceFullPull": 
            { 
              material.forceFullPull = e.checked;
              break;
            };
          }
        }
        return material;
      })
      this.onChange.emit(this.materialHandlingOutput);
    }
  }


