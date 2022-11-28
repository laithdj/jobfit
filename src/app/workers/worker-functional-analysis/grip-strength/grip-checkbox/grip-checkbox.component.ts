import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Grips } from 'src/app/shared/models/grips.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';

@Component({
  selector: 'worker-grip-checkbox',
  templateUrl: './grip-checkbox.component.html',
  styleUrls: ['./grip-checkbox.component.css']
})
export class GripCheckboxComponent implements OnInit {
  gripValue: boolean | undefined = false;
  @Input() editMode: boolean = false;
  @Input() isEnabled: boolean = false;
  @Input() isTested: boolean = false;
  @Input() gripSideId: number = 0;
  @Input() gripItemId: number = 0;
  @Output() onChange =  new EventEmitter<Grips>();
  

  constructor(private store: Store<JobFitAppState>) {
    this.gripValue = this.isTested;
  }

  ngOnInit(): void {
  }
  onValueChange(e:any, gripItemId: number, sideId:number){
    let grip = new Grips();
    grip.gripItemId = gripItemId;
    grip.gripSideId = sideId;
    grip.isTested = e.checked;
    
    this.onChange.emit(grip);

    }
}

