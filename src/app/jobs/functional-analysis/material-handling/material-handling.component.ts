import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { FetchCustomerSettings, FetchMaterialHandlingGroups, UpdateCurrentFunctionalAnalysis } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis, selectCustomerSettings, selectMaterialHandlingGroups } from 'src/app/store/job-fit.selectors';
import { CustomerCompanySettings, FunctionalAnalysis } from '../../../shared/models/functional-analysis.model';
import { MaterialHandling, MaterialHandlingGroup } from '../../../shared/models/materialHandling.model';

@Component({
  selector: 'material-handling',
  templateUrl: './material-handling.component.html',
  styleUrls: ['./material-handling.component.css']
})
export class MaterialHandlingComponent implements OnInit {
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  materialHandlingGroups$ = this.store.pipe(select(selectMaterialHandlingGroups));
  @Input() currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  materialHandlingGroups: MaterialHandlingGroup[] = [];
  materialHandlings: MaterialHandling[] = [];
  @Output() materialHandlingOutput =  new EventEmitter<MaterialHandling>();
  enableRow = false;
  tester = true;
  @Input() editMode: boolean = false;
  customerSettings$ = this.store.pipe(select(selectCustomerSettings));
  customerSettings: CustomerCompanySettings = new CustomerCompanySettings();

  constructor(private store: Store<JobFitAppState>) {
    this.store.dispatch(new FetchMaterialHandlingGroups());
    this.materialHandlingGroups$.subscribe(result => {
      this.materialHandlingGroups = result;
    });
    this.currentFunctionalAnalysis$.subscribe(result => {
      if(result){
        this.currentFunctionalAnalysis = result;
        if(result.materialHandlingResults.length > 0){
          this.materialHandlings = _.cloneDeep(result.materialHandlingResults);
        }
      }
    });
    this.store.dispatch(new FetchCustomerSettings());
    this.customerSettings$.subscribe(result => {
      this.customerSettings = result;
    });
   }

  ngOnInit(): void {
  }
  
  onValueChange(e: any, checkbox?:string){
    if (checkbox === 'enable' && e.isActive) {
      this.addMaterial(e);
    } else if (checkbox === 'enable' && !e.isActive) {
      this.removeMaterial(e)
    } else if (checkbox) {
      this.updateMaterialCheckboxes(e, checkbox)
    } else {
      this.updateMaterialValue(e)
    }

    const updatedFA: FunctionalAnalysis = {
      ...this.currentFunctionalAnalysis,
      materialHandlingResults: this.materialHandlings,
    }
    this.store.dispatch(new UpdateCurrentFunctionalAnalysis(updatedFA));
  }
  addMaterial(e: any) {
    const updatedMaterial = { ...e, value: e.value };
    this.materialHandlings = [...this.materialHandlings, updatedMaterial];
  }
  removeMaterial(e: any) {
    this.materialHandlings = this.materialHandlings.filter(material => !this.sameItemId(material, e));
  }
  updateMaterialCheckboxes(e: any, checkbox: string) {
    this.materialHandlings = this.materialHandlings.map(material => {
      if (this.sameItemId(material, e)) {
        switch(checkbox) {
          case "awkwardLoad": return { ...material, awkwardLoad: e.awkwardLoad};
          case "forceFullPush": return { ...material, forceFullPush: e.forceFullPush };
          case "forceFullPull": return { ...material, forceFullPull: e.forceFullPull };
        }
      }
      return material;
    })
  }
  updateMaterialValue(e: any) {
    const indexOfExistingMaterial = this.materialHandlings.findIndex(x => this.sameItemId(x, e) && this.sameFreqId(x, e));
    this.materialHandlings = this.materialHandlings.map((material, index) => {
      return index === indexOfExistingMaterial
        ? { ...material, value: e.value }
        : material
    })
  }
  sameItemId(a: MaterialHandling, b: MaterialHandling) {
    return a.materialHandlingItemId === b.materialHandlingItemId;
  }
  sameFreqId(a: MaterialHandling, b: MaterialHandling) {
    return a.materialHandlingFreqId === b.materialHandlingFreqId
  }
}
