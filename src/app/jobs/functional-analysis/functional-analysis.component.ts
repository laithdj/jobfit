import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { selectFunctionList, selectPosturalToleranceGroups } from 'src/app/store/job-fit.selectors';
import { Attachments } from '../../shared/models/attachments.model';
import { CustomerCompanySettings, FunctionalAnalysis, PosturalToleranceGroup, RiskToolResult } from '../../shared/models/functional-analysis.model';
import { Task } from '../../shared/models/task.model';
import { JobsService } from '../jobs.service';
import { JobsAppState } from 'src/app/store/jobs-store/jobs.reducers';
import { selectFATaskFlagTree, selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import * as _ from 'lodash';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { FetchJobDetails, FetchJobsFunctionalAnalysis } from 'src/app/store/jobs-store/jobs.actions';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { RiskTool } from 'src/app/shared/models/risk.ratings.model';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-functional-analysis',
  templateUrl: './functional-analysis.component.html',
  styleUrls: ['./functional-analysis.component.css']
})
export class FunctionalAnalysisComponent implements OnInit {
  jobId: any;
  items: MenuItem[] = [];
  task: Task | undefined = new Task();
  activeItem: MenuItem | undefined;
  selectedCategory: any = null;
  visibleSidebar4 = false;
  attachments: Attachments[] = [];
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  posturalGroups$ = this.store.pipe(select(selectPosturalToleranceGroups));
  editMode = false;
  jobDetails: JobsDetails = new JobsDetails();
  riskRatings: RiskTool[] = [];
  selectedRiskRatings:RiskTool[] = [];

  currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  posturalGroups: PosturalToleranceGroup[]= [];
  faTaskFlagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  faTaskFlagTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  selectedFlagNumbs: number [] = [];
  riskToolResults: RiskToolResult[] = [];
  faLoaded = false;
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  job$ = this.store.pipe(select(selectJobDetails));
  breadCrumbs: MenuItem[] = [];
  NULL_VALUE: number = 0;
  MIN_VALUE: number = 1;
  MAX_VALUE: number = 9;
  settings:CustomerCompanySettings = new CustomerCompanySettings();
  riskTools: RiskTool[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;

  constructor(private router: Router,
    private store: Store<JobsAppState>,
    private jobsService: JobsService,
    private taskService: TasksService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params: Params) => {
      this.jobId = params.jobId;
      this.jobsService.setMenu(params.jobId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (Object.keys(this.authorisedFunctionList.Function).length > 0){
        if (this.authorisedFunctionList.Function[EFunctions.ViewFunctionalAnalyses] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
          this.getFunctionalAnalysis(params.jobId);
          this.getSettings();
          this.store.dispatch(new FetchJobsFunctionalAnalysis(params.jobId));
          
          this.store.dispatch(new FetchJobDetails(this.jobId));
            this.job$.subscribe(result => {
              this.breadCrumbs = [
                {icon: 'pi pi-home', url: 'home'},
                {label:'Jobs', url: 'jobs'},
                {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobId}` },
                {label:'Functional Analysis'},
              ];
              this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
            });
        } else {
          this.faLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
        if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
          this.store.dispatch(new ShowSideMenu(true));
          this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
        }
      }
      
    });
   
  }

  ngOnInit(): void {
  }
  goToReport(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      this.router.navigate([`./reports/job/${this.jobId}`]);
    }  else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getSettings() {
    this.taskService.getCustomerSettings().subscribe(result => {
      this.settings = result;
    });
  }
  getFunctionalAnalysis(jobId : number) {
    this.faLoaded = false;
    this.jobsService.getJobCurrentFunctionalAnalysis(jobId).subscribe(result => {
      this.currentFunctionalAnalysis = result;
      this.getFlagsTree();
      this.getFunctionalAnalysisForRisks(this.currentFunctionalAnalysis.riskToolResults[0].functionalAnalysisId)

    });
  }
  getFunctionalAnalysisForRisks(id:number){
    this.taskService.getRiskTools(this.settings.id).subscribe(riskRatings => {
      this.taskService.getFunctionalAnalysisForRisks(id).subscribe(fa => {
        this.riskToolResults = _.cloneDeep(fa.riskToolResults);
        this.riskRatings = riskRatings.map(risk => {
          const existingRisk = this.riskToolResults.some(f => f.riskToolId === risk.id && f.riskAssessmentValue >= this.MIN_VALUE);
          return { ...risk, isActive: existingRisk }
        });

        this.riskToolResults.forEach(element => {
          let indx = this.riskRatings.findIndex(risk => risk.id === element.riskToolId
            && element.riskAssessmentValue >= this.MIN_VALUE
            && !this.selectedRiskRatings.some(srr => srr.id === risk.id)
          );
          if(indx > -1){
            let riskRating = this.riskRatings[indx];
            riskRating.riskAssessmentValue = element.riskAssessmentValue;
            riskRating.riskRangeRate = this.getRiskRating(element.riskAssessmentValue, riskRating);
            this.selectedRiskRatings.push(riskRating);
          }
        });

        if(this.selectedRiskRatings.length > 0){
          let riskTools = _.cloneDeep(this.selectedRiskRatings);
          this.riskTools.forEach(element => {
            let indx = this.selectedRiskRatings.findIndex((x) => x.id === element.id);
            if(indx < 0){
              riskTools.push(element);
            }
          });
          this.riskTools = riskTools
        }
      });
    });
  }
  getFlagsTree() {
    this.faLoaded = false;
    this.jobsService.getSelectedJobFAFlags(this.jobId).subscribe(result => {
      this.selectedFlagTree = _.cloneDeep(result);
      this.faLoaded = true;
    });
  }
  getRiskRating(score: number, riskTool: RiskTool) : string {
    if (!riskTool.isActive && score === 0) return "";
    const rangeRatings = riskTool.riskRangeRatings;
    let validatedScore: number;
    switch (true) {
      case score >= this.MAX_VALUE:
        validatedScore = this.MAX_VALUE; break;
      case score <= this.MIN_VALUE:
        validatedScore = this.MIN_VALUE; break;
      default:
        validatedScore = score;
    }
    const rating = rangeRatings.find(x => validatedScore >= x.minValue && validatedScore <= x.maxValue);
    return rating?.name ?? "";
  }
}
