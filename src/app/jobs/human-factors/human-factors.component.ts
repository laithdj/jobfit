import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Jobs, JobsDetails } from 'src/app/shared/models/jobs.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { JobsService } from '../jobs.service';
import { selectJobDetails, selectJobsHFTree } from 'src/app/store/jobs-store/jobs.selectors';
import { FetchHFTree, FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { HumanFactorTree } from 'src/app/shared/models/human-factors.model';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { MenuItem } from 'primeng/api';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-human-factors',
  templateUrl: './human-factors.component.html',
  styleUrls: ['./human-factors.component.css']
})
export class HumanFactorsComponent implements OnInit {
  jobsId = 0;
  job: Jobs | undefined = new Jobs();
  jobDetails: JobsDetails = new JobsDetails();
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  hfTree$ = this.store.pipe(select(selectJobsHFTree));
  hfTree:HumanFactorTree[] = [];
  selectedHfTree:HumanFactorTree[] = [];
  selectedGroupNumbs: number[] = [];
  HFLoaded = false;
  empLoaded = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  job$ = this.store.pipe(select(selectJobDetails));
  breadCrumbs: MenuItem[] = [];
  constructor(private router: Router,
    private jobsService: JobsService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    ) {
      this.route.params.subscribe((params: Params) => {
        this.jobsId = params?.jobId;
        this.jobsService.setMenu(params?.jobId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewHumanFactors] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
            this.getJob(params?.jobId);

          } else {
            this.empLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }
      });
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
   }
  ngOnInit(): void {
    this.getHfTree();
  }

  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }

  goToReport(){
    this.router.navigate([`./reports/job/${this.jobsId}`]);
  }
  getHfTree() {
    this.HFLoaded = false;
    this.jobsService.getSelectedJobsHFTree(this.jobsId).subscribe(result => {
      this.selectedHfTree = _.cloneDeep(result);
      this.HFLoaded = true;
    });
  }

  getJob(jobId: number) {
    this.store.dispatch(new FetchJobDetails(jobId));
    this.jobDetails$.subscribe(result => {
      this.jobDetails = result;
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Jobs', url: 'jobs'},
        {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobsId}` },
        {label:'Human Factors'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    });
  }

}
