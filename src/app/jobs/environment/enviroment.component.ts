import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import {  SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { EnvironmentalTree } from '../../shared/models/enviromental.model';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-enviroment',
  templateUrl: './enviroment.component.html',
  styleUrls: ['./enviroment.component.css']
})
export class EnviromentComponent implements OnInit {
  jobsId = 0;
  selectedEnvTree: EnvironmentalTree[] = [];
  assignEnvBox = false;
  envLoaded = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  empLoaded = false;
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
          if (this.authorisedFunctionList.Function[EFunctions.ViewEnvironmentalFactors] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
            this.getJobsEnvTree(params?.jobId);
          } else {
            this.empLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
          }
        }
        this.functionList$.subscribe(result => {
          this.functionList = result;
          this.authorisedList = [];
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
        });
        this.store.dispatch(new FetchJobDetails(this.jobsId));
        this.job$.subscribe(result => {
          this.breadCrumbs = [
            {icon: 'pi pi-home', url: 'home'},
            {label:'Jobs', url: 'jobs'},
            {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobsId}` },
            {label:'Environment'},
          ];
          this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
        });

      });
      if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
        this.store.dispatch(new ShowSideMenu(true));
        this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
      }
  }
  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`./reports/job/${this.jobsId}`]);
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getJobsEnvTree(jobId: number){
    this.envLoaded = false;
    this.jobsService.getSelectedJobsEnviromentalTree(jobId).subscribe(result => {
      this.selectedEnvTree = result;
      this.envLoaded = true;
    });
  }

}
