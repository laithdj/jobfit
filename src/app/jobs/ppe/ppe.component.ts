import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Jobs, JobsDetails } from 'src/app/shared/models/jobs.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList, selectPPETree } from 'src/app/store/job-fit.selectors';
import { PPETree } from '../../shared/models/ppe.model';
import { JobsService } from '../jobs.service';
import { JobsComponent } from '../jobs.component';
import { selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { MenuItem } from 'primeng/api';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-ppe',
  templateUrl: './ppe.component.html',
  styleUrls: ['./ppe.component.css']
})
export class PpeComponent implements OnInit {
  jobsId = 0;
  job: Jobs | undefined = new Jobs();
  jobDetails: JobsDetails = new JobsDetails();
  jobDetails$= this.store.pipe(select(selectJobDetails));
  ppeTree$ = this.store.pipe(select(selectPPETree));
  ppeTree:PPETree[] = [];
  selectedPPETree:PPETree[] = [];
  empLoaded = false;
  assignPPEBox = false;
  selectedFiles: PPETree[] = [];
  selectedGroupNumbs: number[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  job$ = this.store.pipe(select(selectJobDetails));
  breadCrumbs: MenuItem[] = [];
  PPELoaded: boolean = false;
  constructor(private jobsService: JobsService,
    private route: ActivatedRoute,
    private store: Store<JobFitAppState>,
    private router: Router
    ) {
      this.route.params.subscribe((params: Params) => {
        this.jobsId = params?.jobId;
        this.jobsService.setMenu(params?.jobId);
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (this.authorisedFunctionList) {
          if (this.authorisedFunctionList.Function[EFunctions.ViewPPEs] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
            this.getJob(params?.jobId);
            this.getJobPPEs(params?.jobId);
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
      });
      if (this.authorisedFunctionList.Function[EFunctions.ViewPPEs] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
        this.store.dispatch(new ShowSideMenu(true));
        this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
      }
   }
  ngOnInit(): void {
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }

  goToReport(){
    this.router.navigate([`./reports/job/${this.jobsId}`]);
  }
  getJob(jobId: number) {
    this.store.dispatch(new FetchJobDetails(jobId));
    this.jobDetails$.subscribe(result => {
      this.jobDetails = result;
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Jobs', url: 'jobs'},
        {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobsId}` },
        {label:'PPE'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.jobDetails.ppe.forEach(element => {
        this.selectedGroupNumbs.push(element.id);
      });
    });
  }
  getJobPPEs(jobId:number){
    this.PPELoaded = false;
    this.jobsService.getJobsPPETree(jobId).subscribe(result => {
      this.selectedPPETree = result;
      this.PPELoaded = true;
    });
  }
}
