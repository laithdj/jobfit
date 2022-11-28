import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Grips } from 'src/app/shared/models/grips.model';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectJobsFunctionalAnalysis } from 'src/app/store/jobs-store/jobs.selectors';

@Component({
  selector: 'jobs-grip-input-box',
  templateUrl: './jobs-grip-input-box.component.html',
  styleUrls: ['./jobs-grip-input-box.component.css']
})
export class JobsGripInputBoxComponent implements OnInit {

  @Input() gripItem: number = 0;
  @Input() editMode: boolean = false;
  @Input() sideId: number = 0;
  @Input() units: string | undefined = '';
  @Output() gripsOutput =  new EventEmitter<Grips>();
  jobsFunctionalAnalysis$ = this.store.pipe(select(selectJobsFunctionalAnalysis));
  gripItemResults: Grips[] = [];
  grips: Grips | undefined = new Grips();
  gripValue: number | undefined = 0;
  
  constructor(private store: Store<JobsAppState>) { }

  ngOnInit(): void {
    this.jobsFunctionalAnalysis$.subscribe(result => {
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
