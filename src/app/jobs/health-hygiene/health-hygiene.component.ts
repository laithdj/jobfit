import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Provider } from 'src/app/shared/models/provider.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { EInputType, HealthHygiene, HealthHygieneInputItemResult, HealthHygieneInputItemView, HealthHygieneInputListItem, HealthHygieneResult, HHResultPerCategory, NextDueDate, NextDueDateSetting } from '../../shared/models/health-hygeine.model';
import { JobsService } from '../jobs.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { addDates } from 'src/app/shared/helper/calculations';
import { HealthHygieneNextAssessmentSchedule } from 'src/app/shared/models/jobs.model';
import { EFunctions } from 'src/app/shared/models/user.model';
import { selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { MenuItem } from 'primeng/api';
import { FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { take } from 'rxjs/operators';
const Moment = require('moment')


@Component({
  selector: 'job-health-hygiene',
  templateUrl: './health-hygiene.component.html',
  styleUrls: ['./health-hygiene.component.css']
})
export class HealthHygieneComponent implements OnInit {
  jobId: any;
  showAddHH = false;
  showArchiveHH = false;
  selectedProviderId: number = 0;
  editMode = false;
  selectedReviewDate: string = 'NotSet';
  providers:Provider[] = [];
  values: any[] = [];
  nextDueDateDisable: boolean = false;
  mainHygieneList: HealthHygiene[] = [];
  hygieneResults: HealthHygieneResult[] = [];
  mainHygieneResults: HealthHygieneResult[] = [];
  latestHygieneResults: HealthHygieneResult[] = [];
  selectedHealthHygiene: HealthHygieneResult = new HealthHygieneResult();
  hhId: number = 0;
  existingValue: any = 0;
  HHLoaded = false;
  errorMessage = '';
  displayError = false;
  selectedHealthHygieneResult: any;
  functionList$ = this.store.pipe(select(selectFunctionList));
  hhResultPerCategoryList: HHResultPerCategory[][] = [];
  selectedHHResultPerCategory: HHResultPerCategory[] =[];
  assessmentDate: Date = new Date();
  nextDueDate: Date|undefined;
  nextDueDateSetting: NextDueDateSetting = new NextDueDateSetting();
  hhName:string = '';
  header: string = '';
  nextAssessmentSchedule: HealthHygieneNextAssessmentSchedule = new HealthHygieneNextAssessmentSchedule();
  showArchiveSchedule:boolean = false;
  nasComment: string = "";
  nasDate: any;
  nasProvider: any;
  nasId: number = 0;
  hhNasId: number = 0;
  displaySchedule: boolean = false;
  nextAssessmentSchedules: HealthHygieneNextAssessmentSchedule[] = [];
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  showNas: boolean = false;
  job$ = this.store.pipe(select(selectJobDetails));
  breadCrumbs: MenuItem[] = [];
  nasSaved:boolean = true;
  hhSaved: boolean = true;
  constructor(private router: Router,
    private store: Store<JobFitAppState>,
    private jobsService: JobsService,
    private taskService: TasksService,
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.jobId = params.jobId;
      this.jobsService.setMenu(params.jobId);
      this.functionList$.subscribe(result => {
        this.functionList = result;
        this.authorisedList = [];
        this.authorisedList.push(this.isFunctionValid(EFunctions.AddHealthHygiene));
        this.authorisedList.push(this.isFunctionValid(EFunctions.ViewProviders));
        this.authorisedList.push(this.isFunctionValid(EFunctions.EditHealthHygiene));
        this.authorisedList.push(this.isFunctionValid(EFunctions.DeleteHealthHygiene));
        this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
      });
      this.store.dispatch(new FetchJobDetails(this.jobId));
          this.job$.subscribe(result => {
            this.breadCrumbs = [
              {icon: 'pi pi-home', url: 'home'},
              {label:'Jobs', url: 'jobs'},
              {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobId}` },
              {label:'Health and Hygiene'},
            ];
            this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
          });
    });
    this.getMainHygieneList();
    this.getProviders();
    this.getMainHygieneResults(this.jobId);
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
    this.getNextAssessmentSchedules(this.jobId);
  }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`./reports/job/${this.jobId}`]);
  }
  nasToggle(){
    this.showNas = !this.showNas;
  }
  getProviders(){
    this.taskService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  selectProvider(e: any){
    this.selectedProviderId = e.value;
  }
  getMainHygieneList() {
    this.HHLoaded = false;
    this.taskService.getMainHealthHygieneByType("Jobs").subscribe((results: any) => {
        this.mainHygieneList = _.cloneDeep(results);
        this.HHLoaded = true;
    });
  }
  getMainHygieneResults(id: number) {
    this.HHLoaded = false;
    this.jobsService.getMainHealthHygieneResults(id).subscribe((results: HealthHygieneResult[]) => {
        this.mainHygieneResults = _.cloneDeep(results);
        if(this.selectedHealthHygiene.healthHygieneId > 0) {
          this.filterHealthHygieneResults(this.selectedHealthHygiene.healthHygieneId);
        }
        this.HHLoaded = true;
    });
  }
  getNextAssessmentSchedules(id: number) {
    this.jobsService.getJobHealthHygieneNextAssessmentSchedule(id).subscribe((results: HealthHygieneNextAssessmentSchedule[]) => {
        this.nextAssessmentSchedules = _.cloneDeep(results);
    });
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
      this.selectedHealthHygiene.nextDueDate.date = nextDueDate;
    }
  }
  saveResult() {
    if(this.assessmentDate == null){
      this.errorMessage = "An Assessment Date is Required";
      this.displayError = true;
    }
    else{
      this.hhSaved = false;
      if(this.selectedReviewDate === 'ManualDate'){
        this.selectedHealthHygiene.nextDueDate.date = new Date(moment(this.nextDueDate).format('YYYY-MM-DD'));
        this.selectedHealthHygiene.nextDueDate.isManualNextDueDate = true;
      }
      if(this.selectedReviewDate === 'NotSet'){
        this.selectedHealthHygiene.nextDueDate.isManualNextDueDate = undefined;
        this.selectedHealthHygiene.nextDueDate.date = undefined;
      }
      if(this.selectedReviewDate === 'Automatic'){
        this.selectedHealthHygiene.nextDueDate.isManualNextDueDate = false;
        this.selectedHealthHygiene.nextDueDate.date = new Date(moment(this.nextDueDate).format('YYYY-MM-DD'));
      }
      this.selectedHealthHygiene.assessmentDate =  new Date(moment(this.assessmentDate).format('YYYY-MM-DD'));
      this.selectedHealthHygiene.isActive = true;
      this.selectedHealthHygiene.nextDueDate.source = 'User';
      this.jobsService.saveMainHealthHygieneResult(this.jobId , this.selectedHealthHygiene).subscribe((results: any) => {
          this.showAddHH = false;
          this.hhSaved = true;
          this.editMode = false;

          this.getMainHygieneResults(this.jobId);
      });
    }

  }
  getProvider(id:number):string {
    var provider = id > 0 ? this.providers.filter(x=> x.id == id): null;
    return provider != null && provider.length > 0 ? provider[0].fullNameWithProfession : "No Provider Selected";
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }

  filterHealthHygieneResults(id: number){
    this.hygieneResults = _.cloneDeep(this.mainHygieneResults).filter((hyg) => hyg.healthHygieneId === id);
    if((this.hygieneResults[this.hygieneResults?.length -1]) && (this.hygieneResults[this.hygieneResults?.length -1].healthHygieneId > 0)) {
      this.latestHygieneResults[0] =  this.hygieneResults[0];
    } else{
      this.latestHygieneResults = [];
    }
    this.filterHHResultPerCategory();
  }
  filterHHResultPerCategory() {
    this.hhResultPerCategoryList = [];
    this.hygieneResults.forEach(hr => {
      var hhResultPerCategories:HHResultPerCategory[] = [];
      // get list of unique categories per HH result
      var uniqueCategories = this.getUniqueCategoriesFromResults(hr.healthHygiene.inputItems);
      uniqueCategories.forEach(cat => {
        var hhResultPerCategory = new HHResultPerCategory()
        hhResultPerCategory.category = cat;
        hhResultPerCategory.healthHygieneResultId = hr.id;
        // get input items per category
        var inputItemListPerCategory = this.getItemsPerCategory(cat, hr.healthHygiene.inputItems)
        inputItemListPerCategory.forEach(inputItem =>{
          let result = new HealthHygieneInputItemResult();
          result.inputItem = inputItem;
          result.healthHygieneInputItemId = inputItem.id;
          result.healthHygieneResultId = inputItem.healthHygieneId;
          result.inputTypeId = inputItem.inputTypeId;
          result.name = inputItem.name;
          //find index of the input item to get the result
          var index = hr.results.findIndex(x=> x.healthHygieneInputItemId == inputItem.id);
          if (index > -1 && hr.results.length > 0 && index < hr.results.length ) {
            result.id =  hr.results[index].id;
            result.healthHygieneResultId = hr.results[index].healthHygieneResultId;
            result.value = hr.results[index].value;
            result.useResult = hr.results[index].useResult;
          }
          if (result.inputTypeId == EInputType.Date && result.value != null && result.value != "") {
            var dateStr = result.value.split("/");
            result.value = moment(new Date(Number(dateStr[2]), Number(dateStr[1]) -1, Number(dateStr[0]))).format('DD-MMM-YYYY');
          }
          if (result.inputTypeId == EInputType.Selection) {
            //get the value of list item
            result.valueText = this.getListValueText(result.value, inputItem.listItems);
          }
          if (result.value != null && result.value.indexOf(";") > -1 && (result.inputTypeId == EInputType.DateRange || result.inputTypeId == EInputType.DecimalRange || result.inputTypeId == EInputType.WholeNumberRange)) {
            result.value = result.value.replace(";", ",")
          }
          if (result.inputTypeId == EInputType.DateRange && result.value != null && result.value != "") {
            var dateStr = result.value.split(",");
            var date1 = dateStr[0].toString().split("/");
            var date2 = dateStr[1].toString().split("/");
            result.value = moment(new Date(Number(date1[2]), Number(date1[1]) -1, Number(date1[0]))).format('DD-MMM-YYYY') + "," + moment(new Date(Number(date2[2]), Number(date2[1]) -1, Number(date2[0]))).format('DD-MMM-YYYY');
          }
          hhResultPerCategory.results.push(result);
        });
        hhResultPerCategories.push(hhResultPerCategory);
      });
      this.hhResultPerCategoryList.push(hhResultPerCategories);
    });

  }

  getUniqueCategoriesFromResults(hhList: HealthHygieneInputItemView[]|undefined){
    return hhList ? [...new Set(hhList.map(item => item.category))] : [];
  }
  getItemsPerCategory(category: string, hhList: HealthHygieneInputItemView[]|undefined) {
    return hhList ? hhList.filter(x=> x.category == category) : [];
  }
  setList(e: any){
    let setId = e?.value;
    this.hhId = setId;
    this.filterHealthHygieneResults(setId);
    this.filterHealthHygiene(setId);
  }
  filterHealthHygiene(hhId: number) {
    var hh = _.cloneDeep(this.mainHygieneList.filter(x=> x.id == hhId)[0])
    this.nextDueDateSetting = hh.nextDueDateSetting;
    this.hhName = hh.name;
    // get next assessment schedule
    var nas = this.nextAssessmentSchedules.filter(x=> x.healthHygieneId== hhId);
    if (nas.length > 0) {
      this.nextAssessmentSchedule = _.cloneDeep(nas[0]);
    } else {
      this.nextAssessmentSchedule = new HealthHygieneNextAssessmentSchedule();
    }
  }
  setNewResult() {
    let option = this.mainHygieneList.find((x) => x.id === this.hhId);
    this.selectedHealthHygiene = new HealthHygieneResult();
    this.nextDueDateDisable = true;
    this.selectedReviewDate = "NotSet";
    this.nextDueDate = undefined;
    this.assessmentDate = new Date();
    this.selectedHealthHygiene.assessmentDate = new Date();
    this.selectedHealthHygiene.nextDueDate = new NextDueDate();
    this.selectedHealthHygiene.results = [];
    this.selectedHealthHygiene.healthHygieneId = this.hhId;
    this.selectedHealthHygiene.healthHygiene.inputItems = option?.inputItems ?? [];
    this.selectedHealthHygiene.healthHygiene.inputItems.forEach(element => {
      let result = new HealthHygieneInputItemResult();
      result.inputItem = element;
      result.healthHygieneInputItemId = element.id;
      result.healthHygieneResultId = element.healthHygieneId;
      result.isActive = true;
      result.value = '';
      this.selectedHealthHygiene.results.push(result)
    });
    this.selectedHHResultPerCategory = [];
    // get list of unique categories per HH result
    var uniqueCategories = this.getUniqueCategoriesFromResults(this.selectedHealthHygiene.healthHygiene.inputItems);
    uniqueCategories.forEach(cat => {
        var hhResultPerCategory = new HHResultPerCategory()
        hhResultPerCategory.category = cat;
        hhResultPerCategory.healthHygieneResultId = 0;
        // get input items per category
        var inputItemListPerCategory = this.getItemsPerCategory(cat, this.selectedHealthHygiene.healthHygiene.inputItems)
        inputItemListPerCategory.forEach(inputItem =>{
          let result = new HealthHygieneInputItemResult();
            result.inputItem = inputItem;
            result.healthHygieneInputItemId = inputItem.id;
            result.healthHygieneResultId = inputItem.healthHygieneId;
            result.inputTypeId = inputItem.inputTypeId;
            result.name = inputItem.name;
            result.useResult = false;
            result.value = '';
            hhResultPerCategory.results.push(result);
        });
        this.selectedHHResultPerCategory.push(hhResultPerCategory);
      });
  }

  setValue(e: any,item: HealthHygieneInputItemView){
    var value = e;
    if (Array.isArray(e)) {
      value = e.toString()
    }
    if (value instanceof Date) {
      value = moment(value).format('DD/MM/YYYY');
    }
    if (item.inputTypeId == EInputType.DateRange && value.indexOf(";") > -1) {
      var valRange = value.toString().split(";");
      var dateValue1 = valRange[0] != 'undefined' ? moment(valRange[0]).format('DD/MM/YYYY'): null;
      var dateValue2 = valRange[1] != 'undefined' ? moment(valRange[1]).format('DD/MM/YYYY'): null;
      if (dateValue1 && dateValue2) {
        value = dateValue1 + ";" + dateValue2;
      }else {
        value = null;
      }
    }
    const hhrIndex = this.selectedHealthHygiene.results.findIndex(x=> x.healthHygieneInputItemId == item.id);
    if (hhrIndex > -1 && hhrIndex < this.selectedHealthHygiene.results.length) {
      this.selectedHealthHygiene.results[hhrIndex].inputItem = item;
      this.selectedHealthHygiene.results[hhrIndex].isActive = true;
      this.selectedHealthHygiene.results[hhrIndex].useResult = true;
      this.selectedHealthHygiene.results[hhrIndex].value = value;
    } else {
        const newResult = new HealthHygieneInputItemResult();
        newResult.healthHygieneInputItemId = item.id;
        newResult.inputItem = item;
        newResult.isActive = true;
        newResult.useResult = true;
        newResult.value = value;
        this.selectedHealthHygiene.results.push(newResult);
    }
  }

  changeAssessmentDate() {
    if (this.selectedReviewDate == "Automatic") {
      this.setAutomaticDate();
    }
  }
  getListValueText(value: string, listItems: HealthHygieneInputListItem[]){
    var list:string[] = []
    if (value != null && listItems.length > 0) {
      if (value.indexOf(";") > -1 || value.indexOf(",") > -1) {
        var val = value.indexOf(";") > -1 ? value.split(";") : value.split(",");
        val.forEach(v => {
          var item = listItems.filter(x=> x.id.toString() == v);
          if (item.length > 0) {
            list.push(item[0].itemText)
          }
        });
        return list.join(", ");
      } else {
        var item = listItems.filter(x=> x.id.toString() == value);
        if (item.length > 0) {
          return item[0].itemText;
        }
        return '';
      }
    }
    return '';

  }
  archiveResult(){
      const id = this.selectedHealthHygieneResult.id;
      this.taskService.archiveHealthHygiene(id).subscribe((results: any) => {
        if (results){
          this.showArchiveHH = false;
          this.getMainHygieneResults(this.jobId);
          this.filterHealthHygieneResults(this.hhId);
        }
    });
  }

  edit(hyg: any) {
    this.header = "Edit Health Hygiene Result Details";
    this.selectedHHResultPerCategory = this.hhResultPerCategoryList.length > 0 && this.hhResultPerCategoryList[0].length > 0
                              ? _.cloneDeep(this.hhResultPerCategoryList.filter(x=> x[0].healthHygieneResultId == hyg.id)[0]): [];
    this.selectedHealthHygiene = _.cloneDeep(hyg);
    this.assessmentDate = new Date(hyg.assessmentDate);
    if (this.selectedHealthHygiene.nextDueDate.isManualNextDueDate == true) {
      this.nextDueDate = this.selectedHealthHygiene.nextDueDate.date ? new Date(this.selectedHealthHygiene.nextDueDate.date): undefined;
      this.selectedReviewDate = "ManualDate";
      this.nextDueDateDisable = false;
    } else if (this.selectedHealthHygiene.nextDueDate.isManualNextDueDate == false) {
      this.nextDueDate = this.selectedHealthHygiene.nextDueDate.date ? new Date(this.selectedHealthHygiene.nextDueDate.date): undefined;
      this.selectedReviewDate = "Automatic";
      this.nextDueDateDisable = true;
    } else {
      this.nextDueDate = undefined;
      this.selectedReviewDate = "NotSet";
      this.nextDueDateDisable = true;
    }

    this.showAddHH = true;
  }
  addSchedule() {
    this.nextAssessmentSchedule = new HealthHygieneNextAssessmentSchedule();
    this.hhNasId = this.hhId;
    this.nasComment = '';
    this.nasDate = new Date();
    this.nasProvider = 0;
    this.displaySchedule = true;
  }
  editSchedule() {
    this.nextAssessmentSchedule.assessmentDateTime = new Date(this.nextAssessmentSchedule.assessmentDateTime);
    this.hhNasId = this.hhId;
    this.nasId = this.nextAssessmentSchedule.nextAssessmentScheduleId;
    this.nasComment = this.nextAssessmentSchedule.comments;
    this.nasDate = this.nextAssessmentSchedule.assessmentDateTime;
    this.nasProvider = this.nextAssessmentSchedule.providerId;
    this.displaySchedule = true;
  }
  archiveNextAssessment(){
    var id = this.nextAssessmentSchedule.originalRevisionId != null && this.nextAssessmentSchedule.originalRevisionId > 0? this.nextAssessmentSchedule.originalRevisionId : this.nextAssessmentSchedule.nextAssessmentScheduleId;
    if (id> 0) {
      this.jobsService.archiveHealthHygieneNextAssessmentSchedule(id).subscribe((results:any) => {
        if(results){
          this.showArchiveSchedule = false;
          this.getNextAssessmentSchedules(this.jobId);
          this.nextAssessmentSchedule = new HealthHygieneNextAssessmentSchedule();
        }
      });
    }
  }
  saveNextAssessment(){
    if (this.nasDate == null){
      this.errorMessage = "A Date and Time is Required"
      this.displayError = true;
    }
    else if (this.nasDate < new Date()){
      this.errorMessage = "Cannot Put In A Past Date"
      this.displayError = true;
    }
    else{
        if (this.nasProvider == 0){
          this.nextAssessmentSchedule.providerId = null;
        }
        this.nasSaved = false;
        this.nextAssessmentSchedule.assessmentDateTime = this.nasDate;
        this.nextAssessmentSchedule.comments = this.nasComment;
        this.nextAssessmentSchedule.providerId = this.nasProvider;
        this.nextAssessmentSchedule.isActive = true;
        this.nextAssessmentSchedule.healthHygieneId = this.hhNasId;
        this.jobsService.saveJobHealthHygieneNextAssessmentSchedule(this.jobId, this.nextAssessmentSchedule).subscribe((results: any) => {
            this.displaySchedule = false;
            this.nextAssessmentSchedule.nextAssessmentScheduleId = results;
            this.getNextAssessmentSchedules(this.jobId);
            this.nasSaved = true;
        });
      }
    }

    isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
      if(functionList)
      var indx = functionList.find((x) => x === functionId);
      return indx ? false : true
    }
    cancelViewEdit(){
      this.showAddHH = false;
      this.editMode = false;
    }
    editHH(functionId: number){
      this.functionList$.pipe(take(1)).subscribe((result) => {
        if (result) {
          var indx = result.find((x) => x === functionId);
          if(indx){
            this.editMode = true;
          } else {
            console.log('message dispatched');
          //  this.editMessage = true; // dispatch error message
          this.store.dispatch(new SetError({
             errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
              title: 'Access Denied'}));
          }
        }
      });
    }
    addNew(functionId: number){
      this.functionList$.pipe(take(1)).subscribe((result) => {
        if (result) {
          var indx = result.find((x) => x === functionId);
          if(indx){
            this.setNewResult();
            this.header = "Add Health Hygiene Result Details";
            this.showAddHH = true;
            this.editMode = true;
        } else {
            console.log('message dispatched');
          //  this.editMessage = true; // dispatch error message
          this.store.dispatch(new SetError({
             errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
              title: 'Access Denied'}));
          }
        }
      });
    }
}

