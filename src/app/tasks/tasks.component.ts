import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { take, filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { AuthorizeService } from '../api-authorization/authorize.service';
import { SetBreadCrumb, SetSideMenu } from '../store/job-fit.actions';
import { JobFitAppState } from '../store/job-fit.reducers';
import { selectBreadCrumb } from '../store/job-fit.selectors';
import { LoginComponent } from '../api-authorization/login/login.component';
import { ReturnUrlType } from '../api-authorization/api-authorization.constants';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  items: MenuItem[] = [
    {icon: 'pi pi-home', url: 'home'},
    {label:'Tasks'},

  ];
  breadCrumb$ = this.store.pipe(select(selectBreadCrumb));
  isAuthenticated: any;

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
