import { HealthHygiene, HealthHygieneInputItemView } from "./health-hygeine.model";

export class HHCriteriaResult {
    currentPage: number = 0;
    listCount: number = 0;
    hhCriterias: HealthHygieneCriteria[] = [];
    }

export class HealthHygieneCriteria {
    healthHygieneItem: HealthHygieneInputItemView = new HealthHygieneInputItemView();
    healthHygieneItemId: number = 0;
    id: number = 0;
    isActive:boolean = false;
    notes:string = '';
    operatorId:number = 0;
    originalRevisionId: number = 0;
    taskId: number = 0;
    values:HealthHygieneCriteriaValue[] = [];
    lastUpdate: Date = new Date();
    lastUpdateBy: number = 0;
    valuesForDisplay: string = '';
}
export class HealthHygieneCriteriaValue {
    id:number = 0;
    isActive: boolean = false;
    lastUpdate: Date = new Date();
    lastUpdateBy: number = 0;
    medicalAssessmentCriteriaId: number = 0;
    value: string = '';
}
export class Operators {
    id:number = 0;
    isActive = true;
    lastUpdate:Date = new Date();
    lastUpdateBy:any;
    lastUpdateByUser: any;
    name:string = '';
}