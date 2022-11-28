import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { empty, Observable, Subscription, SubscriptionLike  } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthorizeService } from './api-authorization/authorize.service';
import { FetchFunctionListPermissions } from './store/job-fit.actions';
import { JobFitAppState } from './store/job-fit.reducers';
import { selectLanguage, selectShowSideMenu, selectSideMenu } from './store/job-fit.selectors';
import { TasksService } from './tasks/tasks-service.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'jobfitondemand';
  menuList: MenuItem[] = [];
  showSideMenu$ = this.store.pipe(select(selectShowSideMenu));
  menuList$ = this.store.pipe(select(selectSideMenu));
  menuLists: MenuItem[] = [];
  baseUrl: string = '';
  location = '';
  public profile: Observable<any> | undefined;
  subscription: Subscription | null = null;

  constructor(private store: Store<JobFitAppState>,
    private authorizeService: AuthorizeService,
    ) {
    this.location = document.getElementsByTagName('base')[0].href;
    if (this.location.startsWith("http://localhost")) {
      this.baseUrl = "https://localhost:5051/"
    } else if (this.location.startsWith("https://jodapptest.z8.web.core.windows.net")) {
      this.baseUrl = "https://jobfitondemand.azurewebsites.net/"
    } else {
      this.baseUrl = "https://localhost:5051/"
    }
  }
  ngOnInit() {
    this.profile = this.authorizeService.getUser();
    if (this.subscription == null)
    {
      this.subscription = this.profile.subscribe((result:any) => {
        this.store.dispatch(new FetchFunctionListPermissions());
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
  }
}
