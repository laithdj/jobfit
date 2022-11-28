import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MaterialHandling } from 'src/app/shared/models/materialHandling.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis } from 'src/app/store/job-fit.selectors';

@Component({
  selector: 'material-result',
  templateUrl: './material-result.component.html',
  styleUrls: ['./material-result.component.css']
})
export class MaterialResultComponent implements OnInit {

  materialValue: number | undefined = 0;
  materialHandlingResults: MaterialHandling[] = [];
  active:boolean = false;
  materialHandling:MaterialHandling | undefined = new MaterialHandling();
  @Input() materialId: number = 0;
  @Input() disabled: boolean = false;
  @Input() editMode: boolean = false;
  @Input() materialHandlingFreqId: number = 0;
  @Input() units: string | undefined = '';
  @Input() materialHandlingItemId: number = 0;
  @Output() materialHandlingOutput =  new EventEmitter<MaterialHandling>();
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));

  constructor(private store: Store<JobFitAppState>) {}

  ngOnInit(): void {
    this.currentFunctionalAnalysis$.subscribe(result => {
      if(result){
        this.materialHandlingResults = result.materialHandlingResults;
        let valueFind = this.materialHandlingResults.find(x => ((x.materialHandlingItemId === this.materialId) && (x.materialHandlingFreqId === this.materialHandlingFreqId)));
        this.materialValue = valueFind ?  Math.round(this.convert(valueFind.value, this.units)) : undefined;
        this.materialHandling = _.cloneDeep(valueFind);
        this.active = valueFind ? true : false;
      }
    });
  }
  convert(val: number , unit:string | undefined): number{
    if(unit === 'lb'){
      return val * 2.20462 
    }else{
      return val
    }
  }
  onValueChange(e:any){
    if(this.materialHandling){
      this.materialHandling.value = e.value;
      this.materialHandlingOutput.emit(this.materialHandling);
    } else{
      let matHandling = new MaterialHandling();
      matHandling.materialHandlingFreqId = this.materialHandlingFreqId;
      matHandling.materialHandlingItemId = this.materialHandlingItemId;
      matHandling.value = e.value;
      this.materialHandlingOutput.emit(matHandling);
    }
  }
}
