import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { select, Store } from '@ngrx/store';
import { SetBreadCrumb } from '../store/job-fit.actions';
import { selectBreadCrumb } from '../store/job-fit.selectors';
import { JobFitAppState } from '../store/job-fit.reducers';

@Component({
  selector: 'app-job-fitting-criteria',
  templateUrl: './job-fitting-criteria.component.html',
  styleUrls: ['./job-fitting-criteria.component.css']
})
export class JobFittingCriteriaComponent implements OnInit {
  items: MenuItem[] = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'...'},
  ];
  breadCrumb$ = this.store.pipe(select(selectBreadCrumb));

  constructor(private store: Store<JobFitAppState>,) {
    this.store.dispatch(new SetBreadCrumb(this.items));
  }

  ngOnInit(): void {
  }

}
