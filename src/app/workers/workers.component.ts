import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { JobFitAppState } from '../store/job-fit.reducers';
import { WorkersService } from './workers.service';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from '../store/job-fit.actions';
import { selectBreadCrumb } from '../store/job-fit.selectors';
import { LoginComponent } from '../api-authorization/login/login.component';
import { AuthorizeService } from '../api-authorization/authorize.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.css']
})
export class WorkersComponent implements OnInit {
  items: MenuItem[] = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'Workers'},

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
