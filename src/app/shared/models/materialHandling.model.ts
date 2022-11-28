
export class MaterialHandling {
    awkwardLoad:boolean = false;
    forceFullPull: boolean = false;
    forceFullPush:boolean = false;
    frequency: MaterialHandlingFrequency = new MaterialHandlingFrequency();
    functionalAnalysisId: number = 0;
    id: number = 0;
    materialHandlingFreqId: number = 0;
    materialHandlingItemId: number = 0;
    value: number = 0;
    isActive = false;
}
export class MaterialHandlingFrequency {
    id: number = 0;
    multiplier: number = 0;
    name: string = '';
}
export class MaterialHandlingGroup {
    description: string = '';
    displayOrder: number = 0;
    id: number = 0;
    name: string = '';
}
export enum EMaterialHandlingFrequency{
    Occasional = 1,
    Frequent = 2,
    Continuous = 3
}
export const OccasionalFormula = 1.00;
export const FrequentFormula = 0.75;
export const ContinuousFormula = 0.57;