import { Attachments, Company } from "./attachments.model";
import { Flags, FlagsTree } from "./flags.models";
import { EGripsDominance, GripData, Grips } from "./grips.model";
import { HealthHygieneResult, NextDueDate } from "./health-hygeine.model";
import { MaterialHandling } from "./materialHandling.model";
import { NoteEntity } from "./note.model";
import { RiskRangeRatings } from "./risk.ratings.model";
import { Event } from "./search.criteria.model";
import { Flag } from "./task.model";

export class FunctionalAnalysis {
    id: number = 0;
    assessmentDate: Date = new Date();
    providerId: number = 0;
    event: Event = new Event();
    eventId: number = 0;
    originalRevisionId:number = 0;
    nextDueDate: NextDueDate = new NextDueDate();
    nextReviewDate: Date = new Date();
    comments:string = '';
    commentforDisplay:string = '';
    taskOverview:string = '';
    duration: string = '';
    frequencyNotes: string = '';
    taskComments: string = '';
    attachments: Attachments[] = [];
    flags: FlagsTree[] = []
    posturalToleranceResults: PosturalToleranceResult[] = [];
    materialHandlingResults: MaterialHandling[] = [];
    gripItemResults: Grips[] = [];
    riskToolResults: RiskToolResult[] = [];
    healthHygieneResults: HealthHygieneResult[] = [];
    dominantGripSides: DominantGripSide[] = [];
}
export class DominantGripSide {
    functionalAnalysisId: number = 0;
    gripSideId: number = EGripsDominance.NotTested;
}
export class RiskToolResult {
    functionalAnalysisId: number = 0;
    id: number = 0;
    isActive: boolean = false;
    riskAssessmentValue: number = 0;
    riskToolId: number = 0;
    startDate: Date = new Date();
    stopDate: Date = new Date();
    riskRating: string = '';
    riskRangeRatings: RiskRangeRatings[] = [];
}
export class FlagSet {
    id:number = 0;
    flagId: number = 0;
    functionalAnalysisId: number = 0;
    isActive: number = 0;
    note: NoteEntity = new NoteEntity();
    flag: FlagsTree = new FlagsTree();
}

export class PosturalToleranceResult {
    frequency: Frequency = new Frequency();
    functionalAnalysisId: number = 0;
    id: number = 0;
    lastUpdate: Date = new Date();
    lastUpdateBy: number = 0;
    posturalToleranceFrequencyId: number = 0;
    posturalToleranceItemId: number = 0;
    groupId: number = 0;
    displayOrder : number = 0;
}
export class Frequency {
    char: string = '';
    id: number = 0;
    lastUpdate:Date = new Date();
    lastUpdateBy: number = 0;
    name: string = '';
    value: number = 0;
}

export class PosturalToleranceGroup {
    displayOrder : number = 0;
    id: number = 0;
    items: PosturalToleranceGroupItems[] = [];
    lastUpdate: Date = new Date();
    name: string = '';
}
export class PosturalToleranceGroupItems {
    displayOrder : number = 0;
    groupId: number = 0;
    id: number = 0;
    lastUpdate: Date = new Date();
    name: string = '';
}

export enum EPosturalToleranceGroup{
    Back = 1,
    Shoulder = 2,
    HandFingers = 3,
    Neck = 4,
    WristHands = 5,
    LegFeet = 6,
    General = 7
}

export class FunctionalAnalysisResult {
    functionalAnalysis: FunctionalAnalysis[] = [];
    listCount: number = 0;
    currentPage: number = 0;
}
export class FASearchCriteria {
    pageNumber: number = 0;
    count:number = 0;
    sortField: string = '';
    sortDir: string = '';
    includeChildren: boolean = false;
}
export class CustomerCompanySettings {
    company: Company = new Company();
    companyId: number = 0;
    customisedLogoId: number = 0;
    defaultLogoId:number = 0;
    id: number = 0;
    isActive: boolean = false;
    lastUpdate: Date = new Date();
    lastUpdateBy: number = 0;
    maxUsers: number = 0;
    measurementType: MeasurementType = new MeasurementType();
    measurementTypeId:number = 0;
    previousLogoId: number = 0;
    useDefaultLogo: boolean = false;
    useLogoForReports: boolean = false;
}
export class MeasurementType {
    id:number = 0;
    isActive: boolean = false;
    lastUpdate: Date = new Date();
    typeName: string = '';
    units: string = '';
}

export class GripStrengthData {
    gripItemResults: Grips[] = [];
    dominantGrip: DominantGripSide = new DominantGripSide();
    gripData: GripData[] = [];
}
