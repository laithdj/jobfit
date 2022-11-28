import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Grips } from 'src/app/shared/models/grips.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis } from 'src/app/store/job-fit.selectors';
import * as _ from 'lodash';

@Component({
  selector: 'grip-input-box',
  templateUrl: './grip-input-box.component.html',
  styleUrls: ['./grip-input-box.component.css']
})
export class GripInputBoxComponent implements OnInit {
  @Input() gripItem: number = 0;
  @Input() editMode: boolean = false;
  @Input() sideId: number = 0;
  @Input() units: string | undefined = '';
  @Output() gripsOutput =  new EventEmitter<Grips>();
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  gripItemResults: Grips[] = [];
  grips: Grips | undefined = new Grips();
  gripValue: number | undefined = 0;
  
  constructor(private store: Store<JobFitAppState>) { }

  ngOnInit(): void {
    this.currentFunctionalAnalysis$.subscribe(result => {
      if (result) {
        this.gripItemResults = result.gripItemResults;
        const valueFind = this.gripItemResults.find(x => x.gripItemId === this.gripItem && x.gripSideId === this.sideId);
        this.gripValue = valueFind ?  Math.round(this.convert(valueFind.value, this.units)) : undefined;
        this.grips = _.cloneDeep(valueFind);
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
  onValueChange(e: any) {
    const newValue = (e.value <= 0 || null || undefined) ? 0 : e.value;
    if (this.grips) {
      this.grips.value = newValue;
      this.gripsOutput.emit(this.grips);
    } else {
      let grips = new Grips();
      grips.gripItemId = this.gripItem;
      grips.gripSideId = this.sideId;
      grips.value = newValue;
      this.gripsOutput.emit(grips);
    }
  }
}
