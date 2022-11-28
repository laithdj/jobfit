import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { AppConfig } from '../app.config';
import { Subject, Subscription } from 'rxjs';
import { AppState } from '../app.state';
import { HomePageService } from '../home-page/home-page.service';
import { QuickSearchOption } from '../shared/models/quickSearchOption.model';
import { selectFunctionList } from '../store/job-fit.selectors';
import { differenceInMilliseconds} from 'date-fns';
import { AuthorizeService } from '../api-authorization/authorize.service';
import * as moment from 'moment';
import { EFunctions } from '../shared/models/user.model';
import { SetError } from '../app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from '../shared/models/alertPopUp.model';

@Component({
  selector: 'nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  @HostListener('window:focus')
  windowFocus() {
    let currentCountdownTimeInSeconds = localStorage.getItem('jod_countdownTimeInSeconds');
    if (currentCountdownTimeInSeconds) {
      clearInterval(this.countdownIntervalId);
      this.showTimeoutPopUp = true;
      this.currentCountdownTimeInSeconds = parseInt(currentCountdownTimeInSeconds);
      this.startCountdownTimer();
    } else {
      // clear our countdown timer and restart listening for inactivity
      if (!this.showTimeoutPopUp) {
        clearInterval(this.countdownIntervalId);
        this.currentCountdownTimeInSeconds = -1;
        this.setInactivityTimeout();
      }
    }
  }

  @HostListener('window:keydown')
  @HostListener('window:mousedown')
  userActivity() {
    if (!this.showTimeoutPopUp) {
      if (!this.hasRecentActivity() && !this.authorizeService.isAuthenticated()) {
        // remove any timeout settings
        this.logout();
        localStorage.setItem('jod_activityTimeWho', 'userActivity!hasRecentActivity:win-key-sign-out-remove-act-time');
        return;
      }
      localStorage.setItem('jod_activityTime', moment(new Date()).toString());
      localStorage.setItem('jod_activityTimeWho', 'window:keydown:mousedown');
      this.checkSessionTime();
      this.setInactivityTimeout();
    }
  }
  userInactive: Subject<any> = new Subject();
  inactivityTimeout = 9 * (60 * 1000); // in minutes (default: 9 minutes - configurable in assets/config.json)
  countdownTimeInSeconds = 60; // in seconds (the warning is displayed for this long, after the inactivityTimeout length)
  currentCountdownTimeInSeconds = 0; // used to display to user
  checkInactivityTimeoutInterval = 30 * 1000; // in seconds (default: 30 seconds), will ensure our timeout event is consistent
  countdownIntervalId:any;
  showDropdown = false;
  showSearchBar = false;
  selectedOption: QuickSearchOption = new QuickSearchOption();
  filteredOptions: QuickSearchOption[] = [];
  quickSearchOptions: QuickSearchOption[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList: number[] = [];
  authorisedList: boolean[] =[];
  showAdminPopUp = false;
  showAboutPopUp = false;
  showTimeoutPopUp = false;
  aboutText = '';
  adminUrl = '';
  sessionId = '';
  session: any;
  count = 0;
  items: MenuItem[] = new Array();
  languages = [
    {name: 'English', code: 'en'},
    {name: 'French', code: 'fr'},
  ];
  inactivityTimeoutId: any = null;
  checkInactivityTimeoutId: any = null;
  subscription: Subscription | null = null;

  constructor(private store: Store<AppState>,
    private router: Router,
    private authorizeService: AuthorizeService,
    private homePageService: HomePageService,
    @Inject('APP_CONFIG') appConfig: AppConfig,
    private route: Router) {
    let inactivityTimeoutInMinutes = parseFloat(appConfig.InactivityTimeout);
    this.inactivityTimeout = (isNaN(inactivityTimeoutInMinutes) ? 9 : inactivityTimeoutInMinutes) * (60 * 1000);
    this.subscribeToSessionUpdates();
    this.renewSession();

    // This gets triggered when a user has been inactive for the set [inactivityTimeout] time
    this.userInactive.subscribe((message) => {
      // Note: this can be triggered from any window even, inactive ones so check for last activity
      let lastActivityTime = localStorage.getItem('jod_activityTime');
      let diff = differenceInMilliseconds(new Date() , moment(lastActivityTime).toDate());

      if (diff > this.inactivityTimeout) {
        this.showTimeoutPopUp = true;
        this.currentCountdownTimeInSeconds = this.countdownTimeInSeconds;
        this.startCountdownTimer();
      }
    }

    );
    this.adminUrl = appConfig.AdminUrl;
    this.aboutText = `Version: ${appConfig.VersionNumber} (${appConfig.ReleaseNumber} [${appConfig.ShortSHA}] at ${appConfig.ReleaseTime})`;

    if(window.location.href === 'http://localhost:4200/'){
      this.showSearchBar = false;
    } else{
      this.showSearchBar = true;
    }
  }

  ngOnInit() {
    this.setInactivityTimeout(); // the long (9 minute) timeout
    this.setCheckInactivityTimeout(); // shorter interval supervisor to ensure inactivity timeout is consistent

    this.functionList$.subscribe((result:any) => {
      var local = JSON.parse(localStorage.getItem("functionList") ?? "");
      if (local.length < 1) {
        this.functionList = result;
      } else {
        this.functionList = local;
      }
      this.authorisedList = [];
      this.authorisedList.push(this.isFunctionValid(EFunctions.ViewWorkers));
      this.authorisedList.push(this.isFunctionValid(EFunctions.ViewTasks));
      this.authorisedList.push(this.isFunctionValid(EFunctions.ViewJobs));
      this.authorisedList.push(this.isFunctionValid(EFunctions.SearchRisks));
      this.authorisedList.push(this.isFunctionValid(EFunctions.ViewDepartmentManager));

      //Set the View function to true when C/U/D is on for Worker
      this.authorisedList.push(this.isFunctionValid(EFunctions.AddWorker));
      this.authorisedList.push(this.isFunctionValid(EFunctions.EditWorker));
      this.authorisedList.push(this.isFunctionValid(EFunctions.DeleteWorker));
      if (this.authorisedList[5] || this.authorisedList[6] || this.authorisedList[7]) {
        this.authorisedList[0] = true;
      }
      //Set the View function to true when C/U/D is on for Task
      this.authorisedList.push(this.isFunctionValid(EFunctions.AddTask));
      this.authorisedList.push(this.isFunctionValid(EFunctions.EditTask));
      this.authorisedList.push(this.isFunctionValid(EFunctions.DeleteTask));
      if (this.authorisedList[8] || this.authorisedList[9] || this.authorisedList[10]) {
        this.authorisedList[1] = true;
      }
      //Set the View function to true when C/U/D is on for Job
      this.authorisedList.push(this.isFunctionValid(EFunctions.AddJob));
      this.authorisedList.push(this.isFunctionValid(EFunctions.EditJob));
      this.authorisedList.push(this.isFunctionValid(EFunctions.DeleteJob));
      if (this.authorisedList[11] || this.authorisedList[12] || this.authorisedList[13]) {
        this.authorisedList[2] = true;
      }

      this.items = [{
          label: 'Dashboard',
          routerLink:'/home',
          command: () => this.goToRoute("/home", true),
          disabled: false
        },
        {
          label: 'Workers',
          routerLink: this.authorisedList[0] ?  '/workers': undefined,
          command: () => this.goToRoute("/workers", this.authorisedList[0]),
          styleClass: this.authorisedList[0] ? '': 'disabled-link'
        },
        {

          label: 'Tasks',
          routerLink: this.authorisedList[1] ?  '/tasks': undefined,
          command: () => this.goToRoute("/tasks", this.authorisedList[1]),
          styleClass: this.authorisedList[1] ? '': 'disabled-link'
        },
        {
          label: 'Jobs',
          routerLink: this.authorisedList[2] ? '/jobs' : undefined,
          command: () => this.goToRoute("/jobs", this.authorisedList[2]),
          styleClass: this.authorisedList[2] ? '': 'disabled-link'
        },
        {
          label: 'Risks',
          routerLink: this.authorisedList[3] ? '/risks': undefined,
          command: () => this.goToRoute("/risks", this.authorisedList[3]),
          styleClass: this.authorisedList[3] ? '': 'disabled-link'
        },
        {
          label: 'Departments',
          routerLink: this.authorisedList[4] ? '/departments' : undefined,
          command: () => this.goToRoute("/departments", this.authorisedList[4]),
          styleClass: this.authorisedList[4] ? '': 'disabled-link'
        },
        {
          label: 'Reports', // TODO: Renaming for now but this needs be updated to have it's own module/route
        //  url:'/configuration',
        //  routerLink:'/configuration',
          command: () => this.showAdminPopUp = true,
        },
      ];
    });
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? true : false;
  }
  subscribeToSessionUpdates(){
    if (this.subscription == null) {
      this.subscription = this.authorizeService.getUser().subscribe((result:any) => {
        this.session = result;
      });
    }
  }
  startCountdownTimer() {
    this.countdownIntervalId = setInterval(() => {
      // has someone clicked the I'm here button or made an attempt to be active?
      let lastActivityTime = localStorage.getItem('jod_activityTime');
      let diff = differenceInMilliseconds(new Date(), moment(lastActivityTime).toDate());
      if (diff < this.inactivityTimeout) {
        clearInterval(this.countdownIntervalId);
        localStorage.removeItem('jod_countdownTimeInSeconds');
        this.currentCountdownTimeInSeconds = -1;
        this.renewSession();
        this.setInactivityTimeout();
        this.showTimeoutPopUp = false;
        return;
      }

      if (this.currentCountdownTimeInSeconds > 0) {
        this.currentCountdownTimeInSeconds--;
        // re-sync countdown timers if there are multiple windows
        let currentCountdownTimeInSecondsRaw = localStorage.getItem('jod_countdownTimeInSeconds');
        if (currentCountdownTimeInSecondsRaw) {
          let updatedCurrentCountdownTimeInSeconds = parseInt(currentCountdownTimeInSecondsRaw);
          if (this.currentCountdownTimeInSeconds > updatedCurrentCountdownTimeInSeconds) {
            this.currentCountdownTimeInSeconds = updatedCurrentCountdownTimeInSeconds;
          }
        }
        localStorage.setItem('jod_countdownTimeInSeconds', this.currentCountdownTimeInSeconds.toString());
      } else if (this.currentCountdownTimeInSeconds <= 0) {
        clearInterval(this.countdownIntervalId);
        // remove any timeout settings
        this.logout();
        localStorage.setItem('jod_activityTimeWho', 'startCountdownTimer:timer-ended');
      }
    }, 1000);
  }
  startSilentRenewToken() {
    localStorage.removeItem('jod_countdownTimeInSeconds');
    this.renewSession();
    this.currentCountdownTimeInSeconds = -1;
    clearInterval(this.countdownIntervalId);
    localStorage.setItem('jod_activityTime', moment(new Date()).toString());
    localStorage.setItem('jod_activityTimeWho', 'startSilentRenewToken');
    this.setInactivityTimeout();
    this.showTimeoutPopUp = false;
  }
  reloadPage() {
    window.location.reload();
  }
  checkSessionTime() {
    if (this.session != null) {
      let expTime = new Date(this.session?.expires_at * 1000);
      localStorage.setItem('jod_actSessionExpiryTime', moment(expTime).toString());

      if ((new Date()) > expTime) {
        this.renewSession();
      }
    }
  }
  hasRecentActivity() {
    let lastActivityTime = localStorage.getItem('jod_activityTime');
    if (lastActivityTime) {
      let diff = differenceInMilliseconds(new Date(), moment(lastActivityTime).toDate());
      // have we got a recorded activity time outside of the inactive grace period 10mins?
      return ((this.inactivityTimeout - diff) >= 0);
    }
    // nothing has been set meaning we are starting a session
    return true;
  }
  renewSession() {
    // this call will silent sign in again if possible
    this.authorizeService.checkSignIn();
  }
  // reset our listening for inactivity
  setInactivityTimeout() {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
    }
    let lastActivityTime = localStorage.getItem('jod_activityTime');
    // we don't have any record of activityTime, so record some
    if (!lastActivityTime) {
      if (this.authorizeService.isAuthenticated() && !this.showTimeoutPopUp) {
        // refresh activity
        lastActivityTime = moment(new Date()).toString();
        localStorage.setItem('jod_activityTime', lastActivityTime);
        localStorage.setItem('jod_activityTimeWho', 'setInactivityTimeout:no-record-refresh');
      } else {
        localStorage.setItem('jod_activityTimeWho', 'setInactivityTimeout:no-record-reload');
        window.location.reload();
      }
    }
    let diff = differenceInMilliseconds(new Date(), moment(lastActivityTime).toDate());

    // we have a really old activity time, log the user out to be safe
    if (!this.hasRecentActivity()) {
      if (!this.showTimeoutPopUp) {
        localStorage.setItem('jod_activityTimeWho', 'setInactivityTimeout!hasRecentActivity:sign-out-remove-act-time');
        this.logout();
      }
      return;
    }

    this.checkSessionTime();
    this.inactivityTimeoutId = setTimeout(
      () => this.userInactive.next("User has been inactive for 9 mins"), this.inactivityTimeout - diff
    );
    localStorage.setItem('jod_activityTimeExpires', `ID: ${this.inactivityTimeoutId}, ${this.inactivityTimeout - diff}ms`);
  }
  // we need to ensure the inactivity timeout is consistent, so we'll check on it at intervals
  setCheckInactivityTimeout() {
    if (this.checkInactivityTimeoutId) {
      clearInterval(this.checkInactivityTimeoutId);
    }
    this.checkInactivityTimeoutId = setInterval(() => {
      if (!this.showTimeoutPopUp) {
        this.setInactivityTimeout();
      }
    }, this.checkInactivityTimeoutInterval);
    localStorage.setItem('jod_activityTimeCheckId', `ID: ${this.checkInactivityTimeoutId}, At: ${moment(new Date()).toString()}`);
  }
  logout(){
    // remove any timeout settings
    localStorage.removeItem('jod_activityTime');
    localStorage.removeItem('jod_activityTimeExpires');
    localStorage.removeItem('jod_activityTimeCheckId');
    localStorage.removeItem('jod_actSessionExpiryTime');
    localStorage.removeItem('jod_countdownTimeInSeconds');
    this.authorizeService.signOut({local: true});
    // 10sec grace period before sending to login page
    setTimeout(()=> {
      window.location.reload();
    }, 10000);
  }
  closeDropdown(){
      if(this.count < 1){
        this.showDropdown = false;
      } else{
        this.count = 0;
      }
  }
  redirectToAdmin(){
    window.open(this.adminUrl, '_blank');
    this.showAdminPopUp = false;
  }
  goToRoute(url:string, isAuthorised:boolean) {
    if (isAuthorised) {
      if(url.length > 0){
        window.open(url , '_blank');
        this.router.navigate([this.router.url]);
      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE] ,
         title: ACCESS_DENIED_TITLE}));
    }
   
  }
  imageClick(){
    this.showDropdown = true;
    this.count = 1;
  }
  showMenuClick(){

  }
  copyToClipboard(){
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.aboutText);
    } else {
      alert('The Clipboard API is not available.');
    }
    this.showAboutPopUp = false;
  }
  changeLang(e:any) {
    localStorage.setItem('lang' , e?.value?.code);
    window.location.reload();
  }
  filterOption(e: any) {
    let filtered : any[] = [];
    let query = e.query;
    this.homePageService.getQuickSearchList(query).subscribe(response => {
      this.quickSearchOptions = response;
      for(let i = 0; i < this.quickSearchOptions.length; i++) {
        let item = this.quickSearchOptions[i];
        if (item.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(item);
        }
    }
    this.filteredOptions = filtered;
    });
  }
}
