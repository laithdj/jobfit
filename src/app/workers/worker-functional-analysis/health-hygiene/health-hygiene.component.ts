import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { WorkersService } from '../../workers.service';
import { EInputType, HealthHygiene, HealthHygieneInputItemResult, HealthHygieneInputItemView, HealthHygieneInputListItem, HealthHygieneResult, HHListPerCategory, HHResultPerCategory } from 'src/app/shared/models/health-hygeine.model';
import { Store } from '@ngrx/store';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { FunctionalAnalysis } from 'src/app/shared/models/functional-analysis.model';
import { UpdateCurrentFunctionalAnalysis } from 'src/app/store/workers-store/workers.actions';
import * as moment from 'moment';

@Component({
  selector: 'fahealth-hygiene',
  templateUrl: './health-hygiene.component.html',
  styleUrls: ['./health-hygiene.component.css']
})
export class FAHealthHygieneComponent implements OnInit {
  @Input() editMode: boolean = false;
  @Input() set functionalAnalysis(functionalAnalysis: FunctionalAnalysis) {
    this.currentFunctionalAnalysis = _.cloneDeep(functionalAnalysis);
    this.healthHygieneResults = _.cloneDeep(functionalAnalysis.healthHygieneResults);
    this.getHealthHygieneList();
  }
  @Output() onChange =  new EventEmitter<HealthHygieneResult[]>();
  currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  healthHygieneList: HealthHygiene[] = [];
  healthHygieneResults: HealthHygieneResult[] = [];
  accordionTabOpened: number = -1;
  hhListPerCategory: HHListPerCategory[] = [];
  hhResultPerCategoryList: HHResultPerCategory[][] = [];
  constructor(
    private store: Store<JobFitAppState>,
    private workersService: WorkersService,
  ) {

  }

  ngOnInit(): void {
  }

  setCategoriesForHHList() {
    this.hhListPerCategory = [];
    this.healthHygieneList.forEach(hl => {
      var hhResultPerCategories:HHResultPerCategory[] = [];
      // get list of unique categories per HH result
      var uniqueCategories = this.getUniqueCategoriesFromResults(hl.inputItems);

      uniqueCategories.forEach(cat => {
        var hhResultPerCategory = new HHResultPerCategory()
        hhResultPerCategory.category = cat;

        // get input items per category
        var inputItemListPerCategory = this.getItemsPerCategory(cat, hl.inputItems);

        // check for HHResult
        const faResult = this.currentFunctionalAnalysis.healthHygieneResults.filter(x => x.healthHygieneId === hl.id);

        inputItemListPerCategory.forEach(inputItem =>{
          let result = new HealthHygieneInputItemResult();
          result.inputItem = inputItem;
          result.healthHygieneInputItemId = inputItem.id;
          result.inputTypeId = inputItem.inputTypeId;
          result.name = inputItem.name;
          //find index of the input item to get the result
          if (faResult.length > 0){
            var index = faResult[0].results.findIndex(x=> x.inputItem.id == inputItem.id);
            if (index > -1) {
              result.id =  faResult[0].results[index].id;
              result.healthHygieneResultId = faResult[0].results[index].healthHygieneResultId;
              result.value = faResult[0].results[index].value;
              result.useResult = faResult[0].results[index].useResult;
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
            }
          }
          hhResultPerCategory.results.push(result);
        });
        hhResultPerCategories.push(hhResultPerCategory);
      });
      this.hhListPerCategory.push({categories: hhResultPerCategories});
    });
  }

  setCategoriesForHHResults() {
    this.hhResultPerCategoryList = [];
    this.healthHygieneResults.forEach(hr => {
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
          result.inputTypeId = inputItem.inputTypeId;
          result.name = inputItem.name;
          //find index of the input item to get the result
          var index = hr.results.findIndex(x=> x.healthHygieneInputItemId == inputItem.id && x.inputItem.category == cat);
          if (index > -1 && hr.results.length > 0) {
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
  getHealthHygieneList() {
    this.workersService.getMainHealthHygieneByType("Functional Analysis - Workers").subscribe(results => {
      this.healthHygieneList = _.cloneDeep(results);
      this.healthHygieneList = this.healthHygieneList.map(healthHygiene => {
        const faResult = this.currentFunctionalAnalysis.healthHygieneResults
          ?.find(x => x.healthHygieneId === healthHygiene.id);
        return {
          ...healthHygiene,
          useResult: faResult ? faResult.isActive : false,
        }
      });
      this.setCategoriesForHHResults();
      this.setCategoriesForHHList();
    });
  }
  onCheckboxSelection(e: any, healthHygieneId: number) {
    let updatedHHResults = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
    const resultExists = updatedHHResults.find(x => x.healthHygieneId === healthHygieneId);
    if (resultExists) {
      updatedHHResults.forEach(healthHygiene => {
        if (healthHygiene.healthHygieneId === healthHygieneId) {
          healthHygiene.isActive = e.checked;
          healthHygiene.results.forEach(result => {
            result.useResult = e.checked;
          })
        }
      });
    } else {
      const newHealthHygieneResult = new HealthHygieneResult();
      newHealthHygieneResult.healthHygiene = this.healthHygieneList.find(x => x.id === healthHygieneId) ?? new HealthHygiene();
      newHealthHygieneResult.healthHygieneId = healthHygieneId;
      newHealthHygieneResult.isActive = true;
      updatedHHResults = [ ...updatedHHResults, newHealthHygieneResult ];
    }

    const updatedFA = { ...this.currentFunctionalAnalysis, healthHygieneResults: updatedHHResults };
    this.store.dispatch(new UpdateCurrentFunctionalAnalysis(updatedFA));
    this.accordionTabOpened = e.checked ? healthHygieneId : -1;
    this.healthHygieneList = this.healthHygieneList.map(healthHygiene => {
      return (healthHygiene.id === healthHygieneId)
      ? { ...healthHygiene, useResult: e.checked }
      : healthHygiene
    });
    this.onChange.emit(updatedHHResults);
  }

  getItemValueDisplay(item: HealthHygieneInputItemView) {
    let itemValue = this.getItemValue(item);
    switch(item.inputTypeId) {
      case EInputType.Selection:
        if (item.listItems.length > 0) {
          const resultArr = [];
          for (const itemValueSplit of itemValue.replace(/;/g, ",").split(',')) {
            const itemText = item.listItems.find(x => x.id === Number(itemValueSplit))?.itemText;
            if (itemText) resultArr.push(itemText);
          }
          itemValue = resultArr.join(", ");
        }
        break;
      case EInputType.DecimalRange:
      case EInputType.DateRange:
      case EInputType.WholeNumberRange:
        const valueSplit = itemValue.replace(/;/g, ",").split(',');
        itemValue = `${valueSplit[0]} - ${valueSplit[1]}`;
        break;
    }
    return itemValue;
  }

  getItemValue(item: HealthHygieneInputItemView) {
    const hhResults = this.currentFunctionalAnalysis?.healthHygieneResults
      .find(x => x.healthHygieneId === item.healthHygieneId);
    const hhInputResults = hhResults?.results?.find(x => x.healthHygieneInputItemId === item.id);
    return hhInputResults ? hhInputResults.value : "";
  }

  setValue(e: any, item: HealthHygieneInputItemView) {
    let healthHygieneResults = _.cloneDeep(this.currentFunctionalAnalysis.healthHygieneResults);
    const hhrIndex = healthHygieneResults.findIndex(x => x.healthHygieneId === item.healthHygieneId);

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
    if (hhrIndex > -1) {
      const resultsIndex = healthHygieneResults[hhrIndex].results.findIndex(x => x.healthHygieneInputItemId === item.id);
      if (resultsIndex > -1) {
        healthHygieneResults[hhrIndex].results[resultsIndex].inputItem = item;
        healthHygieneResults[hhrIndex].results[resultsIndex].isActive = true;
        healthHygieneResults[hhrIndex].results[resultsIndex].useResult = true;
        healthHygieneResults[hhrIndex].results[resultsIndex].value = value;
      } else {
        const newResult = new HealthHygieneInputItemResult();
        newResult.healthHygieneInputItemId = item.id;
        newResult.inputItem = item;
        newResult.isActive = true;
        newResult.useResult = true;
        newResult.value = value;
        healthHygieneResults[hhrIndex].results.push(newResult);
      }

      this.currentFunctionalAnalysis = {
        ...this.currentFunctionalAnalysis,
        healthHygieneResults: healthHygieneResults,
      }
    } else {
      const newResult = new HealthHygieneInputItemResult();
      newResult.healthHygieneInputItemId = item.id;
      newResult.inputItem = item;
      newResult.isActive = true;
      newResult.useResult = true;
      newResult.value = value;

      const newHealthHygieneResult = new HealthHygieneResult();
      newHealthHygieneResult.healthHygieneId = item.healthHygieneId;
      newHealthHygieneResult.isActive = true
      newHealthHygieneResult.results.push(newResult);

      this.currentFunctionalAnalysis = {
        ...this.currentFunctionalAnalysis,
        healthHygieneResults: [
          ...this.currentFunctionalAnalysis.healthHygieneResults,
          newHealthHygieneResult,
        ],
      }
    }

    this.onChange.emit(this.currentFunctionalAnalysis.healthHygieneResults);
  }

  getUniqueCategoriesFromResults(hhList: HealthHygieneInputItemView[] | undefined){
    return hhList ? [...new Set(hhList.map(item => item.category))] : [];
  }
  getItemsPerCategory(category: string, hhList: HealthHygieneInputItemView[] | undefined) {
    return hhList ? hhList.filter(x=> x.category == category) : [];
  }

  onTabOpen(e: any, healthHygieneId: number) {
    this.accordionTabOpened = healthHygieneId;
  }
  onTabClose() {
    this.accordionTabOpened = -1;
  }
  getTabSelected(healthHygieneId: number) {
    return this.accordionTabOpened === healthHygieneId;
  }
}
