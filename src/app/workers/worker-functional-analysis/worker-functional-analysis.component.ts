import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { Attachments } from '../../shared/models/attachments.model';
import { DominantGripSide, FASearchCriteria, FunctionalAnalysis, FunctionalAnalysisResult, GripStrengthData, PosturalToleranceGroup, PosturalToleranceResult, RiskToolResult } from '../../shared/models/functional-analysis.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import * as _ from 'lodash';
import { Provider } from 'src/app/shared/models/provider.model';
import { Event } from 'src/app/shared/models/search.criteria.model';
import { WorkersService } from '../workers.service';
import { NextAssesmentSchedule, Worker } from 'src/app/shared/models/worker.model';
import { selectCurrentFunctionalAnalysis, selectFAWorkerFlagTree, selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { FetchCurrentFunctionalAnalysisForWorker, FetchFAWorkerFlagTree, FetchPosturalToleranceGroups, FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { FetchCustomerSettings, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { EGripsDominance, GripData, Grips } from 'src/app/shared/models/grips.model';
import { MaterialHandling, MaterialHandlingGroup } from 'src/app/shared/models/materialHandling.model';
import { HealthHygiene, HealthHygieneResult, NextDueDate, NextDueDateSetting } from 'src/app/shared/models/health-hygeine.model';
import { ChartData, ChartOptions } from 'chart.js';
import { selectNextAssessmentSchedule } from 'src/app/store/workers-store/workers.selectors';
import { TasksService} from 'src/app/tasks/tasks-service.service';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { addDates } from 'src/app/shared/helper/calculations';
import * as moment from 'moment';
import { Note, NoteEntity } from 'src/app/shared/models/note.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

const POSTURAL_TOLERANCE = "Postural Tolerance";
const MATERIAL_HANDLING = "Material Handling";

@Component({
  selector: 'app-worker-functional-analysis',
  templateUrl: './worker-functional-analysis.component.html',
  styleUrls: ['./worker-functional-analysis.component.css']
})
export class WorkerFunctionalAnalysisComponent implements OnInit {
  workerId: any;
  worker: Worker | undefined = new Worker();
  selectedCategory: any = null;
  visibleSidebar = false;
  selectedFlagNode: FlagsTree[] = [];
  flagNote: CheckedEntity = new CheckedEntity();
  attachments: Attachments[] = [];
  selectedReviewDate = '';
  functionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  faFlagTree$ = this.store.pipe(select(selectFAWorkerFlagTree));
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  editMode = false;
  providers:Provider[] = [];
  note: Note = new Note();
  faFlagTree: FlagsTree[] = [];
  mainFaFlagTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  currentFunctionalAnalysis?: FunctionalAnalysis;
  riskRatingResults: RiskToolResult[] = [];
  posturalGroups: PosturalToleranceGroup[]= [];
  materialGroups: MaterialHandlingGroup[] = [];
  selectedFlagNumbs: number [] = [];
  nextDueDateDisable = false;
  editFlagNote: boolean = false;
  newBtnClicked = false;
  editBtnClicked = false;
  events: Event[] = [];
  selectedFlag: number =0 ;
  materialHandlingResults: MaterialHandling[] = [];
  gripItemResults: Grips[] = [];
  hygieneResults: HealthHygieneResult[] = [];
  faHistoryEdit:boolean = false;
  viewFA: boolean = false;
  backupSelectedFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  selectedFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  faList: FunctionalAnalysis[] = [];
  faLoaded = false;
  faResult: FunctionalAnalysisResult = new FunctionalAnalysisResult();
  materialHandlingOutput: MaterialHandling[] = [];
  healthHygieneResultOutput: HealthHygieneResult[] = [];
  dominantGripSide: DominantGripSide= new DominantGripSide();
  gripsOutput: Grips[] = [];
  posturalTolerancesOutput: PosturalToleranceResult[] = [];
  materialHandlings: MaterialHandling[] = [];
  graphData: ChartData | undefined;
  graphStyle: ChartOptions | undefined;
  graphTypes: string[] = [POSTURAL_TOLERANCE, MATERIAL_HANDLING];
  graphSeries: any;
  selectedGraphType: string = '';
  selectedGraphSeries: Array<string|number> = [];
  settings: any;
  viewBtnClicked: boolean = false;
  gripData: GripData[] = [];
  errorMessage = '';
  displayError = false;
  faId: number = 0;
  functionList$ = this.store.pipe(select(selectFunctionList));
  selectedFAs:any[] = [];
  displaySchedule = false;
  nextAssessmentSchedule: NextAssesmentSchedule = new NextAssesmentSchedule();
  nextAssessmentSchedule$ = this.store.pipe(select(selectNextAssessmentSchedule));
  showArchiveSchedule = false;
  nasComment: string = "";
  nasDate: any;
  nasProvider: any;
  showArchiveFA = false;
  functionList:number[] = [];
  nasId: number = 0;
  flagList: FlagsTree[] = [];
  nextDueDateSetting: NextDueDateSetting = new NextDueDateSetting();
  assessmentDate: Date = new Date();
  nextDueDate: Date|undefined;
  providerId: number = 0;
  event: Event = new Event();
  rowCount = 10;
  currentPage = 0;
  rowOptions = [10,20,30];
  comments: string = '';
  activeIndex: number = 0;
  auth: number[]= [];
  totalCount = 0;
  gripStrengthData = new GripStrengthData();
  healthHygieneList: HealthHygiene[] = [];
  flagFaId: number = 0;
  noteFlagName:string = '';
  faHistoryNoteClicked = false;
  showNas: boolean = false;
  breadCrumbs: MenuItem[] = [];
  nasSaved: boolean = true;
  notesSaved: boolean = true;
  activeState: boolean[] = [true, false, false, false, false, false, false];
  hasError: boolean = false;
  allFaLoaded: boolean = false;
  authorisedList: boolean[] =[];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(
    private store: Store<JobFitAppState>,
    private workersService: WorkersService,
    private route: ActivatedRoute,
    private taskService: TasksService,
    private router: Router
   ) {
    this.route.params.subscribe((params: Params) => {
      this.store.dispatch(new FetchPosturalToleranceGroups());
      this.workerId = params.workerId;
      this.workersService.setMenu(params.workerId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (Object.keys(this.authorisedFunctionList.Function).length > 0){
        if (this.authorisedFunctionList.Function[EFunctions.ViewFunctionalAnalyses] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
          
          this.getProviders();
          this.getEvents();
          this.getPosturalGroups();
          this.getMaterialGroups();
          this.getSettings();
          this.getAllFlagsTree();
          this.getGripData(this.workerId);
          this.getNextDueDateSetting();
          this.getFunctionalAnalysis(params.workerId);
          this.getAllFunctionalAnalysis(params.workerId, 10 , 1 , 'desc' , 'AssessmentDate');
          this.store.dispatch(new FetchCurrentFunctionalAnalysisForWorker(params.workerId));
          this.store.dispatch(new FetchCustomerSettings());
          this.store.dispatch(new FetchWorkerDetails(params.workerId));
          this.workerDetails$.subscribe(result => {
            this.worker = result;
            this.breadCrumbs = [
              {icon: 'pi pi-home', url: 'home'},
              {label:'Workers', url: 'workers'},
              {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
              {label:'Functional Analysis'},
            ];

            this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
            this.getNextAssessmentSchedule(this.worker?.nextAssessmentScheduleId!)
            });
        
        } else {
          this.faLoaded = true;
          this.allFaLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
        if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
          this.store.dispatch(new ShowSideMenu(true));
          this.store.dispatch(new SetSideMenu(this.workersService?.menuList));
        }
      }
    });
  }

  ngOnInit(): void {
  }
  onTabOpen(e:any) {
    this.activeState = [false, false, false, false, false, false, false];
    var index = e.index;
    this.activeState[index + 1] = true;
}
  goToReport(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      this.router.navigate([`../reports/worker/${this.workerId}`]);
    }  else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  archive() {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteFunctionalAnalysis]) {
      this.showArchiveFA = true;
    }  else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  nasToggle(){
    this.showNas = !this.showNas;
  }
  getNextDueDateSetting() {
    this.workersService.getFANextDueDateSetting("Functional Analysis - Workers").subscribe((results: NextDueDateSetting) => {
      this.nextDueDateSetting = _.cloneDeep(results);
    });
  }
  getFunctionalAnalysis(workerId : number) {
    this.faLoaded = false;
    this.workersService.getWorkerCurrentFunctionalAnalysis(workerId).subscribe(result => {
      this.selectedFlagNumbs = [];
      this.selectedFlagNode = [];
      this.flagList = _.cloneDeep(result.flags);

      if (result && result.id > 0) {
        this.currentFunctionalAnalysis = _.cloneDeep(result);
        this.getAFunctionalAnalysis(this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id);
        this.currentFunctionalAnalysis.flags.filter(x=> x.isActive == true).forEach(element => {
          if (!this.selectedFlagNumbs.includes(element.flagId)) {
            this.selectedFlagNumbs.push(element.flagId);
            this.selectedFlagNode.push(element);
          }
        });
        this.materialHandlingResults = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.gripItemResults = _.cloneDeep(this.currentFunctionalAnalysis.gripItemResults);
        this.hygieneResults = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.healthHygieneResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.dominantGripSide = this.currentFunctionalAnalysis.dominantGripSides.length > 0
                                ? this.currentFunctionalAnalysis.dominantGripSides[0]: {functionalAnalysisId: this.currentFunctionalAnalysis.id, gripSideId: EGripsDominance.NotTested};
        this.materialHandlingOutput = _.cloneDeep(this.materialHandlingResults);
        this.gripsOutput = _.cloneDeep(this.gripItemResults);
        this.posturalTolerancesOutput = _.cloneDeep(this.currentFunctionalAnalysis.posturalToleranceResults);
        this.faId = this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id;
        this.gripStrengthData = {gripItemResults: _.cloneDeep(this.gripItemResults),
                                gripData: _.cloneDeep(this.gripData),
                                dominantGrip: _.cloneDeep(this.dominantGripSide)};
        this.getFlagsTree(this.faId);
      } else {
        this.currentFunctionalAnalysis = undefined;
      }
      this.faLoaded = true;
    });
  }
  getFlagsTree(faId: number) {
    this.workersService.getSelectedWorkerFAFlagsForFA(faId).subscribe(result => {
        this.selectedFlagTree =_.cloneDeep(result);
    });
  }
  selectedFlagChange(e: any, flag:FlagsTree) {
    if (e?.checked == true && this.selectedFlagNode.filter(x => x.flagId == (flag.flagId > 0? flag.flagId : flag.id)).length == 0) {
      this.selectedFlagNode.push(flag);
    } else {
      const idx = this.selectedFlagNode.findIndex((x) => x.flagId === (flag.flagId > 0? flag.flagId : flag.id));
      if (idx > -1) {
        this.selectedFlagNode.splice(idx, 1);
      }
    }
  }
  getEditFlagsTree(faId: number) {
    this.workersService.GetFATreeForWorker(faId).subscribe(result => {
        this.faFlagTree =_.cloneDeep(result);
    });
  }
  cancelEditFaHistory(){
    this.setDefaultView();
    this.hasError = false;
    this.viewFA = true;
    this.faHistoryEdit = false;
  }
  onPageChange(e:any){
    this.getAllFunctionalAnalysis(this.workerId, this.rowCount , e.page + 1 , 'desc' , 'AssessmentDate');
  }
  setRows(e: any){
    this.rowCount = e.value
    this.getAllFunctionalAnalysis(this.workerId, e.value , this.currentPage , 'desc' , 'AssessmentDate' );
  }
  getAllFunctionalAnalysis(workerId:number, count:number ,page:number , dir:string , sortField:string){
    let search: FASearchCriteria = new FASearchCriteria();
    search.count = count;
    search.pageNumber = page;
    search.sortDir = dir;
    search.sortField = sortField;
    this.currentPage = page;
    this.allFaLoaded = false;
    this.workersService.getAllFunctionalAnalysisForWorker(workerId, search).subscribe(result => {
      this.faResult = result;
      this.faList = result.functionalAnalysis;
      this.totalCount = result.listCount;
      this.faList.forEach(fa => {
        fa.commentforDisplay = this.changeToPlainText(fa.comments);
      });
      this.allFaLoaded = true;
    });
  }
  getFAHygieneResults(id: number) {
    this.workersService.getWorkerFAHealthHygieneResults(id).subscribe((results: HealthHygieneResult[]) => {
        this.hygieneResults = _.cloneDeep(results);
    });
  }
  getHealthHygieneList() {
    this.workersService.getMainHealthHygieneByType("Functional Analysis - Workers").subscribe(results => {
      this.healthHygieneList = results;
    });
  }
  getHistorySpecificNote(id: number) : string | null{
    let indx = this.selectedFunctionalAnalysis?.flags.find((x) => x.flagId === id);
    if((indx) && (indx.note) && (indx.note?.text?.length > 0)){
      return 'Specific Note: ' + indx.note?.text;
    } else {
      return null
    }
  }

  getGripData(id: number) {
    this.workersService.getGripData(id).subscribe((results: GripData[]) => {
        this.gripData = _.cloneDeep(results);
    });
  }
  onMaterialHandlingChange(materialHandling: MaterialHandling[]){
    this.materialHandlingOutput = _.cloneDeep(materialHandling);
  }
  onGripsChange(grips: Grips[]){
    this.gripsOutput = _.cloneDeep(grips);
  }
  onDominantChange(dominantSide: DominantGripSide){
    this.dominantGripSide = _.cloneDeep(dominantSide);
  }
  onPosturalToleranceChange(posturalTolerances: PosturalToleranceResult[]){
    this.posturalTolerancesOutput = _.cloneDeep(posturalTolerances);
  }
  onHealthHygieneResultsChange(hhResult: HealthHygieneResult[]){
    this.healthHygieneResultOutput = _.cloneDeep(hhResult);
  }
  closeValidation() {
    this.displayError = false;
    this.hasError = true;
    this.activeState = [true, false, false, false, false, false, false];
  }
  saveFunctionalAnalysis(current:boolean) {
    if (!this.assessmentDate) {
      this.errorMessage = "Assessment Date is required!";
      this.displayError = true;
    }else if (this.event.id == 0) {
      this.errorMessage = "Please select an Event!";
      this.displayError = true;
    } else if (this.selectedReviewDate === 'ManualDate' && this.nextDueDate == null){
      this.errorMessage = "Next Review Date is required if Manual is selected";
      this.displayError = true;
    } else {
      this.faLoaded = false;
      this.hasError = false;
      let functionalAnalysis = new FunctionalAnalysis();
      if(current && this.currentFunctionalAnalysis){
        functionalAnalysis = _.cloneDeep(this.currentFunctionalAnalysis);
      } else {
        functionalAnalysis = _.cloneDeep(this.selectedFunctionalAnalysis);
      }
      functionalAnalysis.materialHandlingResults = _.cloneDeep(this.materialHandlingOutput);
      functionalAnalysis.gripItemResults = _.cloneDeep(this.gripsOutput);
      functionalAnalysis.dominantGripSides = _.cloneDeep([this.dominantGripSide]);
      functionalAnalysis.posturalToleranceResults = _.cloneDeep(this.posturalTolerancesOutput);
      functionalAnalysis.healthHygieneResults = _.cloneDeep(this.healthHygieneResultOutput);
      functionalAnalysis.posturalToleranceResults.forEach(x=> {
        x.functionalAnalysisId = functionalAnalysis.originalRevisionId && functionalAnalysis.originalRevisionId > 0 ? functionalAnalysis.originalRevisionId:functionalAnalysis.id;
      });

      this.selectedFlagNumbs = [];
      var flagsTree: FlagsTree[] = [];
      if(this.selectedFlagNode.length > 0){

        this.selectedFlagNode.forEach((node:FlagsTree) => {
              let nodeNote = this.functionalAnalysis?.flags.find((x) => x.flagId === (node.flagId > 0 ? node.flagId:node.id))?.note ?? new NoteEntity();

              if (node.typeId != 5) {
                var flags: FlagsTree = {
                  id : node.flagId > 0 ? node.flagId : Number(node.id),
                  label: node.label,
                  children : node.children,
                  parent: undefined,
                  typeId: node.typeId,
                  companyId: node.companyId,
                  parentId: node.parentId,
                  note: node.note,
                  faNote: node.faNote?.text ? node.faNote : nodeNote,
                  flagId: node.flagId,
                  supplementaryId: node.supplementaryId,
                  specificNote: this.flagList?.find((x) => x.id === node.id)?.specificNote ?? '',
                  isActive: true
                };
                flagsTree.push(flags);
                this.selectedFlagNumbs.push(node.id);
              }
          });
          functionalAnalysis.flags = flagsTree;
      } else {
          this.selectedFlagTree = [];
          functionalAnalysis.flags = [];
      }
      functionalAnalysis.nextDueDate = functionalAnalysis.nextDueDate ?? new NextDueDate();
      if(this.selectedReviewDate === 'ManualDate'){
        functionalAnalysis.nextDueDate.date = new Date(moment(this.nextDueDate).format('YYYY-MM-DD'));
        functionalAnalysis.nextDueDate.isManualNextDueDate = true;
      }
      if(this.selectedReviewDate === 'NotSet'){
        functionalAnalysis.nextDueDate.isManualNextDueDate = undefined;
        functionalAnalysis.nextDueDate.date = undefined;
      }
      if(this.selectedReviewDate === 'Automatic'){
        functionalAnalysis.nextDueDate.isManualNextDueDate = false;
        functionalAnalysis.nextDueDate.date = new Date(moment(this.nextDueDate).format('YYYY-MM-DD'));
      }
      functionalAnalysis.nextDueDate.isActive = true;
      functionalAnalysis.assessmentDate =  new Date(moment(this.assessmentDate).format('YYYY-MM-DD'));
      functionalAnalysis.comments = this.comments;
      functionalAnalysis.event = _.cloneDeep(this.event);
      functionalAnalysis.eventId = this.event.id;
      functionalAnalysis.providerId = this.providerId;
      this.workersService.saveWorkerFunctionalAnalysis(this.workerId, functionalAnalysis).subscribe(result => {
        if(result){
          this.getAllFunctionalAnalysis(this.workerId, 10 , 1 , 'desc' , 'AssessmentDate');
          this.getFunctionalAnalysis(this.workerId);
        }
        this.setDefaultView();
        this.editMode = false;
        this.faHistoryEdit = false;
        this.newBtnClicked = false;
        this.editBtnClicked = false;
        this.faLoaded = true;
      });
    }
  }
  changeAssessmentDate() {
    if (this.selectedReviewDate == "Automatic") {
      this.setAutomaticDate();
    }
  }
  viewGraph() {
    let search: FASearchCriteria = new FASearchCriteria();
    search.count = 1000;
    search.pageNumber = 1;
    search.sortDir = "asc";
    search.sortField = "AssessmentDate";
    search.includeChildren = true
    this.faLoaded = false;
    this.workersService.getAllFunctionalAnalysisForWorker(this.workerId, search).subscribe(result => {
      const fas = result.functionalAnalysis;
      const { labels, datasets } = this.selectedGraphType === POSTURAL_TOLERANCE
        ? this.generatePosturalGraphData(fas)
        : this.generateMaterialGraphData(fas);

      this.graphData = { labels, datasets };
      this.graphStyle = this.getGraphStyle();
      this.viewBtnClicked = true;
      this.faLoaded = true;
    })
  }
  generatePosturalGraphData(fas: FunctionalAnalysis[]) {
    let labels: string[] = []
    let datasets: any[] = [];
    const colours = this.getColours(this.selectedGraphSeries.length);

    for (const group of this.posturalGroups) {
      for (const item of group.items.filter(p => this.selectedGraphSeries.includes(p.id))) {
        const key = `${group.name} - ${item.name}`;
        let data: any = [];
        for (const fa of fas) {
          const date = moment(new Date(fa.assessmentDate)).format("DD-MMM-YYYY");
          if (!labels.includes(date)) {
            labels.push(date)
          }

          const r = fa.posturalToleranceResults.find(f => f.posturalToleranceItemId === item.id);
          if (r && r.frequency.char !== "NT") {
            data.push({ x: date, y: r.frequency.value });
          }
        }

        const colour = colours.shift();
        datasets.push({
          label: key,
          data: data,
          fill: false,
          backgroundColor: colour,
          borderColor: colour,
          tension: .4,
        });
      }
    }

    return { labels, datasets };
  }
  generateMaterialGraphData(fas: FunctionalAnalysis[]) {
    let labels: string[] = [];
    let datasets: any[] = [];
    const colours = this.getColours(this.selectedGraphSeries.length);

    for (const series of this.selectedGraphSeries) {
      let data = [];
      const [freq, idStr] = String(series).split("_");
      const id = Number(idStr);
      const key = `${this.materialGroups.find(item => item.id === id)?.name} - ${freq}`;

      const verifiedAndConvertedFas = fas.map(fa => this.checkAndConvertToImperial(fa));
      for (const fa of verifiedAndConvertedFas) {
        const date = moment(new Date(fa.assessmentDate)).format("DD-MMM-YYYY");
        if (!labels.includes(date)) {
          labels.push(date)
        }
        const r = fa.materialHandlingResults.find(f => f.materialHandlingItemId === id && f.frequency.name === freq);
        if (r) {
          data.push({ x: date, y: r.value });
        }
      }

      const colour = colours.shift();
      datasets.push({
        label: key,
        data: data,
        fill: false,
        backgroundColor: colour,
        borderColor: colour,
        tension: .4,
      });
    }

    return { labels, datasets };
  }
  getGraphSeries() {
    this.selectedGraphSeries = [];
    if (this.selectedGraphType === POSTURAL_TOLERANCE) {
      const formattedResults = this.posturalGroups
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(res => ({
          label: res.name,
          items: res.items
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(item => ({
              label: item.name,
              value: item.id,
            }))
        }))
      this.graphSeries = formattedResults;
    } else {
      const frequencies = ["Occasional", "Frequent", "Continuous"];
      const formattedResults = frequencies
        .map(freq => ({
          label: freq,
          items: this.materialGroups
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(item => ({
              label: item.name,
              value: `${freq}_${item.id}`,
            }))
        }))
      this.graphSeries = formattedResults;
    }
  }
  getGraphStyle() {
    const isMetric = this.isMetric();
    return {
      plugins: {
        tooltip: {
          enabled: false,
        },
        legend: {
          labels: {
            boxWidth: 16,
          }
        }
      },
      layout: {
        padding: 20,
      },
      scales: {
        x: {
          offset: true,
          ticks: {
            font: {
              weight: "bold",
            }
          }
        },
        y: this.selectedGraphType === POSTURAL_TOLERANCE ? {
          beginAtZero: true,
          min: -0.5,
          max: 3.5,
          ticks: {
            callback: function(value: any, index: any) {
              switch (value) {
                case 0: return 'N';
                case 1: return 'O';
                case 2: return 'F';
                case 3: return 'C';
                default: return '';
              }
            }
          }
        } : {
          beginAtZero: true,
          min: 0,
          max: isMetric ? 70 : 140,
          ticks: {
            stepSize: 10,
            callback: function(value: any, index: any) {
              return value + (isMetric ? "kgs" : "lbs");
            }
          }
        }
      }
    }
  }
  getProviderName(id:number|null) : string{
    let provider = this.providers.find((x) => x.id === id);
    if(provider){
      return provider.fullName;
    } else {
      return 'No Provider Selected';
    }
  }
  getFlagNote(flag:FlagsTree, history?:boolean){
    this.flagNote.specificNote = '';
    let indx = this.functionalAnalysis?.flags.find((x) => x.flagId === flag.id);
    if(history){
       indx = this.selectedFunctionalAnalysis?.flags.find((x) => x.flagId === flag.id);
    }
    if(indx){
      this.flagNote.specificNote = indx.note?.text ?? '';
    }
    this.editFlagNote = true;
    this.flagNote.id = flag.id;
    this.selectedFlag = flag.id;
    this.note.generalNotes = flag.note ? flag.note.text : '';
  }
  getSpecificNote(id: number) : string | null{
    let indx = this.functionalAnalysis?.flags.find((x) => x.flagId === id);
    if((indx) && (indx.note) && (indx.note?.text?.length > 0)){
      return 'Specific Note: ' + indx.note?.text;
    } else {
      return null
    }
  }
  archiveFunctionalAnalysis(){
      this.faLoaded = false;
      var ids = [this.faId];
      this.workersService.archiveCurrentFunctionalAnalysisList(ids).subscribe(result => {
        this.getAllFunctionalAnalysis(this.workerId, 10 , 1 , 'desc' , 'AssessmentDate');
        this.getFunctionalAnalysis(this.workerId);
        this.faLoaded = true;
        this.showArchiveFA = false;
        this.setDefaultView();
        this.viewFA = false;
      });
  }
  saveFlagNote() {
    let newNote = new NoteEntity();
    newNote.isActive = true;
    newNote.text = this.flagNote.specificNote;

    let indx = this.selectedFlagNode.findIndex((x) => this.selectedFlag == (x.flagId > 0 ? x.flagId: x.id));
    if(indx > -1){
      this.selectedFlagNode[indx].faNote = newNote;
      let findIndx;
      if(this.faHistoryNoteClicked){
        findIndx = this.selectedFunctionalAnalysis?.flags.find((x) => this.selectedFlag == (x.flagId > 0 ? x.flagId: x.id));
      } else {
        findIndx = this.functionalAnalysis?.flags.find((x) => this.selectedFlag == (x.flagId > 0 ? x.flagId: x.id));
      }
      if((findIndx) && (findIndx.note)){
        findIndx.note.text = newNote.text;
      } else {
        this.notesSaved = false;
        let flag: FlagsTree = new FlagsTree();
        flag = _.cloneDeep(this.selectedFlagNode[indx]);
        flag.note = newNote;
        flag.flagId = flag.id;
        if(this.faHistoryNoteClicked){
          this.selectedFunctionalAnalysis?.flags.push(flag);
        } else {
          this.functionalAnalysis?.flags.push(flag);
        }
      }
      this.editFlagNote = false;
      this.notesSaved = true;
    }
  }

  getAllFlagsTree() {
    this.workersService.getFAWorkerFlagTree().subscribe(result => {
      this.faFlagTree = _.cloneDeep(result);
      this.mainFaFlagTree = _.cloneDeep(result);
    });
  }

  editFA(){
    if (this.authorisedFunctionList.Function[EFunctions.EditFunctionalAnalysis]) {
      this.activeIndex = 0;
      this.editMode = true;
      this.editBtnClicked = true;
      this.hasError = false;
      this.setDefaultView();
      if (this.currentFunctionalAnalysis) {
        this.faId = this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id;
        this.assessmentDate = new Date(this.currentFunctionalAnalysis.assessmentDate);
        this.nextDueDate = new Date(this.currentFunctionalAnalysis.nextDueDate.date ?? new Date);
        this.providerId = this.currentFunctionalAnalysis.providerId;
        this.event = this.currentFunctionalAnalysis.event;
        this.comments = this.currentFunctionalAnalysis.comments;
        this.materialHandlingResults = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.hygieneResults = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.selectedFlagNode = [];
        this.selectedFlagNumbs = [];
        this.currentFunctionalAnalysis.flags.filter(x=> x.isActive == true).forEach(element => {
          if (!this.selectedFlagNumbs.includes(element.flagId)) {
            this.selectedFlagNumbs.push(element.flagId);
            this.selectedFlagNode.push(element);
          }
        });

        if (this.selectedFlagNumbs.length > 0) {
          this.getEditFlagsTree(this.faId);
        } else {
          this.faFlagTree = _.cloneDeep(this.mainFaFlagTree);
        }
        this.gripItemResults = _.cloneDeep(this.currentFunctionalAnalysis.gripItemResults);
        this.healthHygieneResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.dominantGripSide = this.currentFunctionalAnalysis.dominantGripSides.length > 0
                                ? this.currentFunctionalAnalysis.dominantGripSides[0]: {functionalAnalysisId: this.currentFunctionalAnalysis.id, gripSideId: EGripsDominance.NotTested};
        this.materialHandlingOutput = _.cloneDeep(this.materialHandlingResults);
        this.gripsOutput = _.cloneDeep(this.gripItemResults);
        this.posturalTolerancesOutput = _.cloneDeep(this.currentFunctionalAnalysis.posturalToleranceResults);
        this.gripStrengthData = {gripItemResults: _.cloneDeep(this.gripItemResults),
                                  gripData: _.cloneDeep(this.gripData),
                                  dominantGrip: _.cloneDeep(this.dominantGripSide)};

        if (this.currentFunctionalAnalysis.nextDueDate.isManualNextDueDate == true) {
          this.nextDueDate = this.currentFunctionalAnalysis.nextDueDate.date ? new Date(this.currentFunctionalAnalysis.nextDueDate.date): undefined;
          this.selectedReviewDate = "ManualDate";
          this.nextDueDateDisable = false;
        } else if (this.currentFunctionalAnalysis.nextDueDate.isManualNextDueDate == false) {
          this.nextDueDate = this.currentFunctionalAnalysis.nextDueDate.date ? new Date(this.currentFunctionalAnalysis.nextDueDate.date): undefined;
          this.selectedReviewDate = "Automatic";
          this.nextDueDateDisable = true;
        } else {
          this.nextDueDate = undefined;
          this.selectedReviewDate = "NotSet";
          this.nextDueDateDisable = true;
        }

      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }

  }
  handleTabChange(e:any) {
    this.activeIndex = e.index;

    if(this.activeIndex == 0) {
      this.faHistoryNoteClicked = false;
      this.setDefaultView();
      this.viewFA = false;
      if (this.currentFunctionalAnalysis) {
        this.getAFunctionalAnalysis(this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id);
        this.selectedFlagNode = [];
        this.selectedFlagNumbs = [];
        this.currentFunctionalAnalysis.flags.filter(x=> x.isActive == true).forEach(element => {
          if (!this.selectedFlagNumbs.includes(element.flagId)) {
            this.selectedFlagNumbs.push(element.flagId);
            this.selectedFlagNode.push(element);
          }
        });
        this.materialHandlingResults = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.gripItemResults = _.cloneDeep(this.currentFunctionalAnalysis.gripItemResults);
        this.hygieneResults = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.healthHygieneResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.dominantGripSide = this.currentFunctionalAnalysis.dominantGripSides.length > 0
                                ? this.currentFunctionalAnalysis.dominantGripSides[0]: {functionalAnalysisId: this.currentFunctionalAnalysis.id, gripSideId: EGripsDominance.NotTested};
        this.materialHandlingOutput = _.cloneDeep(this.materialHandlingResults);
        this.gripsOutput = _.cloneDeep(this.gripItemResults);
        this.posturalTolerancesOutput = _.cloneDeep(this.currentFunctionalAnalysis.posturalToleranceResults);
        this.faId = this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id;
        this.gripStrengthData = {gripItemResults: _.cloneDeep(this.gripItemResults),
                                gripData: _.cloneDeep(this.gripData),
                                dominantGrip: _.cloneDeep(this.dominantGripSide)};
        this.getFlagsTree(this.faId);
      }
    }

  }
  viewFAHistory(fa:FunctionalAnalysis){
    this.hasError = false;
    this.faHistoryNoteClicked = true;
    this.activeIndex = 2;
    this.setDefaultView();
    this.selectedFunctionalAnalysis = _.cloneDeep(fa);
    this.backupSelectedFunctionalAnalysis = _.cloneDeep(fa);
    this.faId = this.selectedFunctionalAnalysis.originalRevisionId ?? this.selectedFunctionalAnalysis.id;
    this.assessmentDate = new Date(this.selectedFunctionalAnalysis.assessmentDate);
    this.nextDueDate = new Date(this.selectedFunctionalAnalysis.nextDueDate.date ?? new Date);
    this.providerId = this.selectedFunctionalAnalysis.providerId;
    this.event = this.selectedFunctionalAnalysis.event;
    this.comments = this.selectedFunctionalAnalysis.comments;

    this.materialHandlingResults = _.cloneDeep(this.selectedFunctionalAnalysis.materialHandlingResults);
    this.hygieneResults = _.cloneDeep(this.selectedFunctionalAnalysis.healthHygieneResults);
    this.selectedFlagNode = [];
    this.selectedFlagNumbs = [];
    this.selectedFunctionalAnalysis.flags.filter(x=> x.isActive == true).forEach(element => {
      if (!this.selectedFlagNumbs.includes(element.flagId)) {
        this.selectedFlagNumbs.push(element.flagId);
        this.selectedFlagNode.push(element);
      }
    });
    this.getAFunctionalAnalysis(this.faId);
    this.getFlagsTree(this.faId);
    this.gripItemResults = _.cloneDeep(this.selectedFunctionalAnalysis.gripItemResults);
    this.healthHygieneResultOutput = _.cloneDeep(this.selectedFunctionalAnalysis.healthHygieneResults);
    this.dominantGripSide = this.selectedFunctionalAnalysis.dominantGripSides.length > 0
                            ? this.selectedFunctionalAnalysis.dominantGripSides[0]: {functionalAnalysisId: this.selectedFunctionalAnalysis.id, gripSideId: EGripsDominance.NotTested};
    this.materialHandlingOutput = _.cloneDeep(this.materialHandlingResults);
    this.gripsOutput = _.cloneDeep(this.gripItemResults);
    this.posturalTolerancesOutput = _.cloneDeep(this.selectedFunctionalAnalysis.posturalToleranceResults);
    this.gripStrengthData = {gripItemResults: _.cloneDeep(this.gripItemResults),
                            gripData: _.cloneDeep(this.gripData),
                            dominantGrip: _.cloneDeep(this.dominantGripSide)};

    if (this.selectedFunctionalAnalysis.nextDueDate.isManualNextDueDate == true) {
      this.nextDueDate = this.selectedFunctionalAnalysis.nextDueDate.date ? new Date(this.selectedFunctionalAnalysis.nextDueDate.date): undefined;
      this.selectedReviewDate = "ManualDate";
      this.nextDueDateDisable = false;
    } else if (this.selectedFunctionalAnalysis.nextDueDate.isManualNextDueDate == false) {
      this.nextDueDate = this.selectedFunctionalAnalysis.nextDueDate.date ? new Date(this.selectedFunctionalAnalysis.nextDueDate.date): undefined;
      this.selectedReviewDate = "Automatic";
      this.nextDueDateDisable = true;
    } else {
      this.nextDueDate = undefined;
      this.selectedReviewDate = "NotSet";
      this.nextDueDateDisable = true;
    }
    this.viewFA = true;
  }
  editFunctionalAnalysis(){
    if (this.authorisedFunctionList.Function[EFunctions.EditFunctionalAnalysis]) {
      this.selectedFunctionalAnalysis = _.cloneDeep(this.backupSelectedFunctionalAnalysis);
      this.faHistoryNoteClicked = true;
      this.activeIndex = 2;
      this.setDefaultView();
      this.faId = this.selectedFunctionalAnalysis.originalRevisionId ?? this.selectedFunctionalAnalysis.id;
      this.assessmentDate = new Date(this.selectedFunctionalAnalysis.assessmentDate);
      this.nextDueDate = new Date(this.selectedFunctionalAnalysis.nextDueDate.date ?? new Date);
      this.providerId = this.selectedFunctionalAnalysis.providerId;
      this.event = this.selectedFunctionalAnalysis.event;
      this.comments = this.selectedFunctionalAnalysis.comments;

      this.materialHandlingResults = _.cloneDeep(this.selectedFunctionalAnalysis.materialHandlingResults);
      this.hygieneResults = _.cloneDeep(this.selectedFunctionalAnalysis.healthHygieneResults);
      this.selectedFlagNode = [];
      this.selectedFlagNumbs = [];
      this.selectedFunctionalAnalysis.flags.filter(x=> x.isActive == true).forEach(element => {
        if (!this.selectedFlagNumbs.includes(element.flagId)) {
          this.selectedFlagNumbs.push(element.flagId);
          this.selectedFlagNode.push(element);
        }
      });
      if (this.selectedFlagNumbs.length > 0) {
        this.getEditFlagsTree(this.faId);
      } else {
        this.faFlagTree = _.cloneDeep(this.mainFaFlagTree);
      }

      this.gripItemResults = _.cloneDeep(this.selectedFunctionalAnalysis.gripItemResults);
      this.healthHygieneResultOutput = _.cloneDeep(this.selectedFunctionalAnalysis.healthHygieneResults);
      this.dominantGripSide = this.selectedFunctionalAnalysis.dominantGripSides.length > 0
                              ? this.selectedFunctionalAnalysis.dominantGripSides[0]: {functionalAnalysisId: this.selectedFunctionalAnalysis.id, gripSideId: EGripsDominance.NotTested};
      this.materialHandlingOutput = _.cloneDeep(this.materialHandlingResults);
      this.gripsOutput = _.cloneDeep(this.gripItemResults);
      this.posturalTolerancesOutput = _.cloneDeep(this.selectedFunctionalAnalysis.posturalToleranceResults);
      this.gripStrengthData = {gripItemResults: _.cloneDeep(this.gripItemResults),
                              gripData: _.cloneDeep(this.gripData),
                              dominantGrip: _.cloneDeep(this.dominantGripSide)};

      if (this.selectedFunctionalAnalysis.nextDueDate.isManualNextDueDate == true) {
        this.nextDueDate = this.selectedFunctionalAnalysis.nextDueDate.date ? new Date(this.selectedFunctionalAnalysis.nextDueDate.date): undefined;
        this.selectedReviewDate = "ManualDate";
        this.nextDueDateDisable = false;
      } else if (this.selectedFunctionalAnalysis.nextDueDate.isManualNextDueDate == false) {
        this.nextDueDate = this.selectedFunctionalAnalysis.nextDueDate.date ? new Date(this.selectedFunctionalAnalysis.nextDueDate.date): undefined;
        this.selectedReviewDate = "Automatic";
        this.nextDueDateDisable = true;
      } else {
        this.nextDueDate = undefined;
        this.selectedReviewDate = "NotSet";
        this.nextDueDateDisable = true;
      }
      this.hasError = false;
      this.viewFA = false;
      this.faHistoryEdit = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  cancelView() {
    this.setDefaultView();
    this.viewFA = false;
  }
  setDefaultView() {
    this.activeState = [false, false, false, false, false, false, false, false, false];
    this.activeState[0] = true;
  }
  cancelEditFa(){
    this.editMode = false;
    this.editBtnClicked = false;
    this.hasError = false;
    this.setDefaultView();
    this.getFunctionalAnalysis(this.workerId);
  }
  cancelNewFA(){
    this.editMode = false;
    this.newBtnClicked = false;
    this.hasError = false;
    this.setDefaultView();
    this.getFunctionalAnalysis(this.workerId);
  }
  newFA() {
    if (this.authorisedFunctionList.Function[EFunctions.AddFunctionalAnalysis]) {
      this.activeIndex = 0;
      this.setDefaultView();
      this.editMode = true;
      this.newBtnClicked = true;
      this.hasError = false;
      this.selectedReviewDate = "NotSet";
      this.assessmentDate = new Date();
      this.nextDueDate = undefined;
      this.providerId = 0;
      this.event = new Event();
      this.comments = '';
      this.currentFunctionalAnalysis = new FunctionalAnalysis();
      this.functionalAnalysis = new FunctionalAnalysis();
      this.selectedFlagNode = [];
      this.materialHandlingResults = [];
      this.gripStrengthData = new GripStrengthData();
      this.healthHygieneResultOutput = [];
      this.dominantGripSide = new DominantGripSide();
      this.materialHandlingOutput = [];
      this.gripsOutput = [];
      this.posturalTolerancesOutput = [];
      this.faFlagTree = this.mainFaFlagTree;
      this.gripStrengthData = {gripItemResults: [],
                              gripData: _.cloneDeep(this.gripData),
                              dominantGrip: new DominantGripSide()};
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  getProviders(){
    this.taskService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getEvents(){
    this.workersService.getEvents().subscribe(result => {
      this.events = result;
    });
  }
  getPosturalGroups() {
    this.workersService.getPosturalToleranceGroups().subscribe(result => {
      this.posturalGroups = result;
    });
  }
  getMaterialGroups() {
    this.workersService.getMaterialHandlingGroups().subscribe(result => {
      this.materialGroups = result;
    });
  }
  getSettings() {
    this.workersService.getSettings().subscribe(result => {
      this.settings = result;
    });
  }
  getAFunctionalAnalysis(id : number){
    this.taskService.getFunctionalAnalysis(id).subscribe(result => {
      this.functionalAnalysis = _.cloneDeep(result);
    });
  }
  getColours(n: number) {
    let seed = 14;
    function random() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    let colours: string[] = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(random() * 255);
      const g = Math.floor(random() * 255);
      const b = Math.floor(random() * 255);
      colours.push(`rgb(${r},${g},${b})`);
    }
    return colours;
  }
  checkAndConvertToImperial(fa: FunctionalAnalysis) {
    if (!this.isMetric() && fa.materialHandlingResults != null) {
      const conversionRate = 2.205;
      return {
        ...fa,
        materialHandlingResults: fa.materialHandlingResults.map(mhr => ({
          ...mhr,
          value: mhr.value * conversionRate,
        })),
      }
    }
    return fa;
  }
  isMetric() {
    return this.settings.measurementType.typeName === "Metric";
  }

  addSchedule() {
    this.nextAssessmentSchedule = new NextAssesmentSchedule();
    this.nasComment = '';
    this.nasDate = new Date();
    this.nasProvider = 0;
    this.displaySchedule = true;
  }
  editSchedule() {
    this.nextAssessmentSchedule.assessmentDateTime = new Date(this.nextAssessmentSchedule.assessmentDateTime);
    this.nasComment = this.nextAssessmentSchedule.comments;
    this.nasDate = this.nextAssessmentSchedule.assessmentDateTime;
    this.nasProvider = this.nextAssessmentSchedule.providerId;
    this.displaySchedule = true;
  }
  getNextAssessmentSchedule(id: number) {
    if (id) {
      this.nasId = id;
      this.nasSaved = false;
      this.workersService.getNextAssessmentSchedule(id).subscribe((results: any) => {
        this.nextAssessmentSchedule = _.cloneDeep(results);
        this.nasDate = new Date(this.nextAssessmentSchedule.assessmentDateTime);
        this.nasComment = this.nextAssessmentSchedule.comments;
        this.nasProvider = this.nextAssessmentSchedule.providerId;
        this.nasSaved = true;
      })
    }
  }
  setNotSet() {
    this.nextDueDate = undefined;
    this.nextDueDateDisable = true;
  }
  setAutomaticDate() {
    if (this.assessmentDate == null) {
      this.errorMessage = "An Assessment Date is Required";
      this.displayError = true;
    } else {
      this.nextDueDateDisable = true;
      var nextDueDate = _.cloneDeep(this.assessmentDate);
      if (this.nextDueDateSetting.years > 0) {
        nextDueDate = new Date(addDates(nextDueDate, this.nextDueDateSetting.years, "years"));
      }
      if (this.nextDueDateSetting.months > 0) {
        nextDueDate = new Date(addDates(nextDueDate, this.nextDueDateSetting.months, "months"));
      }
      if (this.nextDueDateSetting.days > 0) {
        nextDueDate = new Date(addDates(nextDueDate, this.nextDueDateSetting.days, "days"));
      }
      this.nextDueDate = nextDueDate;
    }
  }
  getProvider(id:number|null):string {
    var provider = this.providers.filter(x=> x.id == id);
    return provider != null && provider.length > 0 ? provider[0].fullNameWithProfession : "No Provider Selected";
  }
  isFunctionValid(functionId: number): boolean{
    if(this.functionList)
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  saveNextAssessment(){
  if (this.nasDate == null){
    this.errorMessage = "Next Assessment Schedule Date and Time is required"
    this.displayError = true;
  }
  else if (this.nasDate < new Date()){
    this.errorMessage = "Next Assessment Schedule Date and Time should be in the future"
    this.displayError = true;
  }
  else{
      this.nasSaved = false;
      if (this.nasProvider == 0){
        this.nextAssessmentSchedule.providerId = null;
      }
      this.nextAssessmentSchedule.assessmentDateTime = new Date(moment(this.nasDate, ['YYYY-MM-DD h:mm A']).format('YYYY-MM-DD HH:mm'));
      this.nextAssessmentSchedule.comments = this.nasComment;
      this.nextAssessmentSchedule.providerId = this.nasProvider;
      this.nextAssessmentSchedule.isActive = true;
      this.workersService.saveWorkerNextAssessmentSchedule(this.workerId, this.nextAssessmentSchedule).subscribe((results: any) => {
          this.displaySchedule = false;
          this.getNextAssessmentSchedule(results);
          this.nasSaved = true;
      });
    }
  }
  archiveNextAssessment(){
    if (this.nasId) {
      this.workersService.archiveNextAssessmentSchedule(this.nasId).subscribe((results:any) => {
        if(results){
          this.showArchiveSchedule = false;
          this.nextAssessmentSchedule = new NextAssesmentSchedule();
        }
      });
    }
  }
  checked(id: number) : boolean{
    let indx = this.selectedFlagNode.findIndex((x) => x.id === id);
    if(indx > -1){
      return true;
    } else {
      return false
    }
  }
  changeToPlainText(text:string):string {
    if (text) {
      let newText = text?.replace(/<[^>]+>/g, '');
      newText = newText?.replace(/\r?\n|\r/g, "");
      return newText;
    }
    return "";
  }
}
