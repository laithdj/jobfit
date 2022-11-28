import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { JobFitAppState } from '../store/job-fit.reducers';
import { selectBreadCrumb } from '../store/job-fit.selectors';

@Component({
  selector: 'app-job-fitting',
  templateUrl: './job-fitting.component.html',
  styleUrls: ['./job-fitting.component.css']
})
export class JobFittingComponent implements OnInit {
  breadCrumb$ = this.store.pipe(select(selectBreadCrumb));

  constructor(private store: Store<JobFitAppState>,
    ) { }

  ngOnInit(): void {
  }

}
