import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { nextNearest } from 'src/app/shared/helper/calculations';
import { CustomerCompanySettings } from 'src/app/shared/models/functional-analysis.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCustomerSettings } from 'src/app/store/job-fit.selectors';
import { FetchMaterialHandlingGroups } from 'src/app/store/workers-store/workers.actions';
import { selectMaterialHandlingGroups } from 'src/app/store/workers-store/workers.selectors';
import { ContinuousFormula, EMaterialHandlingFrequency, FrequentFormula, MaterialHandling, MaterialHandlingGroup, OccasionalFormula } from '../../../shared/models/materialHandling.model';

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
  materialHandlingList: MaterialHandling[] = [];
  frequentValues: string[]=[];
  continuousValues: string[]=[];
  occasion: number | undefined = 0;
  frequent: number | undefined  = 0;
  continuous: number | undefined  = 0;
  @Input() editMode: boolean = false;
  @Input() set materialHandlingResults( materialHandlingResults: MaterialHandling[] ) {
    this.materialHandlingResultItems = materialHandlingResults;
    this.materialHandlingGroups$.subscribe(result => {
      this.materialHandlingGroups = result;
      this.materialHandlingList = [];
      this.frequentValues = [];
      this.continuousValues = [];
      this.materialHandlingGroups.forEach((mhg) => {
          let matHandling = new MaterialHandling();
          var index = this.materialHandlingResultItems.findIndex(x=> x.materialHandlingItemId == mhg.id && x.materialHandlingFreqId == EMaterialHandlingFrequency.Occasional);
          if (index > -1) {
            matHandling.id = this.materialHandlingResultItems[index].id;
            matHandling.isActive = this.materialHandlingResultItems[index].isActive;
            matHandling.value = this.materialHandlingResultItems[index].value;
          } else {
            matHandling.id = 0;
            matHandling.isActive = false;
            matHandling.value = 0;
          }
          matHandling.materialHandlingItemId = mhg.id;
          matHandling.materialHandlingFreqId = EMaterialHandlingFrequency.Occasional;
          this.materialHandlingList.push(matHandling);
          var freqValue = this.calculateValue(matHandling.value, EMaterialHandlingFrequency.Frequent)
          this.frequentValues.push(freqValue);
          var continouosValue = this.calculateValue(matHandling.value, EMaterialHandlingFrequency.Continuous)
          this.continuousValues.push(continouosValue);
        });
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
    onInputChange(e:any) {
        var id = e?.originalEvent?.currentTarget?.id;
        var value = e.value ?? 0;
        if (id) {
          var index = this.materialHandlingList.findIndex(x=> x.materialHandlingItemId == Number(id) && x.materialHandlingFreqId == EMaterialHandlingFrequency.Occasional);
          if (index > -1) {
            this.materialHandlingList[index].value = value;
            this.frequentValues[index] = this.calculateValue(value, EMaterialHandlingFrequency.Frequent);
            this.continuousValues[index] = this.calculateValue(value, EMaterialHandlingFrequency.Continuous);
            this.materialHandlingList[index].isActive = value == 0? false : true;
          }
        }
        this.onChange.emit(this.materialHandlingList);
    }
    onActiveChange(e: any, index: number){
      this.materialHandlingList[index].isActive = e.checked;
      if (e.checked == false) {
        this.materialHandlingList[index].value = 0;
        this.frequentValues[index] = '0';
        this.continuousValues[index] = '0';
      }
      
      this.onChange.emit(this.materialHandlingList);
    }
    calculateValue(val:number, materialFrequencyId: number) {
      switch (materialFrequencyId) {
        case EMaterialHandlingFrequency.Occasional:
          return nextNearest((val * OccasionalFormula), .1).toFixed(1);
        case EMaterialHandlingFrequency.Frequent:
          return nextNearest((val * FrequentFormula), .1).toFixed(1);
        case EMaterialHandlingFrequency.Continuous:
          return nextNearest((val * ContinuousFormula), .1).toFixed(1);
      }
      return '0';
    }

  }


