import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { FetchCurrentFunctionalAnalysisForTask, FetchCustomerSettings, FetchTaskDetails, SetSideMenu, ShowSideMenu, FetchTask, FetchPosturalTolerancesNewResults, SetBreadCrumb, FetchFunctionListPermissions } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis, selectPosturalToleranceGroups, selectTaskDetails, selectTask, selectFunctionList, selectNewPosturalResults} from 'src/app/store/job-fit.selectors';
import { Attachments } from '../../shared/models/attachments.model';
import { FASearchCriteria, FunctionalAnalysis, FunctionalAnalysisResult, PosturalToleranceGroup, PosturalToleranceResult, RiskToolResult } from '../../shared/models/functional-analysis.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { NextAssesmentSchedule, Task } from '../../shared/models/task.model';
import { TasksService } from '../tasks-service.service';
import { selectFATaskFlagTree } from 'src/app/store/jobs-store/jobs.selectors';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import * as _ from 'lodash';
import { FetchFATaskFlagTree } from 'src/app/store/jobs-store/jobs.actions';
import { Note, NoteEntity } from 'src/app/shared/models/note.model';
import { Provider } from 'src/app/shared/models/provider.model';
import { HealthHygieneResult, NextDueDate, NextDueDateSetting } from 'src/app/shared/models/health-hygeine.model';
import { Event } from 'src/app/shared/models/search.criteria.model';
import { MaterialHandling, MaterialHandlingGroup } from 'src/app/shared/models/materialHandling.model';
import { ChartData, ChartOptions } from 'chart.js';
import { Grips } from 'src/app/shared/models/grips.model';
import * as moment from 'moment';
import { addDates } from 'src/app/shared/helper/calculations';
import { CheckedEntity } from 'src/app/shared/models/checkedEntity.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

const POSTURAL_TOLERANCE = "Postural Tolerance";
const MATERIAL_HANDLING = "Material Handling";

@Component({
  selector: 'app-functional-analysis',
  templateUrl: './functional-analysis.component.html',
  styleUrls: ['./functional-analysis.component.css']
})
export class FunctionalAnalysisComponent implements OnInit {
  taskId: any;
  items: MenuItem[] = [];
  task: Task | undefined = new Task();
  activeItem: MenuItem | undefined;
  selectedCategory: any = null;
  FALoaded = false;
  visibleSidebar4 = false;
  selectedFlagNode: FlagsTree[] = [];
  attachments: Attachments[] = [];
  selectedReviewDate = '';
  functionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  task$ = this.store.pipe(select(selectTask));
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  faFlagTree$ = this.store.pipe(select(selectFATaskFlagTree));
  newPosturalToleranceResults$ = this.store.pipe(select(selectNewPosturalResults));
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  posturalGroups$ = this.store.pipe(select(selectPosturalToleranceGroups));
  editMode = false;
  providers:Provider[] = [];
  faHistoryEdit:boolean = false;
  viewFA: boolean = false;
  note: Note = new Note();
  faFlagTree: FlagsTree[] = [];
  mainFaFlagTree: FlagsTree[] = [];
  selectedFlagTree: FlagsTree[] = [];
  selectedFlag: number = 0;
  taskDetails: TaskDetails = new TaskDetails();
  currentFunctionalAnalysis?: FunctionalAnalysis;
  selectedFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  backupSelectedFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  riskRatingResults: RiskToolResult[] = [];
  faList: FunctionalAnalysis[] = [];
  faResult: FunctionalAnalysisResult = new FunctionalAnalysisResult();
  posturalGroups: PosturalToleranceGroup[]= [];
  posturalTolerances: PosturalToleranceResult[] = [];
  newPosturalTolerances: PosturalToleranceResult[] = [];
  materialGroups: MaterialHandlingGroup[] = []
  materialHandlings: MaterialHandling[] = [];
  selectedFlagNumbs: number [] = [];
  flagNote: CheckedEntity = new CheckedEntity();
  nextDueDateDisable = false;
  editFlagNote: boolean = false;
  functionList$ = this.store.pipe(select(selectFunctionList));
  newBtnClicked = false;
  editBtnClicked = false;
  events: Event[] = [];
  hygieneResults: HealthHygieneResult[] = [];
  gripItems: Grips[] = [];
  graphData: ChartData | undefined;
  graphStyle: ChartOptions | undefined;
  graphTypes: string[] = [POSTURAL_TOLERANCE, MATERIAL_HANDLING];
  graphSeries: any;
  selectedGraphType: string = '';
  selectedGraphSeries: Array<string|number> = [];
  settings: any;
  viewBtnClicked: boolean = false;
  errorMessage = '';
  displayError = false;
  displaySchedule = false;
  nextAssessmentSchedule: NextAssesmentSchedule = new NextAssesmentSchedule();
  showArchiveSchedule = false;
  showArchiveFA = false;
  selectedFAs:any[] = [];
  tempSelectFlags: FlagsTree[] = [];
  tempPosturalResults: PosturalToleranceResult[] = [];
  functionList:number[] = [];
  nasComment: string = "";
  nasDate: any;
  nasProvider: any;
  nasId: number = 0;
  activeIndex: number = 0;
  comments: string = '';
  nextDueDate: Date|undefined;
  nextDueDateSetting: NextDueDateSetting = new NextDueDateSetting();
  assessmentDate: Date = new Date();
  providerId: number = 0;
  event: Event = new Event();
  faId: number = 0;
  taskOverview:string = '';
  duration: string = '';
  frequencyNotes: string = '';
  taskComments: string = '';
  posturalTolerancesOutput: PosturalToleranceResult[] = [];
  materialHandlingOutput: MaterialHandling[] = [];
  healthHygieneResultOutput: HealthHygieneResult[] = [];
  materialHandlingResults: MaterialHandling[] = [];
  gripItemResults: Grips[] = [];
  gripsOutput: Grips[] = [];
  riskResultOutput: RiskToolResult[] = [];
  faHistoryNoteClicked: boolean = false;
  showNas: boolean = false;
  breadCrumbs: MenuItem[] = [];
  nasSaved: boolean = true;
  notesSaved: boolean = true;
  activeState: boolean[] = [true, false, false, false, false, false, false, false, false];
  hasError: boolean = false;
  allFaLoaded: boolean = false;
  authorisedList: boolean[] =[];
  flagsloaded:boolean = true;
  flagList: FlagsTree[] = [];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(
    private store: Store<JobFitAppState>,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private router: Router
    ) {
    this.store.dispatch(new FetchPosturalTolerancesNewResults());
    this.newPosturalToleranceResults$.subscribe(result => {
      this.newPosturalTolerances = _.cloneDeep(result);
    });
    this.route.params.subscribe((params: Params) => {
      this.store.dispatch(new FetchFATaskFlagTree([]));
      this.taskId = params.taskId;
      this.tasksService.setMenu(params.taskId);
      
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (Object.keys(this.authorisedFunctionList.Function).length > 0){
        if (this.authorisedFunctionList.Function[EFunctions.ViewFunctionalAnalyses] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
          this.getProviders();
          this.getEvents();
          this.getPosturalGroups();
          this.getMaterialGroups();
          this.getSettings();
          this.getAllFlagsTree();
          this.getNextDueDateSetting();
          this.getFunctionalAnalysis(params.taskId);
          this.getAllFunctionalAnalysis(params.taskId, 10 , 1 , 'desc' , 'AssessmentDate');
          this.store.dispatch(new FetchCurrentFunctionalAnalysisForTask(params.taskId));
          this.store.dispatch(new FetchCustomerSettings());
          this.task$.subscribe(result => {
            this.task = result;
            if(this.task.id == 0){
              this.store.dispatch(new FetchTask(params.taskId));
              this.task = result;
            }
            else{
              this.task = result;
            }
            this.breadCrumbs = [
              {icon: 'pi pi-home', url: 'home'},
              {label:'Tasks', url: 'tasks'},
              {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
              {label:'Functional Analysis'},
            ];
            this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
            this.getNextAssessmentSchedule(this.task?.nextAssessmentScheduleId!)
          });
          this.taskDetails$.subscribe(result => {
            this.taskDetails = result;
            if(!this.taskDetails.mainDescriptionHeading){
              this.store.dispatch(new FetchTaskDetails(params.taskId));
              this.taskDetails = result;
            } else {
              this.taskDetails = result;
            }
            
            this.activeState = [false, false, false, false, false, false, false, false, false];
            this.activeState[1] = true;
            this.currentFunctionalAnalysis$.subscribe(result => {
              if(result){
                this.posturalTolerances = result.posturalToleranceResults;
                this.materialHandlings = result.materialHandlingResults;
                this.gripItems = result.gripItemResults;
                this.hygieneResults = result.healthHygieneResults;
              }
            });
          });
         
        } else {
          this.FALoaded = true;
          this.allFaLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
        if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
          this.store.dispatch(new ShowSideMenu(true));
          this.store.dispatch(new SetSideMenu(this.tasksService?.menuList));
        }
      }
    });
  }
  goToReport(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewReports]) {
      this.router.navigate([`../reports/task/${this.taskId}`]);
    }  else {
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
        this.posturalTolerancesOutput = _.cloneDeep(this.currentFunctionalAnalysis.posturalToleranceResults);
        this.faId = this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id;
        this.materialHandlingResults = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.materialHandlingOutput = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.healthHygieneResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.gripItemResults = _.cloneDeep(this.currentFunctionalAnalysis.gripItemResults);
        this.gripsOutput = _.cloneDeep(this.gripItemResults);
        this.riskResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.riskToolResults);
        this.getFlagsTree(this.faId);
      }

    }
  }
  nasToggle(){
    this.showNas = !this.showNas;
  }
  changeAssessmentDate() {
    if (this.selectedReviewDate == "Automatic") {
      this.setAutomaticDate();
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
  setDefaultView() {
    this.activeState = [false, false, false, false, false, false, false, false, false];
    this.activeState[1] = true;
  }
  editSchedule() {
    this.nextAssessmentSchedule.assessmentDateTime = new Date(this.nextAssessmentSchedule.assessmentDateTime);
    this.nasComment = this.nextAssessmentSchedule.comments;
    this.nasDate = this.nextAssessmentSchedule.assessmentDateTime;
    this.nasProvider = this.nextAssessmentSchedule.providerId;
    this.displaySchedule = true;
  }
  cancelEditFaHistory(){
    this.setDefaultView();
    this.hasError = false;
    this.viewFA = true;
    this.faHistoryEdit = false;
  }
  ngOnInit(): void {
  }
  onPageChange(e:any){
    this.getAllFunctionalAnalysis(this.taskId, 10 , e.page , 'desc' , 'AssessmentDate');
  }
  onTabOpen(e:any) {
    this.activeState = [false, false, false, false, false, false, false, false, false];
    var index = e.index;
    this.activeState[index + 1] = true;
  }
  getAllFunctionalAnalysis(taskId:number, count:number ,page:number , dir:string , sortField:string, includeChildren:boolean = false){
    let search: FASearchCriteria = new FASearchCriteria();
    search.count = count;
    search.pageNumber = page;
    search.sortDir = dir;
    search.sortField = sortField;
    search.includeChildren = includeChildren;
    this.allFaLoaded = false;
    this.tasksService.getAllFunctionalAnalysisForTask(taskId, search).subscribe(result => {
      this.faResult = result;
      this.faList = _.cloneDeep(result.functionalAnalysis);
      this.faList.forEach(fa => {
        fa.commentforDisplay = this.changeToPlainText(fa.comments);
      });
      this.allFaLoaded = true;
    });
  }
  isFunctionValid(functionId: number): boolean{
    if(this.functionList)
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getNextDueDateSetting() {
    this.tasksService.getFANextDueDateSetting("Functional Analysis - Tasks").subscribe((results: NextDueDateSetting) => {
      this.nextDueDateSetting = _.cloneDeep(results);
    });
  }
  getFunctionalAnalysis(taskId : number) {
    this.faId = -1;
    this.FALoaded = false;
    this.tasksService.getCurrentFunctionalAnalysis(taskId).subscribe(result => {
      this.selectedFlagNode = [];
      this.selectedFlagNumbs = [];
      if (result && result.id > 0) {
        this.currentFunctionalAnalysis = _.cloneDeep(result);
        this.faId = this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id;
        this.getAFunctionalAnalysis(this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id);
        this.currentFunctionalAnalysis.flags.filter(x=> x.isActive == true).forEach(element => {
          if (!this.selectedFlagNumbs.includes(element.flagId)) {
            this.selectedFlagNumbs.push(element.flagId);
            this.selectedFlagNode.push(element);
          }
        });
        this.flagList = _.cloneDeep(result.flags);
        this.getFlagsTree(this.faId);
        this.posturalTolerancesOutput = _.cloneDeep(this.currentFunctionalAnalysis.posturalToleranceResults);
        this.materialHandlingResults = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.materialHandlingOutput = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.healthHygieneResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.gripItemResults = _.cloneDeep(this.currentFunctionalAnalysis.gripItemResults);
        this.gripsOutput = _.cloneDeep(this.gripItemResults);
        this.riskResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.riskToolResults);
      } else {
        this.currentFunctionalAnalysis = undefined;
      }
      this.FALoaded = true;
    });
  }
  getAFunctionalAnalysis(faId : number){
    this.tasksService.getFunctionalAnalysis(faId).subscribe(result => {
      this.functionalAnalysis = _.cloneDeep(result);
    });
  }
  getFlagsTree(faId: number) {
    this.tasksService.getSelectedTaskFAFlagsForFA(faId).subscribe(result => {
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
    this.tasksService.GetFATreeForTask(faId).subscribe(result => {
        this.faFlagTree =_.cloneDeep(result);
    });
  }
  onPosturalToleranceChange(posturalTolerances: PosturalToleranceResult[]){
    this.posturalTolerancesOutput = _.cloneDeep(posturalTolerances);
  }
  onMaterialHandlingChange(materialHandling: MaterialHandling[]){
    this.materialHandlingOutput = _.cloneDeep(materialHandling);
  }
  onHealthHygieneResultsChange(hhResult: HealthHygieneResult[]){
    this.healthHygieneResultOutput = _.cloneDeep(hhResult);
  }
  onGripsChange(grips: Grips[]){
    this.gripsOutput = _.cloneDeep(grips);
  }
  saveFunctionalAnalysis(current:boolean) {
    if (!this.assessmentDate) {
      this.errorMessage = "Assessment Date is required!";
      this.displayError = true;
    } else if (this.event.id == 0) {
      this.errorMessage = "Please select an Event!";
      this.displayError = true;
    } else if (this.selectedReviewDate === 'ManualDate' && this.nextDueDate == null){
      this.errorMessage = "Next Review Date is required if Manual is selected";
      this.displayError = true;
    } else{
      this.FALoaded = false;
      this.hasError = false;
      let functionalAnalysis = new FunctionalAnalysis();
      if(current && this.currentFunctionalAnalysis){
        functionalAnalysis = _.cloneDeep(this.currentFunctionalAnalysis);
      } else {
        functionalAnalysis = _.cloneDeep(this.selectedFunctionalAnalysis);
      }
      functionalAnalysis.posturalToleranceResults = _.cloneDeep(this.posturalTolerancesOutput);
      functionalAnalysis.posturalToleranceResults.forEach(x=> {
        x.functionalAnalysisId = functionalAnalysis.originalRevisionId && functionalAnalysis.originalRevisionId > 0 ? functionalAnalysis.originalRevisionId:functionalAnalysis.id;
      });
      functionalAnalysis.materialHandlingResults = _.cloneDeep(this.materialHandlingOutput);
      functionalAnalysis.healthHygieneResults = _.cloneDeep(this.healthHygieneResultOutput);
      functionalAnalysis.gripItemResults = _.cloneDeep(this.gripsOutput);
      functionalAnalysis.riskToolResults = _.cloneDeep(this.riskResultOutput);
      functionalAnalysis.posturalToleranceResults.forEach(x=> {
        x.functionalAnalysisId = functionalAnalysis.originalRevisionId && functionalAnalysis.originalRevisionId > 0 ? functionalAnalysis.originalRevisionId:functionalAnalysis.id;
      });

      this.selectedFlagNumbs = [];
      var flagsTree: FlagsTree[] = [];
      if(this.selectedFlagNode.length > 0){

        this.selectedFlagNode.forEach((node:FlagsTree) => {
              let nodeNote = this.functionalAnalysis?.flags.find((x) => x.flagId === (node.flagId > 0 ? node.flagId:node.id))?.note ?? new NoteEntity();

              if (node.typeId != 6) {
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
      functionalAnalysis.duration = this.duration;
      functionalAnalysis.frequencyNotes = this.frequencyNotes;
      functionalAnalysis.taskComments = this.taskComments;
      functionalAnalysis.taskOverview = this.taskOverview;

      this.tasksService.saveTaskFunctionalAnalysis(this.taskId, functionalAnalysis).subscribe(result => {
        if(result){
          this.getAllFunctionalAnalysis(this.taskId, 10 , 1 , 'desc' , 'AssessmentDate');
          this.getFunctionalAnalysis(this.taskId);
          this.setDefaultView();
          this.editMode = false;
          this.faHistoryEdit = false;
          this.editBtnClicked = false;
          this.newBtnClicked = false;
          this.FALoaded = true;
        }
      });

    }
}
  formatHHResults(healthHygieneResults: HealthHygieneResult[]) {
    const updatedHygieneResults = healthHygieneResults.map(healthHygiene => {
      const updatedResults = healthHygiene.results.map(result => {
        return {
          ...result,
          isActive: true,
          useResult: healthHygiene.isActive,
        }
      })
      return { ...healthHygiene, results: updatedResults }
    });
    return updatedHygieneResults;
  }
  viewGraph() {
    let search: FASearchCriteria = new FASearchCriteria();
    search.count = 1000;
    search.pageNumber = 1;
    search.sortDir = "asc";
    search.sortField = "AssessmentDate";
    search.includeChildren = true
    this.FALoaded = false;
    this.tasksService.getAllFunctionalAnalysisForTask(this.taskId, search).subscribe(result => {
      const fas = result.functionalAnalysis;
      const { labels, datasets } = this.selectedGraphType === POSTURAL_TOLERANCE
        ? this.generatePosturalGraphData(fas)
        : this.generateMaterialGraphData(fas);

      this.graphData = { labels, datasets };
      this.graphStyle = this.getGraphStyle();
      this.viewBtnClicked = true;
      this.FALoaded = true;
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
    let labels: string[] = []
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
  getProviderName(id:number) : string{
    let provider = this.providers.find((x) => x.id === id);
    if(provider){
      return provider.fullName;
    } else {
      return '';
    }
  }

  getRiskToolResults(e: RiskToolResult[]){
    this.riskResultOutput = e;
  }
  getSelectedFlags(tree:FlagsTree[]){
    let ids = this.selectedFlagNumbs;
    tree.forEach(element => {
      if(element.typeId === 6){
        element.children = element.children.filter((item) => (ids.indexOf(item.id) > -1) || (item.typeId === 6));
      }
      this.getSelectedFlags(element.children);
    });
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

  getHistorySpecificNote(id: number) : string | null{
    let indx = this.selectedFunctionalAnalysis?.flags.find((x) => x.flagId === id);
    if((indx) && (indx.note) && (indx.note?.text?.length > 0)){
      return 'Specific Note: ' + indx.note?.text;
    } else {
      return null
    }
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

  getNote(flagId: number, history?:boolean): NoteEntity | undefined {
    let indx = this.functionalAnalysis?.flags.find((x) => x.flagId === flagId);
    if(history){
      indx = this.selectedFunctionalAnalysis?.flags.find((x) => x.flagId === flagId);
    }
    let newNote = new NoteEntity();
    newNote.isActive = true;
    if(indx){
      newNote.text = indx?.note?.text ?? '';
    }
    return newNote;
  }

  checked(id: number) : boolean{
    let indx = this.selectedFlagNode.findIndex((x) => x.id === id);
    if(indx > -1){
      return true;
    } else {
      return false
    }
  }
  getAllFlagsTree() {
    this.faFlagTree$.subscribe(result => {
      this.faFlagTree = _.cloneDeep(result);
      this.mainFaFlagTree = _.cloneDeep(result);
    });
  }
  viewFAHistory(fa:FunctionalAnalysis){
    this.faHistoryNoteClicked = true;
    this.activeIndex = 2;
    this.activeState = [false, true, false, false, false, false, false, false, false];
    this.hasError = false;
    this.selectedFunctionalAnalysis = _.cloneDeep(fa);
    this.backupSelectedFunctionalAnalysis = _.cloneDeep(fa);
    this.faId = this.selectedFunctionalAnalysis.originalRevisionId ?? this.selectedFunctionalAnalysis.id;
    this.assessmentDate = new Date(this.selectedFunctionalAnalysis.assessmentDate);
    this.nextDueDate = new Date(this.selectedFunctionalAnalysis.nextDueDate.date ?? new Date);
    this.providerId = this.selectedFunctionalAnalysis.providerId;
    this.event = this.selectedFunctionalAnalysis.event;
    this.comments = this.selectedFunctionalAnalysis.comments;
    this.taskOverview = this.selectedFunctionalAnalysis.taskOverview;
    this.duration = this.selectedFunctionalAnalysis.duration;
    this.frequencyNotes = this.selectedFunctionalAnalysis.frequencyNotes;
    this.taskComments = this.selectedFunctionalAnalysis.taskComments;
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
    this.posturalTolerancesOutput = _.cloneDeep(this.selectedFunctionalAnalysis.posturalToleranceResults);
    this.materialHandlingOutput =  _.cloneDeep(this.selectedFunctionalAnalysis.materialHandlingResults);
    this.healthHygieneResultOutput = _.cloneDeep(this.selectedFunctionalAnalysis.healthHygieneResults);
    this.materialHandlingResults = _.cloneDeep(this.selectedFunctionalAnalysis.materialHandlingResults);
    this.gripItemResults = _.cloneDeep(this.selectedFunctionalAnalysis.gripItemResults);
    this.gripsOutput = _.cloneDeep(this.gripItemResults);
    this.riskResultOutput = _.cloneDeep(this.selectedFunctionalAnalysis.riskToolResults);

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
      this.faId = this.selectedFunctionalAnalysis.originalRevisionId ?? this.selectedFunctionalAnalysis.id;
      this.assessmentDate = new Date(this.selectedFunctionalAnalysis.assessmentDate);
      this.nextDueDate = new Date(this.selectedFunctionalAnalysis.nextDueDate.date ?? new Date);
      this.providerId = this.selectedFunctionalAnalysis.providerId;
      this.event = this.selectedFunctionalAnalysis.event;
      this.comments = this.selectedFunctionalAnalysis.comments;
      this.taskOverview = this.selectedFunctionalAnalysis.taskOverview;
      this.duration = this.selectedFunctionalAnalysis.duration;
      this.frequencyNotes = this.selectedFunctionalAnalysis.frequencyNotes;
      this.taskComments = this.selectedFunctionalAnalysis.taskComments;
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
      this.posturalTolerancesOutput = _.cloneDeep(this.selectedFunctionalAnalysis.posturalToleranceResults);
      this.materialHandlingOutput =  _.cloneDeep(this.selectedFunctionalAnalysis.materialHandlingResults);
      this.healthHygieneResultOutput = _.cloneDeep(this.selectedFunctionalAnalysis.healthHygieneResults);
      this.materialHandlingResults = _.cloneDeep(this.selectedFunctionalAnalysis.materialHandlingResults);
      this.gripItemResults = _.cloneDeep(this.selectedFunctionalAnalysis.gripItemResults);
      this.gripsOutput = _.cloneDeep(this.gripItemResults);
      this.riskResultOutput = _.cloneDeep(this.selectedFunctionalAnalysis.riskToolResults);

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
      this.faHistoryNoteClicked = true;
      this.activeIndex = 2;
      this.activeState = [true, false, false, false, false, false, false, false, false];
      this.hasError = false;
      this.viewFA = false;
      this.faHistoryEdit = true;
    }  else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  cancelView() {
    this.setDefaultView();
    this.viewFA = false;
  }
  editFA(){
    if (this.authorisedFunctionList.Function[EFunctions.EditFunctionalAnalysis]) {
      this.activeIndex = 0;
      this.editMode = true;
      this.editBtnClicked = true;
      this.hasError = false;
      this.activeState = [true, false, false, false, false, false, false, false, false];
      if (this.currentFunctionalAnalysis) {
        this.faId = this.currentFunctionalAnalysis.originalRevisionId ?? this.currentFunctionalAnalysis.id;
        this.assessmentDate = new Date(this.currentFunctionalAnalysis.assessmentDate);
        this.nextDueDate = new Date(this.currentFunctionalAnalysis.nextDueDate.date ?? new Date);
        this.providerId = this.currentFunctionalAnalysis.providerId;
        this.event = this.currentFunctionalAnalysis.event;
        this.comments = this.currentFunctionalAnalysis.comments;

        this.taskOverview = this.currentFunctionalAnalysis.taskOverview;
        this.duration = this.currentFunctionalAnalysis.duration;
        this.frequencyNotes = this.currentFunctionalAnalysis.frequencyNotes;
        this.taskComments = this.currentFunctionalAnalysis.taskComments;
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
        this.materialHandlingResults = _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.posturalTolerancesOutput = _.cloneDeep(this.currentFunctionalAnalysis.posturalToleranceResults);
        this.materialHandlingOutput =  _.cloneDeep(this.currentFunctionalAnalysis.materialHandlingResults);
        this.healthHygieneResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
        this.gripItemResults = _.cloneDeep(this.currentFunctionalAnalysis.gripItemResults);
        this.gripsOutput = _.cloneDeep(this.gripItemResults);
        this.riskResultOutput = _.cloneDeep(this.currentFunctionalAnalysis.riskToolResults);
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
    }  else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  cancelEditFa(){
    this.editMode = false;
    this.editBtnClicked = false;
    this.hasError = false;
    this.setDefaultView();
    this.getFunctionalAnalysis(this.taskId);
  }
  cancelNewFA(){
    this.editMode = false;
    this.hasError = false;
    this.newBtnClicked = false;
    this.setDefaultView();
    this.getFunctionalAnalysis(this.taskId);
  }
  newFA() {
    if (this.authorisedFunctionList.Function[EFunctions.AddFunctionalAnalysis]) {
      this.activeIndex = 0;
      this.hasError = false;
      this.activeState = [true, false, false, false, false, false, false, false, false];
      this.editMode = true;
      this.newBtnClicked = true;
      this.selectedReviewDate = "NotSet";
      this.assessmentDate = new Date();
      this.nextDueDate = undefined;
      this.providerId = 0;
      this.event = new Event();
      this.comments = '';
      this.taskOverview = '';
      this.duration = '';
      this.frequencyNotes = '';
      this.taskComments = '';
      this.currentFunctionalAnalysis = new FunctionalAnalysis();
      this.functionalAnalysis = new FunctionalAnalysis();
      this.selectedFlagNode = [];
      this.posturalTolerancesOutput = [];
      this.materialHandlingResults = [];
      this.healthHygieneResultOutput = [];
      this.materialHandlingOutput = [];
      this.gripsOutput = [];
      this.gripItemResults = [];
      this.faId = -1;
      this.faFlagTree = this.mainFaFlagTree;
    }  else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
        title: ACCESS_DENIED_TITLE}));
    }
  }
  getProviders(){
    this.tasksService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  getEvents(){
    this.tasksService.getEvents().subscribe(result => {
      this.events = result;
    });
  }
  getPosturalGroups() {
    this.tasksService.getPosturalToleranceGroups().subscribe(result => {
      this.posturalGroups = result;
    });
  }
  getMaterialGroups() {
    this.tasksService.getMaterialHandlingGroups().subscribe(result => {
      this.materialGroups = result;
    });
  }
  getSettings() {
    this.tasksService.getSettings().subscribe(result => {
      this.settings = result;
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
  getNextAssessmentSchedule(id: number) {
    if (id) {
      this.nasId = id;
      this.tasksService.getNextAssessmentSchedule(id).subscribe((results: any) => {
        this.nextAssessmentSchedule = _.cloneDeep(results);
        this.nasDate = new Date(this.nextAssessmentSchedule.assessmentDateTime);
        this.nasComment = this.nextAssessmentSchedule.comments;
        this.nasProvider = this.nextAssessmentSchedule.providerId;
      })
    }
  }
  getProvider(id:number|null):string {
    var provider = this.providers.filter(x=> x.id == id);
    return provider != null && provider.length > 0 ? provider[0].fullNameWithProfession : "No Provider Selected";
  }
  closeValidation() {
    this.displayError = false;
    this.hasError = true;
    this.activeState = [true, false, false, false, false, false, false, false, false];
  }

  saveNextAssessment(){
    if (this.nasDate == null){
      this.errorMessage = "Next Assessment Date and Time is Required";
      this.displayError = true;
    }
    else if (this.nasDate < new Date()){
      this.errorMessage = "Next Assessment Date and Time should be in the future"
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
        this.tasksService.saveNextAssessmentSchedule(this.taskId, this.nextAssessmentSchedule).subscribe((results: any) => {
            this.displaySchedule = false;
            this.getNextAssessmentSchedule(results);
            this.nasSaved = true;
        });
      }
    }
  archiveNextAssessment(){
    if (this.nasId) {
      this.tasksService.archiveNextAssessmentSchedule(this.nasId).subscribe((results:any) => {
        if(results){
          this.showArchiveSchedule = false;
          this.nextAssessmentSchedule = new NextAssesmentSchedule();
        }
      });
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
  archiveFunctionalAnalysis() {
      var ids = [this.faId];
      this.FALoaded = false;
      for (const id of ids)
      {
        this.tasksService.archiveTaskFunctionalAnalysis(id).subscribe(result => {
          this.getAllFunctionalAnalysis(this.taskId, 10 , 1 , 'desc' , 'AssessmentDate');
          this.getFunctionalAnalysis(this.taskId);
          this.showArchiveFA = false;
          this.setDefaultView();
          this.viewFA = false;
          this.FALoaded = true;
   
        });
      }
      this.FALoaded = true;
   
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


