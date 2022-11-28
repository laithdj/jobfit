import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { selectLanguage, selectUserDetails } from 'src/app/store/job-fit.selectors';
import * as _ from 'lodash';
import { AppState } from 'src/app/app.state';
import { SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { AuthorizeService } from 'src/app/api-authorization/authorize.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import { HomePageService } from '../home-page.service';
import { QuickSearchOption } from 'src/app/shared/models/quickSearchOption.model';
import { Title } from '@angular/platform-browser';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  quickSearchOptions: QuickSearchOption[] = [];
  filteredOptions: QuickSearchOption[] = [];
  selectedOption: QuickSearchOption = new QuickSearchOption();
  userDetails$ = this.store.pipe(select(selectUserDetails));
  user:User = new User();
  userLoaded = false;
  public isAuthenticated: Observable<boolean> | undefined;
  errorMessage = '';
  companyLogo = '';
  error = false;
  defaultLogo = '';
  useDefaultLogo = false;
  cache = {} as { [key: string]: any };
  isBusy = false;
  nextSearchQuery = '';

  constructor(private translateService: TranslateService,
    private homePageService: HomePageService,
    private authorizeService: AuthorizeService,
    private taskService: TasksService,
    private titleService: Title,
    private router: Router,
    private store: Store<AppState>) {
      this.homePageService.homePage = true;
      this.isAuthenticated = this.authorizeService.isAuthenticated();
      this.store.dispatch(new ShowSideMenu(false));
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.isAuthenticated.pipe(filter((auth: boolean) => auth === false), take(1))
      .subscribe(_ => this.router.navigate(["/authentication/login"]));
      this.titleService.setTitle('JobFit On Demand');
      this.getCompanySettings();
      this.userDetails$.subscribe(result => {
        if(result){
          this.user = result;
          setTimeout(() => {
            this.userLoaded = true;
          }, 200);
        }
      });
   }

  ngOnInit(): void {
    /*
    this.language$.pipe().subscribe((lang) => {
      console.log(lang);
      this.translateService.setDefaultLang(lang ? _.cloneDeep(lang) : 'en');
      this.translateService.use(localStorage.getItem('lang' ? _.cloneDeep(lang) : 'en') || 'en');
    });
    */
  }

  getQuickSearch(term: string){
    this.homePageService.getQuickSearchList(term).subscribe(response => {
      this.quickSearchOptions = response;

    });
  }
  getCompanySettings(){
    this.taskService.getSettings().subscribe(response => {
      this.companyLogo = response.customisedLogo?.imageContent;
      this.defaultLogo = response.defaultLogo?.imageContent;
      this.useDefaultLogo = response.useDefaultLogo;
    });
  }

  goTo(){
    if(this.selectedOption?.type?.length < 1){
      this.error = true;
      this.errorMessage = "Please select a report."
    } else
    if(this.selectedOption?.type === 'Providers'){
      this.error = true;
      this.errorMessage = "Providers does not have reports."
    } else  if(this.filteredOptions?.length < 1){
      this.error = true;
      this.errorMessage = "No results found."
    } else {
      if(this.selectedOption.type === "Tasks"){
        let id = this.selectedOption.originalRevisionId ? this.selectedOption.originalRevisionId : this.selectedOption.id;
        this.router.navigate(["/tasks/tasks-details/" + id]);
      }
      if(this.selectedOption.type === "Jobs"){
        let id = this.selectedOption.originalRevisionId ? this.selectedOption.originalRevisionId : this.selectedOption.id;
        this.router.navigate(["/jobs/jobs-details/" + id]);
      }
      if(this.selectedOption.type === "Workers"){
        let id = this.selectedOption.originalRevisionId ? this.selectedOption.originalRevisionId : this.selectedOption.id;
        this.router.navigate(["/workers/workers-details/" + id]);
      }
    }
  }
  goToReport(){
    if(this.selectedOption?.type?.length < 1){
      this.error = true;
      this.errorMessage = "Please select a report."
    } else
    if(this.selectedOption?.type === 'Providers'){
      this.error = true;
      this.errorMessage = "Providers does not have reports."
    } else       if(this.filteredOptions?.length < 1){
      this.error = true;
      this.errorMessage = "No results found."
    } else {
      if(this.selectedOption.type === "Tasks"){
        let id = this.selectedOption.originalRevisionId ? this.selectedOption.originalRevisionId : this.selectedOption.id;
        //  this.router.navigate(["/reports/task/" + this.selectedOption.originalRevisionId]);
          const url = this.router.serializeUrl(
            this.router.createUrlTree(["/reports/task/" + id])
          );
          window.open(url);
        }
        if(this.selectedOption.type === "Jobs"){
          let id = this.selectedOption.originalRevisionId ? this.selectedOption.originalRevisionId : this.selectedOption.id;
        //  this.router.navigate(["/reports/job/" + this.selectedOption.originalRevisionId]);
          const url = this.router.serializeUrl(
            this.router.createUrlTree(["/reports/job/" + id])
          );
          window.open(url);
        }
        if(this.selectedOption.type === "Workers"){
          let id = this.selectedOption.originalRevisionId ? this.selectedOption.originalRevisionId : this.selectedOption.id;
          const url = this.router.serializeUrl(
            this.router.createUrlTree(["/reports/worker/" + id ])
          );
          window.open(url);
        //  this.router.navigate(["/reports/job/" + this.selectedOption.originalRevisionId]);
        }
    }

  }
  filterOption(e: any) {
    let filtered : any[] = [];
    let query = e.query;

    // limit how many requests we send off whilst waiting
    if (this.isBusy) {
      this.nextSearchQuery = query;
    }

    if (!this.cache[query] && !this.isBusy) {
      this.isBusy = true;
      this.nextSearchQuery = '';
      this.homePageService.getQuickSearchList(query).subscribe(response => {
        this.cache[query] = response;
        this.quickSearchOptions = response;
        this.filteredOptions = this.quickSearchOptions;
        if(this.filteredOptions.length < 1){
          this.error = true;
          this.errorMessage = "No results found."
        }
        this.isBusy = false;
        // if we have a pending search query, send it now
        if (this.nextSearchQuery != '') {
          this.filterOption({ query: this.nextSearchQuery });
        }
      });
    } else {
      if (this.cache[query]) {
        this.quickSearchOptions = this.cache[query];
        this.filteredOptions = this.quickSearchOptions;
        if(this.filteredOptions.length < 1){
          this.error = true;
          this.errorMessage = "No results found."
        }
      }
    }
  }
}
