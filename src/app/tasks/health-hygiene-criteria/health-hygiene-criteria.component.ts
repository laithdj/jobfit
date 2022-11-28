import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { EInputType, HealthHygiene, HealthHygieneInputItemResult, HealthHygieneInputItemView, HealthHygieneResult } from 'src/app/shared/models/health-hygeine.model';
import { HealthHygieneCriteria, HealthHygieneCriteriaValue, HHCriteriaResult, Operators } from 'src/app/shared/models/health-hygiene-criteri.model';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { FetchTask, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { TasksService } from '../tasks-service.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { selectFunctionList, selectTask } from 'src/app/store/job-fit.selectors';
import { MenuItem } from 'primeng/api';
import { EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-health-hygiene-criteria',
  templateUrl: './health-hygiene-criteria.component.html',
  styleUrls: ['./health-hygiene-criteria.component.css']
})
export class HealthHygieneCriteriaComponent implements OnInit {
  addHH = false;
  taskId = 0;
  editHHCBox = false;
  newHHC = false;
  HHCLoaded = false;
  hhCriteriaResult:HHCriteriaResult = new HHCriteriaResult();
  hhCriteria: HealthHygieneCriteria[] = [];
  operators: Operators[] = [];
  editMode = false;
  healthHygienes: HealthHygiene[] = [];
  selectedInputItem: HealthHygieneInputItemView = new HealthHygieneInputItemView();
  healthHygieneResults: HealthHygieneInputItemView[] = [];
  selectedHealthHygiene: HealthHygiene = new HealthHygiene();
  healthHygieneCriteria: HealthHygieneCriteria = new HealthHygieneCriteria();
  selectedHealthHygieneResult: HealthHygieneResult = new HealthHygieneResult();
  mainHygieneList: HealthHygiene[] = [];
  healthHygiene: HealthHygiene = new HealthHygiene();
  initialValue = '';
  totalCount:number = 0;
  first: any;
  currentPage: any;
  showArchive = false;
  rowCount = 10;
  rowOptions = [10,20,30];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  task$ = this.store.pipe(select(selectTask));
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  constructor(
    private store: Store<JobFitAppState>,
    private taskService: TasksService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.taskId = params.taskId;
      this.taskService.setMenu(params.taskId);
      this.getHealthHygieneCriteriaList(params.taskId, 1,10);
      this.getPagedHealthHygiene(1,10000);
      this.getMainHygieneList();
      this.functionList$.subscribe(result => {
        this.functionList = result;
        this.authorisedList = [];
        this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
      });
      this.store.dispatch(new FetchTask(this.taskId));
      this.task$.subscribe(result => {
        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Tasks', url: 'tasks'},
          {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
          {label:'Health and Hygiene Criteria'},
        ];
        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      });
    });
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.taskService?.menuList));
  }
  ngOnInit(): void {
  }
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  goToReport(){
    this.router.navigate([`../reports/task/${this.taskId}`]);
  }
  viewEditHHC(hhc:HealthHygieneCriteria){
    this.healthHygieneCriteria = _.cloneDeep(hhc);
    this.editHHCBox = true;
    this.taskService.getOperators(this.healthHygieneCriteria?.healthHygieneItem?.healthHygieneId).subscribe(result => {
      this.operators = result;
      this.setList(this.healthHygieneCriteria?.healthHygieneItem?.healthHygieneId);
      if(this.healthHygieneCriteria.values.length > 1){
        let valArray: string[] = [];
        this.healthHygieneCriteria.values.forEach(element => {
          valArray.push(element.value);
        });
        this.initialValue = valArray.toString();
        if (Array.isArray(this.healthHygieneCriteria.values)) {
        }
      } else {
        this.initialValue = this.healthHygieneCriteria.valuesForDisplay;
      }
    });
  }
  setRows(e: any){
    this.rowCount = e.value
    this.getHealthHygieneCriteriaList(this.taskId, this.currentPage , e.value);
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getHealthHygieneCriteriaList(this.taskId, e.page + 1,this.rowCount);
  }
  archiveHHC(){
    this.taskService.archiveHHCriteria(this.healthHygieneCriteria?.id).subscribe(result => {
      this.getHealthHygieneCriteriaList(this.taskId, this.currentPage,10);
      this.showArchive = false;
      this.editHHCBox = false;
    });
  }
  getPagedHealthHygiene(pageNumber:number, count: number){
    let s = new SearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'Id';
    s.sortDir = 'asc'

    this.taskService.getHealthHygienes(s).subscribe(result => {
      this.healthHygienes = result.healthHygiene;
      if(result.healthHygiene.length > 0){
        this.setHealthHygiene(null, result.healthHygiene[0]);
      }
    });
  }
  getValue(e: any){
    this.healthHygieneCriteria.values = [];
    if (Array.isArray(e)) {
      e.forEach(element => {
        let val: HealthHygieneCriteriaValue = new HealthHygieneCriteriaValue();
        val.value = element;
        val.isActive = true;
        this.healthHygieneCriteria.values.push(val);
      });
    } else {
      let val: HealthHygieneCriteriaValue = new HealthHygieneCriteriaValue();
      val.value = e;
      val.isActive = true;
      this.healthHygieneCriteria.values.push(val);
    }
  }
  getFields(id:number){
    let s = new SearchCriteria();
    s.pageNumber = 1;
    s.count = 10000;
    s.sortField = 'Id';
    s.sortDir = 'asc'
    this.taskService.getHealthHygieneResults(id, s).subscribe(result => {
      this.healthHygieneResults = result;
    //  this.getInputItem(null , this.healthHygieneResults[0].healthHygieneId);
    });
    this.taskService.getOperators(id).subscribe(result => {
      this.operators = result;
      this.healthHygieneCriteria.operatorId = this.operators[0].id;
    });
  }

  getInputItem(e: any, id?:number){
    let item = e?.value ?? id;
    var inputItem = this.selectedHealthHygieneResult.healthHygiene.inputItems.find((x) => x.id === item);
    if(inputItem){
      this.selectedInputItem = inputItem;
    }
  }
  getItemsPerCategory(category: string, hhList: HealthHygieneInputItemView[]|undefined) {
    return hhList ? hhList.filter(x=> x.category == category) : [];
  }
  addNewHHC(functionId:number){
    this.functionList$.subscribe(result => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.healthHygieneCriteria = new HealthHygieneCriteria();
          this.healthHygieneCriteria.healthHygieneItemId = this.healthHygieneResults[0]?.id;
          this.healthHygieneCriteria.operatorId = this.operators[0]?.id;
          this.newHHC = true;
          this.editMode = true;        } else {
          console.log('message dispatched');
        //  this.editMessage = true; // dispatch error message
        this.store.dispatch(new SetError({
           errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
            title: 'Access Denied'}));
        }
      }
    });
  }
  archiveBtn(functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.showArchive = true;
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
  getHealthHygieneCriteriaList(taskId:number , pageNumber:number, count: number){
    let s = new SearchCriteria();
    s.pageNumber = pageNumber;
    s.count = count;
    s.sortField = 'HealthHygieneItem.HealthHygiene.Name';
    s.sortDir = 'asc'
    this.currentPage = pageNumber;
    this.taskService.getHealthHygieneCriteriaList(taskId, s).subscribe(result => {
      this.hhCriteria = result.hhCriterias;
      this.HHCLoaded = true;
      this.hhCriteria.forEach(x=> {
        x.valuesForDisplay = [...new Set(x.values.map(item => item.value))].toString();
      });

    });
  }
  setValue(e: any , index:number){
    var value = e;
    if (Array.isArray(e)) {
      value = e.toString()
    }
    if (value instanceof Date) {
      value = moment(value).format('DD/MM/YYYY');
    }
    if (this.selectedHealthHygieneResult.results[index].inputItem.inputTypeId == EInputType.DateRange && value.indexOf(";") > -1) {
      var valRange = value.toString().split(";");
      var dateValue1 = valRange[0] != 'undefined' ? moment(valRange[0]).format('DD/MM/YYYY'): null;8
      var dateValue2 = valRange[1] != 'undefined' ? moment(valRange[1]).format('DD/MM/YYYY'): null;
      if (dateValue1 && dateValue2) {
        value = dateValue1 + ";" + dateValue2;
      }else {
        value = null;
      }

    }
    this.selectedHealthHygieneResult.results[index].value = value;
  }
  setHealthHygiene(e: any , healthHygiene?:HealthHygiene){
    this.selectedHealthHygiene = e?.value ?? healthHygiene;
    this.setList(healthHygiene?.id ?? e.value);
    this.getFields(healthHygiene?.id ?? e.value);

  }
  getMainHygieneList() {
    this.taskService.getAllMainHealthHygieneBy().subscribe((results: any) => {
        this.mainHygieneList = results;
        if(this.mainHygieneList.length > 0){
          this.setList(this.healthHygienes[0].id);
        }
    });
  }
  saveHealthHygieneCriteria() {
    this.healthHygieneCriteria.taskId = this.taskId;
    this.healthHygieneCriteria.isActive = true;
    if(this.healthHygieneCriteria.originalRevisionId){
      this.healthHygieneCriteria.id = this.healthHygieneCriteria.originalRevisionId;
    }
    this.detailsSaved = false;
    this.taskService.saveHealthHygieneCriteria(this.healthHygieneCriteria).subscribe((results: any) => {
      this.editHHCBox = false;
      this.newHHC = false;
      this.detailsSaved = true;
      this.editMode = false;
      this.getHealthHygieneCriteriaList(this.taskId, this.currentPage,10);
    });
  }

  getUniqueCategoriesFromResults(hhList: HealthHygieneInputItemView[]|undefined){
    return hhList ? [...new Set(hhList.map(item => item.category))] : [];
  }
  setList(e: number){
    let setId = e;
  //  this.filterHealthHygieneResults(setId);
    let option = this.mainHygieneList.find((x) => x.id === setId);
    this.selectedHealthHygieneResult = new HealthHygieneResult();
    this.selectedHealthHygieneResult.results = [];
    this.selectedHealthHygieneResult.healthHygieneId = setId;
    let i = 0;
    this.selectedHealthHygieneResult.healthHygiene.inputItems = option?.inputItems ?? [];

    this.selectedInputItem = this.selectedHealthHygieneResult.healthHygiene.inputItems[0] ?? new HealthHygieneInputItemView();
    this.healthHygieneCriteria.healthHygieneItemId = this.selectedInputItem.id;

      this.selectedHealthHygieneResult.healthHygiene.inputItems.forEach(element => {
        let result = new HealthHygieneInputItemResult();
        result.inputItem = element;
        result.healthHygieneInputItemId = 26 + i;
        result.healthHygieneResultId = element.healthHygieneId;
        result.isActive = true;
        this.selectedHealthHygieneResult.results.push(result)
        i++;
      });
  }
  cancelViewEdit(){
    this.editHHCBox = false;
    this.editMode = false;
  }
  cancelViewAdd(){
    this.newHHC = false;
    this.editMode = false;
  }
  editHHC(functionId: number){
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
}
