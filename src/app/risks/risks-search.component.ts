import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { JobFitAppState } from '../store/job-fit.reducers';
import { SetBreadCrumb } from '../store/job-fit.actions';
import { selectBreadCrumb } from '../store/job-fit.selectors';

@Component({
  selector: 'app-risks-search',
  templateUrl: './risks-search.component.html',
  styleUrls: ['./risks-search.component.css']
})
export class RisksSearchComponent implements OnInit {
  items: MenuItem[] = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'Risk Search'},
  ];
  breadCrumb$ = this.store.pipe(select(selectBreadCrumb));


  constructor(private router: Router, private route: Router,
    private store: Store<JobFitAppState>,
    ) {
      this.store.dispatch(new SetBreadCrumb(this.items));
   }
  ngOnInit(): void {
  }
}
