import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { filter, take } from 'rxjs/operators';
import { AuthorizeService } from '../api-authorization/authorize.service';
import { LoginComponent } from '../api-authorization/login/login.component';
import { SetBreadCrumb } from '../store/job-fit.actions';
import { JobFitAppState } from '../store/job-fit.reducers';
import { selectBreadCrumb } from '../store/job-fit.selectors';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {

  items: MenuItem[] = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'Jobs'},

  ];
  breadCrumb$ = this.store.pipe(select(selectBreadCrumb));


  constructor(private router: Router, private route: Router,
    private store: Store<JobFitAppState>,
    private loginComponent: LoginComponent,
    private authorizeService: AuthorizeService,
    ) {
      this.loginComponent.returnUrl = this.router.url;
      this.authorizeService.returnUrl = this.router.url;
      const isAuthenticated$ = this.authorizeService.isAuthenticated();
      isAuthenticated$.pipe(filter((auth: boolean) => auth === false), take(20))
        .subscribe(_ => this.router.navigate(['authentication/login']));
      this.store.dispatch(new SetBreadCrumb(this.items));
   }
  ngOnInit(): void {
  }
}



