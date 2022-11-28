import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectTaskDetails } from 'src/app/store/job-fit.selectors';

@Component({
  selector: 'tree-checkbox',
  templateUrl: './tree-checkbox.component.html',
  styleUrls: ['./tree-checkbox.component.css']
})
export class TreeCheckboxComponent implements OnInit {
  @Input() id: number = 0;
  checkBoxValue = false;
  taskDetails$ = this.store.pipe(select(selectTaskDetails));

  constructor(private store: Store<JobFitAppState>) { }

  ngOnInit(): void {
    this.taskDetails$.subscribe(result => {
      result.groups.forEach(element => {
        if(element.id === this.id){
          this.checkBoxValue = true;
        }
      });
    });
  }
}
