import { JobsSearchCriteria, SearchCriteria, WorkersSearchCriteria } from "./search.criteria.model";

export class RisksSearchResult {
    risksSearchResults: RisksSearchView[] = [];
    listCount: number = 0;
    currentPage: number = 0;
}
export class RisksSearchCriteria {
    pageNumber: number = 0;
    count: number = 0;
    sortField: string = '';
    type:string = '';
}

export class RisksSearchView {
    riskSearchId: number = 0;
    name: string = '';
    companyId: number = 0;
    typeName: string = '';
    typeId: number  = 0;
    isPublic: boolean = true;
    riskSearchCriteriaView: RiskSearchCriteriaView[] = [];
}

export class RiskSearchSelectDataView
{
    entities: RiskSearchCriteriaEntities[] = [];
    operators: OperatorView[] = [];
    criteriaTypes: RiskSearchCriteriaType[] = [];
    selectValueList: RiskSearchSelectValueList[]=[];
}

export class RiskSearchCriteriaView
{
    riskSearchCriteriaViewId: number = 0;
    orderIndex?: number;
    riskSearchId?: number;
    joinedBy: string = '';
    operatorId: number = 0;
    operatorName: string = '';
    criteriaTypeId: number = 1;
    criteriaTypeName: string = '';
    entitiesString: string = '';
    valuesString: string = '';
    entities: RiskSearchCriteriaEntity[] = [];
    values: RiskSearchCriteriaValue[] = []
}

export class RiskSearchCriteriaEntity {
    riskSearchCriteriaId: number = 0;
    entityName: string = '';
    entityId: number = 0;
    frequency: string = '';
}
export class RiskSearchCriteriaType {
    riskSearchCriteriaTypeId: number = 0;
    riskSearchCriteriaTypeName: string = '';
}

export class RiskSearchCriteriaValue {
    riskSearchCriteriaValueId: number = 0;
    riskSearchCriteriaId: number = 0;
    value: string = '';
}
export class RiskSearchSelectValueList {
    typeName: string = '';
    subTypeId: string = '';
    label: string = '';
    value: string = '';
}

export class OperatorView {
    operatorId: number = 0;
    name: string = '';
}

export class RiskSearchCriteriaEntities
{
    riskSearchCriteriaTypeId: number = 0;
    groupLabel: string = '';
    groupValue: string = '';
    items: RiskSearchCriteriaItem[]= [];
}

export class RiskSearchCriteriaItem
{
    label: string = '';
    value: string = '';
}

export class RiskSearchResultsView
{
    entityName: string = '';
    children: RiskSearchResultItem[] = [];
}

export class RiskSearchResultItem
{
    itemName: string = '';
    results: RiskSearchResultItemPair[] = [];
}
export class RunRiskSearchView
{
    runOption: string = '';
    start?: Date;
    end?: Date;
    typeName: string = '';
    taskSearch: SearchCriteria = new SearchCriteria();
    jobSearch: JobsSearchCriteria = new JobsSearchCriteria();
    workerSearch: WorkersSearchCriteria = new WorkersSearchCriteria();
}
export class RiskSearchResultItemPair
{
    key: string = '';
    value: string = '';
}
export enum ERiskSearchType{
    Worker = 1,
    Task = 2,
    Job = 3
}

export enum EJoin{
    None = " ",
    And = "AND",
    Or = "OR"
}

export enum ECriteriaType{
    PosturalTolerance = 1,
    MaterialHandling = 2,
    HealthHygiene = 3,
    RiskRating = 4
}

export enum EUseRecords{
    Current = "Current",
    All = "All",
    Between = "Between"
}