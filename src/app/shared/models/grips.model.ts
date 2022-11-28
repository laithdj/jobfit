export class Grips {
    id:number = 0;
    functionalAnalysisId: number = 0;
    gripItemId: number = 0;
    value:number = 0;
    gripSideId: number = 0;
    isTested: boolean = false;
}

export class GripItemView {
    description: string = '';
    displayOrder: number = 0;
    id: number = 0;
    name: string = '';
}
export class GripData
{
    gripItemId: number = 0;
    ageFrom: number = 0;
    ageTo: number = 0;
    isMale: boolean = false;
    dominantMean: number = 0;
    nonDominantMean: number = 0;
}
export enum EGripsDominance{
    NotTested = 5,
    Right = 4,
    Left = 3,
    Both = 6,
    Either = 7
}