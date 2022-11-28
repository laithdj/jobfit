export class RiskTool {
    customerCompanySettingsId: number = 0;
    id: number = 0;
    isActive: boolean = false;
    name: string = '';
    riskRangeRatings: RiskRangeRatings[] = [];
    riskSingleRatings: RiskSingleRatings[] = [];
    riskToolRatingType: RiskToolRatingType = new RiskToolRatingType();
    riskToolRatingTypeId: number = 0;
    riskRangeRate: string = '';
    riskAssessmentValue: number = 0;
}
export class RiskRangeRatings {
    displayOrder: number = 0;
    id: number = 0;
    isActive: boolean = false;
    maxValue: number = 0;
    minValue: number = 0;
    name: string = '';
    riskToolId: number = 0;
}
export class RiskSingleRatings {
    displayOrder : number = 0;
    id: number = 0;
    name: string = '';
    riskToolId: number = 0;
    value: number = 0;
}
export class RiskToolRatingType {
    id: number = 0;
    isActive: boolean = false;
    typeName: string = '';
}