import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MenuItem } from 'primeng/api';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { ECriteriaType, EJoin, ERiskSearchType, OperatorView, RiskSearchCriteriaEntities, RiskSearchCriteriaEntity, RiskSearchCriteriaType, RiskSearchCriteriaValue, RiskSearchCriteriaView, RiskSearchSelectDataView, RiskSearchSelectValueList, RisksSearchCriteria, RisksSearchResult, RisksSearchView } from 'src/app/shared/models/risks.search.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { RisksSearchService } from '../risks-search.service';

@Component({
  selector: 'app-risk-search-list',
  templateUrl: './risk-search-list.component.html',
  styleUrls: ['./risk-search-list.component.css']
})

export class RisksSearchListComponent implements OnInit {
  MIN_VALUE: number = 1;
  MAX_VALUE: number = 9;
  risksSearchId: any;
  risksSearchResult: any;
  selectedRisks:any[] = [];
  risksSearchList: RisksSearchView[] = [];
  totalCount: number = 0;
  editMode = false;
  first:number = 0;
  breadCrumbs: MenuItem[] = [];
  selectedRisksSearch: RisksSearchView= new RisksSearchView();
  selectedRiskSearchCriteriaViews: RiskSearchCriteriaView[] = [];
  selectedRiskSearchCriteriaView: RiskSearchCriteriaView = new RiskSearchCriteriaView();
  addNewRiskSearchBox: boolean = false;
  addNewRiskSearchCriteriaBox: boolean = false;
  operators: OperatorView[] = [];
  allOperators: OperatorView[] = [];
  allCriteriaSelectionValueList: RiskSearchSelectValueList[] =[];
  allCriteriaEntities: RiskSearchCriteriaEntities[] =[];
  criteriaTypes: RiskSearchCriteriaType[]= [];
  criteriaEntitiesPerType: RiskSearchCriteriaEntities[] =[];
  criteriaSelectionValueList: RiskSearchSelectValueList[] =[];
  criteriaHHItemType: string = '';
  selectedCriteriaType: number = ECriteriaType.PosturalTolerance;
  selectedCriteriaOperatorId: number = 0;
  selectedMeasureId: string = '';
  selectedMeasureIds: string[] = [];
  selectedValue1: any = null;
  selectedValue2: any = null;
  selectedValues: string[] = [];
  isBetween: boolean = false;
  functionList$ = this.store.pipe(select(selectFunctionList));
  orderIndex: number = 0;
  showArchive:boolean = false;
  showArchiveCriteria: boolean= false;
  riskSearchCriteriaViewForArchive: RiskSearchCriteriaView = new RiskSearchCriteriaView();
  types = [
    {typeName: 'Worker', id: ERiskSearchType.Worker},
    {typeName: 'Task', id: ERiskSearchType.Task},
    {typeName: 'Job', id: ERiskSearchType.Job},
  ];
  joinList = [
    {name: " ", value: ""},
    {name: EJoin.And, value: EJoin.And},
    {name: EJoin.Or, value: EJoin.Or},
  ];
  errorMessage = '';
  displayError = false;
  isLoading: boolean = false;
  riskSaved: boolean = true;
  dataLoading: boolean = true;
  empLoaded = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  rowOptions = [10,20,30];
  currentPage = 0;
  rowCount = 10;
  constructor(private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<JobFitAppState>,
    private titleService: Title,
    private risksSearchService: RisksSearchService) {
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.SearchRisks]) {
          this.getRisksSearchList(1,10);
          this.getRiskSearchSelectionData();
        } else {
          this.empLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }

      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.route.params.subscribe((params: Params) => {
        this.risksSearchId = params.risksSearchId;
      });
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Risk Search'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.titleService.setTitle('Risk Search');
      this.store.dispatch(new ShowSideMenu(false));
      this.translateService.setDefaultLang('en');
      this.translateService.use(localStorage.getItem('lang') || 'en');
      this.route.params.subscribe((params: Params) => {
        this.risksSearchId = params.risksSearchId;
        this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
        if (Object.keys(this.authorisedFunctionList.Function).length > 0){
          if (this.authorisedFunctionList.Function[EFunctions.SearchRisks]) {
            this.getRisksSearchList(this.currentPage,this.rowCount);
            this.getRiskSearchSelectionData();
          } else {
            this.isLoading = false;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
               title: ACCESS_DENIED_TITLE}));
          }
        }
      });
  }

  ngOnInit(): void {
  }
  getRiskSearchSelectionData() {
    this.dataLoading = true;
    this.risksSearchService.getRiskSearchSelectionData().subscribe((result:RiskSearchSelectDataView) => {
      this.allOperators = result.operators;
      this.criteriaTypes = result.criteriaTypes;
      this.allCriteriaEntities = result.entities;
      this.allCriteriaSelectionValueList = result.selectValueList;
      //set default criteria entities and operators:
      this.setDefault();
      this.dataLoading = false;
    });
  }
  setDefault() {
    this.selectedCriteriaType = ECriteriaType.PosturalTolerance;
    this.setCriteriaType(this.selectedCriteriaType);
    this.criteriaEntitiesPerType = this.allCriteriaEntities.filter(x=> x.riskSearchCriteriaTypeId == ECriteriaType.PosturalTolerance);
    this.filterOperatorsForSelectedEntity("");
    this.filterSelectValueList();
  }
  refresh() {
    if (this.authorisedFunctionList.Function[EFunctions.SearchRisks]) {
      this.getRisksSearchList(this.currentPage, this.rowCount);
    } else {
      this.isLoading = false;
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getRisksSearchList(this.currentPage , e.value);
  }
  getRisksSearchList(pageNumber:number , count:number){
      let s = new RisksSearchCriteria();
      s.pageNumber = pageNumber;
      s.count = count;
      s.sortField = 'Name';
      this.isLoading = true;
      this.currentPage = pageNumber;
      this.risksSearchService.getRisksSearchList(s).subscribe((result:RisksSearchResult) => {
        this.risksSearchResult = _.cloneDeep(result);
        this.totalCount = result.listCount;
        this.risksSearchList = _.cloneDeep(result.risksSearchResults);
        this.isLoading = false;
      });
  
  }
  showArchiveWindow() {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteRisk]) {
      this.showArchive=true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  addNew() {
    if (this.authorisedFunctionList.Function[EFunctions.AddRisk]) {
      this.selectedRisksSearch = new RisksSearchView();
      this.addNewRiskSearchBox = true;
      this.editMode = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  cancelViewEdit(){
    this.addNewRiskSearchBox = false
    this.editMode = false;
  }
  addRiskSearchCriteria() {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteRisk]) {
      if (this.editMode) {
        this.resetSelections();
        this.orderIndex = this.orderIndex + 1;
        this.selectedRiskSearchCriteriaView = new RiskSearchCriteriaView();
        this.selectedRiskSearchCriteriaView.orderIndex = this.orderIndex;
        this.setDefault();
        this.addNewRiskSearchCriteriaBox = true;
      } else {
        this.errorMessage = "Please click Edit Risk Search button to add new Risk Search Criteria";
        this.displayError = true;
      }
      
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  printList() {
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page +1;
    this.getRisksSearchList(this.currentPage,this.rowCount);
  }
  archive() {
    var ids = [this.selectedRisksSearch.riskSearchId];
    this.risksSearchService.archiveRisks(ids).subscribe(result => {
      this.showArchive = false;
      this.addNewRiskSearchBox = false;
      this.getRisksSearchList(this.currentPage,this.rowCount);
      this.selectedRisks = [];

    });
  }
  archiveRisk() {
    this.showArchive = true;
  }
  resetSelections() {
    this.selectedRiskSearchCriteriaView.entities = [];
    this.selectedRiskSearchCriteriaView.operatorId = 0;
    this.selectedRiskSearchCriteriaView.values = [];
    this.selectedMeasureId = '';
    this.selectedMeasureIds = [];
    this.selectedCriteriaOperatorId = 0;
    this.isBetween = false;
    this.criteriaEntitiesPerType = [];
    this.criteriaSelectionValueList= [];
    this.criteriaHHItemType = '';
    this.selectedCriteriaOperatorId = 0;
    this.selectedValue1 = null;
    this.selectedValue2 = null;
    this.selectedValues = [];
  }
  onChangeJoinedBy(e:any) {
    this.selectedRiskSearchCriteriaView.joinedBy = e.value;
  }
  setCriteriaType(typeId: number) {
    this.selectedRiskSearchCriteriaView.criteriaTypeId = typeId;
    this.selectedRiskSearchCriteriaView.criteriaTypeName = this.criteriaTypes.filter(x=>x.riskSearchCriteriaTypeId == typeId)[0].riskSearchCriteriaTypeName;
  }
  onChangeCriteriaType(e: any) {
    //reset the selected Measures/Entities, Criteria/Operators, Value
    this.resetSelections();
    this.selectedCriteriaType = e.value;
    this.setCriteriaType(this.selectedCriteriaType);
    this.filterEntities(e.value);
    //reset operators/criteria
    this.filterOperatorsForSelectedEntity("");

  }
  filterEntities(type: string){
    //filter the entities based on selected criteria type
    this.criteriaEntitiesPerType = [];
    this.criteriaEntitiesPerType = this.allCriteriaEntities.filter(x=> x.riskSearchCriteriaTypeId.toString() == type);
  }
  onChangeMeasures(e: any) {
    this.isBetween = false;
    this.selectedCriteriaOperatorId = 0;
    this.selectedRiskSearchCriteriaView.operatorId = 0;
    var typeName = "";
    var entityString = "";
    if (this.selectedCriteriaType == ECriteriaType.PosturalTolerance || this.selectedCriteriaType == ECriteriaType.MaterialHandling) {
      this.selectedMeasureIds = e.value;

      for(let a of this.selectedMeasureIds) {
        var id = a;
        var frequency = "";
        if (this.selectedCriteriaType == ECriteriaType.MaterialHandling) {
          id = a.substring(a.indexOf("_") + 1);
          frequency = a.substring(0, a.indexOf("_"));
        }
        var rscEntity = new RiskSearchCriteriaEntity();
        rscEntity.entityId = Number(id);
        rscEntity.frequency = frequency;
        rscEntity.riskSearchCriteriaId = this.selectedRiskSearchCriteriaView.riskSearchCriteriaViewId;
        var idx = this.selectedRiskSearchCriteriaView.entities.findIndex(x=> x.entityId.toString() == a && x.frequency == frequency);
        if (idx > -1) {
          this.selectedRiskSearchCriteriaView.entities[idx] = rscEntity;
        } else if (this.selectedRiskSearchCriteriaView.entities.filter(x=> x.entityId == rscEntity.entityId && x.frequency == frequency).length == 0) {
          this.selectedRiskSearchCriteriaView.entities.push(rscEntity);
        }

        for(let c of this.criteriaEntitiesPerType) {
          var item = c.items.filter(x=> x.value == a)[0];
          if(item != null) {
            entityString += c.groupLabel + " " + item.label + ", ";
            break;
          }
        }
      }
      entityString = this.selectedMeasureIds.length > 1 ? entityString.replace(/,\s*$/, ""):entityString.substring(0, entityString.indexOf(", ")); //remove last comma

    } else {
      this.selectedMeasureId = e.value;
      var rscEntity = new RiskSearchCriteriaEntity();
      rscEntity.entityId = Number(this.selectedMeasureId);
      rscEntity.riskSearchCriteriaId = this.selectedRiskSearchCriteriaView.riskSearchCriteriaViewId;
      var separator = " ";
      if (this.selectedCriteriaType == ECriteriaType.HealthHygiene) {
        typeName = e.value.substring(e.value.indexOf("_") + 1);
        this.selectedMeasureId = e.value;
        this.criteriaHHItemType = typeName;
        this.filterSelectValueList();
        rscEntity.entityId = Number(this.selectedMeasureId.substring(0, this.selectedMeasureId.indexOf("_")));
        separator = " - ";
      }

      for(let c of this.criteriaEntitiesPerType) {
        var item = c.items.filter(x=> (x.value.substring(0, x.value.indexOf("_")) == rscEntity.entityId.toString()) || (x.value == rscEntity.entityId.toString()))[0];
        if(item != null) {
          var group = this.selectedCriteriaType == ECriteriaType.RiskRating ? "" : c.groupLabel;
          entityString += group + separator + item.label;
          break;
        }
      }
      this.selectedRiskSearchCriteriaView.entities[0] = rscEntity;
    }
    this.selectedRiskSearchCriteriaView.entitiesString = entityString;
    //filter the operators/criteria based on selected Entities/Measures
    this.filterOperatorsForSelectedEntity(typeName);
  }

  filterOperatorsForSelectedEntity(typeName: string) {
    if (this.selectedCriteriaType == ECriteriaType.HealthHygiene && typeName == "") {
      this.operators = [];
    }
    else {
      switch(typeName) {
        case "Yes/No":
            this.operators = this.allOperators.filter(x=> x.name.toLowerCase() == "is yes" || x.name.toLowerCase() == "is no");
            break;
        case "Text":
        case "Comments":
            this.operators = this.allOperators.filter(x=> x.name.toLowerCase().includes("contain"));
            break;
        case "Selection":
            this.operators = this.allOperators.filter(x=> x.name.toLowerCase().includes("select") || x.name.toLowerCase() == "equals any of");
            break;
        case "Date":
            this.operators = this.allOperators.filter(x=> x.name.toLowerCase().includes("between") || x.name.toLowerCase() == "before" || x.name.toLowerCase() == "after" );
            break;
        default:
            this.operators = this.allOperators.filter(x=> x.name.toLowerCase().includes("equal to") || x.name.toLowerCase().includes("than") || x.name.toLowerCase() == "between");
            break;
      }
    }
  }
  onChangeOperator(e:any) {
    this.selectedCriteriaOperatorId = e.value;
    var operator = this.operators.filter(x=> x.operatorId == this.selectedCriteriaOperatorId)[0];
    //check if the selected operator includes between
    this.isBetween = operator?.name.toLowerCase().includes("between") ? true: false;
    this.selectedRiskSearchCriteriaView.operatorId = this.selectedCriteriaOperatorId;
    this.selectedRiskSearchCriteriaView.operatorName = operator.name;
    //filter value selection
    this.filterSelectValueList();
  }
  filterSelectValueList() {
    var typeName = this.selectedCriteriaType == ECriteriaType.HealthHygiene ? this.criteriaHHItemType: "Postural Tolerance";

      switch(typeName) {
        case "Selection":
            this.criteriaSelectionValueList = this.allCriteriaSelectionValueList.filter(x=> x.typeName == "Health & Hygiene" && x.subTypeId == this.selectedMeasureId.substring(0, this.selectedMeasureId.indexOf("_")));
            break;
        default:
            this.criteriaSelectionValueList = this.allCriteriaSelectionValueList.filter(x=> x.typeName == "Postural Tolerance");
            break;
      }
  }
  edit(risk: RisksSearchView) {
    this.getRiskSearchData(risk.riskSearchId);
  }
  getRiskSearchData(id:number) {
    this.dataLoading = true;
    this.addNewRiskSearchBox = true;
    this.risksSearchService.getRiskSearchData(id).subscribe((result:RisksSearchView) => {
      this.selectedRisksSearch = _.cloneDeep(result);
      this.dataLoading = false;
    });
  }
  archiveCriteria(riskCriteria: RiskSearchCriteriaView) {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteRisk]) {
      if (this.editMode) {
        this.showArchiveCriteria = true;
        this.riskSearchCriteriaViewForArchive = _.cloneDeep(riskCriteria);
      } else {
        this.errorMessage = "Please click Edit Risk Search button to archive Risk Search Criteria";
        this.displayError = true;
      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  archiveRiskSearchCriteria() {
    if (this.riskSearchCriteriaViewForArchive.riskSearchCriteriaViewId > 0) {
      this.risksSearchService.archiveRiskCriteria(this.riskSearchCriteriaViewForArchive.riskSearchCriteriaViewId).subscribe((result:boolean) => {
        var index = this.selectedRisksSearch.riskSearchCriteriaView.findIndex(x=> x.riskSearchCriteriaViewId == this.riskSearchCriteriaViewForArchive.riskSearchCriteriaViewId);
        this.selectedRisksSearch.riskSearchCriteriaView.splice(index, 1);
      });
    } else {
      var index = this.selectedRisksSearch.riskSearchCriteriaView.findIndex(x=> x.orderIndex == this.riskSearchCriteriaViewForArchive.orderIndex);
      this.selectedRisksSearch.riskSearchCriteriaView.splice(index, 1);
    }
    this.showArchiveCriteria = false;
  }
  performRiskSearch(risk: RisksSearchView) {
    if (this.authorisedFunctionList.Function[EFunctions.RunRisk]) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['risks/perform-risk-search/' + risk.riskSearchId])
      );
      window.open(url);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  editCriteria(riskCriteria: RiskSearchCriteriaView) {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteRisk]) {
      if (this.editMode) {
        this.dataLoading = true;
        this.selectedRiskSearchCriteriaView = _.cloneDeep(riskCriteria);
        //set criteria type
        this.selectedCriteriaType = this.selectedRiskSearchCriteriaView.criteriaTypeId;
        //filter entities
        this.filterEntities(this.selectedRiskSearchCriteriaView.criteriaTypeId.toString());
        //reset operators/criteria
        this.filterOperatorsForSelectedEntity("");
    
        //set selected entities/measures
        if (this.selectedRiskSearchCriteriaView.entities.length > 0) {
          this.setSelectedEntities();
        } else {
          this.selectedMeasureId = '';
          this.selectedMeasureIds = [];
        }
    
        //select isBetween
        if (this.selectedRiskSearchCriteriaView.operatorName.toLowerCase().includes('between')) {
          this.isBetween = true;
        }
        else {
          this.isBetween = false;
        }
    
        // set SelectValueList
        this.filterSelectValueList();
    
        //set selected values
        if (this.selectedRiskSearchCriteriaView.values.length > 0) {
          this.setSelectedValues();
        } else {
          this.selectedValue1 = null;
          this.selectedValue2 = null;
          this.selectedValues = [];
        }
        //open the pop-up for risk search criteria
        this.addNewRiskSearchCriteriaBox = true;
        this.dataLoading = false;
      } else {
        this.errorMessage = "Please click Edit Risk Search button to edit Risk Search Criteria";
        this.displayError = true;
      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  setSelectedEntities() {
    if (this.selectedRiskSearchCriteriaView.criteriaTypeId == ECriteriaType.HealthHygiene) {
      // get input type of the entity
      var entityStrings = this.selectedRiskSearchCriteriaView.entitiesString.split(" - ");
      var criEntities = this.allCriteriaEntities.filter(x=> x.groupLabel == entityStrings[0])[0];
      var inputItem = criEntities.items.filter(x=> x.label == entityStrings[1])[0];
      this.criteriaHHItemType = inputItem.value.substring(inputItem.value.indexOf("_") + 1);
      this.selectedMeasureId = inputItem.value;
      this.filterOperatorsForSelectedEntity(this.criteriaHHItemType);
    }
    else if (this.selectedRiskSearchCriteriaView.criteriaTypeId == ECriteriaType.PosturalTolerance) {
      //could be multiple
      this.selectedMeasureIds = this.selectedRiskSearchCriteriaView.entities.map(e => e.entityId.toString());
    }
    else if (this.selectedRiskSearchCriteriaView.criteriaTypeId == ECriteriaType.MaterialHandling) {
      
      this.selectedMeasureIds = this.selectedRiskSearchCriteriaView.entities.map(e => (e.frequency ?? e.entityName) + "_" + e.entityId.toString());
    } else {
      this.selectedMeasureId = this.selectedRiskSearchCriteriaView.entities[0].entityId.toString();
    }
  }
  setSelectedValues() {
    switch(this.selectedRiskSearchCriteriaView.criteriaTypeId) {
      case ECriteriaType.HealthHygiene: {
        this.setValueByInputType();
        break;
      }
      case ECriteriaType.PosturalTolerance: {
        this.selectedValue1 = this.selectedRiskSearchCriteriaView.values[0].value;
        if (this.isBetween && this.selectedRiskSearchCriteriaView.values.length > 1) {
          this.selectedValue2 = this.selectedRiskSearchCriteriaView.values[1].value;
        }
        break;
      }
      case ECriteriaType.MaterialHandling: {
        if (this.selectedRiskSearchCriteriaView.valuesString.toString().indexOf(",") > -1) {
          var valueStr = this.selectedRiskSearchCriteriaView.valuesString.split(", ");
          this.selectedValue1 = valueStr[0];
          if (this.isBetween && valueStr.length > 1) {
            this.selectedValue2 = valueStr[1];
          }
        } else {
          this.selectedValue1 = this.selectedRiskSearchCriteriaView.valuesString;
        }

        break;
      }
      case ECriteriaType.RiskRating: {
        this.selectedValue1 = this.selectedRiskSearchCriteriaView.values[0]?.value;
        if (this.isBetween) {
          this.selectedValue2 = this.selectedRiskSearchCriteriaView.values[1]?.value;
        }
        break;
      }
    }
  }
  setValueByInputType() {
    switch (this.criteriaHHItemType) {
      case "Selection": {
        this.selectedValues = this.selectedRiskSearchCriteriaView.values.map(v => v.value.toString());
        break;
      }
      case "Date": {
        this.selectedValue1 = new Date(moment(this.selectedRiskSearchCriteriaView.values[0]?.value).format('DD/MM/YYYY'));
        if (this.isBetween) {
          this.selectedValue2 = new Date(moment(this.selectedRiskSearchCriteriaView.values[1]?.value).format('DD/MM/YYYY'));
        }
        break;
      }
      default:
        this.selectedValue1 = this.selectedRiskSearchCriteriaView.values[0]?.value;
        if (this.isBetween) {
          this.selectedValue2 = this.selectedRiskSearchCriteriaView.values[1]?.value;
        }
    }

  }
  saveRiskSearchCriteria() {
    if (this.selectedRiskSearchCriteriaView.entities.length < 1) {
      this.errorMessage = "Select Measures";
      this.displayError = true;
    } else if (this.selectedRiskSearchCriteriaView.operatorId < 1) {
      this.errorMessage = "Criteria is required";
      this.displayError = true;
    } else if ((this.criteriaHHItemType == "Selection" && this.selectedValues.length < 1)) {
      this.errorMessage = "Value is required";
      this.displayError = true;
    } else if (this.isBetween && (this.selectedValue2 == null || this.selectedValue2 =="")) {
      this.errorMessage = "Second Value is required";
      this.displayError = true;
    } else if (this.criteriaHHItemType != "Selection" && this.criteriaHHItemType != "Yes/No" && (this.selectedValue1 == null || this.selectedValue1 =="")  ) {
      this.errorMessage = "Value is required";
      this.displayError = true;
    } else {
      this.riskSaved = false;
      //set the values
      var valuesString = "";
      var rscValue1 = new RiskSearchCriteriaValue();
      var rscValue2 = new RiskSearchCriteriaValue();
      this.selectedRiskSearchCriteriaView.values = [];
      if (this.selectedRiskSearchCriteriaView.criteriaTypeId == ECriteriaType.HealthHygiene && this.criteriaHHItemType == "Selection") {
        this.selectedValues.forEach(v => {
          var rscValue = new RiskSearchCriteriaValue();
          rscValue.riskSearchCriteriaId = this.selectedRiskSearchCriteriaView.riskSearchCriteriaViewId;
          rscValue.value = v;
          this.selectedRiskSearchCriteriaView.values.push(rscValue);
          valuesString += this.criteriaSelectionValueList.filter(x=> x.value == v)[0].label + ", " ;
        });
        valuesString =  valuesString.toString().indexOf(", ") > -1? valuesString.toString().replace(/,\s*$/, ""): valuesString;
      } else {
        rscValue1.riskSearchCriteriaId = this.selectedRiskSearchCriteriaView.riskSearchCriteriaViewId;
        rscValue1.value = this.selectedValue1;
        this.selectedRiskSearchCriteriaView.values.push(rscValue1);
        var valueLabel1 = this.selectedCriteriaType == ECriteriaType.PosturalTolerance ? this.criteriaSelectionValueList.filter(x=> x.value == this.selectedValue1)[0].subTypeId : this.selectedValue1;
        valuesString = valueLabel1;
        if (this.isBetween) {
          rscValue2.riskSearchCriteriaId = this.selectedRiskSearchCriteriaView.riskSearchCriteriaViewId;
          rscValue2.value = this.selectedValue2;
          this.selectedRiskSearchCriteriaView.values.push(rscValue2);
          var valueLabel2 = this.selectedCriteriaType == ECriteriaType.PosturalTolerance ? this.criteriaSelectionValueList.filter(x=> x.value == this.selectedValue2)[0].subTypeId : this.selectedValue2;
          valuesString += ", " + valueLabel2;
        }
      }
      this.selectedRiskSearchCriteriaView.valuesString =  valuesString;
      var rscList = this.selectedRisksSearch.riskSearchCriteriaView;
      var rsCriteriaIndex = -1;
      if (this.selectedRiskSearchCriteriaView.riskSearchCriteriaViewId > 0) {
        rsCriteriaIndex = rscList.findIndex(x=> x.riskSearchCriteriaViewId == this.selectedRiskSearchCriteriaView.riskSearchCriteriaViewId);
      } else {
        rsCriteriaIndex = rscList.findIndex(x=> x.orderIndex == this.selectedRiskSearchCriteriaView.orderIndex);
      }
      if (rsCriteriaIndex > -1) {
          rscList[rsCriteriaIndex].entities = [];
          rscList[rsCriteriaIndex].values = [];
          rscList[rsCriteriaIndex].joinedBy = this.selectedRiskSearchCriteriaView.joinedBy;
          rscList[rsCriteriaIndex].criteriaTypeId = this.selectedRiskSearchCriteriaView.criteriaTypeId;
          rscList[rsCriteriaIndex].criteriaTypeName = this.selectedRiskSearchCriteriaView.criteriaTypeName;
          rscList[rsCriteriaIndex].operatorId = this.selectedRiskSearchCriteriaView.operatorId;
          rscList[rsCriteriaIndex].operatorName = this.selectedRiskSearchCriteriaView.operatorName;
          rscList[rsCriteriaIndex].entities = _.cloneDeep(this.selectedRiskSearchCriteriaView.entities);
          rscList[rsCriteriaIndex].entitiesString = this.selectedRiskSearchCriteriaView.entitiesString;
          rscList[rsCriteriaIndex].values = _.cloneDeep(this.selectedRiskSearchCriteriaView.values);
          rscList[rsCriteriaIndex].valuesString = valuesString;

      } else {
        this.selectedRiskSearchCriteriaView.orderIndex = this.orderIndex;
        rscList.push(this.selectedRiskSearchCriteriaView);
      }
      this.selectedRisksSearch.riskSearchCriteriaView = _.cloneDeep(rscList);
      this.addNewRiskSearchCriteriaBox = false;
      this.riskSaved = true;
    }
  }
  editRisk(){
    if (this.authorisedFunctionList.Function[EFunctions.DeleteRisk]) {
      this.editMode = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
          title: ACCESS_DENIED_TITLE}));
    }
  }
  saveRiskSearch(riskSearch: RisksSearchView) {
    if (riskSearch.name == "") {
      this.errorMessage = "Risk Search Name is required";
      this.displayError = true;
    } else if (riskSearch.typeId < 1) {
      this.errorMessage = "Please select Risk Search Type";
      this.displayError = true;
    } else {
      this.riskSaved = false;
      this.risksSearchService.saveRiskSearch(riskSearch).subscribe((result:number) => {
        this.selectedRisksSearch.riskSearchId = result;
        this.getRisksSearchList(this.currentPage, this.rowCount);
        this.riskSaved = true;
        this.editMode = false;
        this.addNewRiskSearchBox = false;
      });
    }

  }

}
