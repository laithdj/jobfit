import { Attachments } from "./attachments.model";
import { Dept } from "./department.model";
import { Environmental } from "./enviromental.model";
import { Flags } from "./flags.models";
import { FunctionalAnalysis } from "./functional-analysis.model";
import { Groups } from "./groups.models";
import { HumanFactor } from "./human-factors.model";
import { Notes } from "./notes.model";
import { PPE } from "./ppe.model";
import { SiteTree } from "./sites.model";
import { Flag, Group } from "./task.model";

export class Jobs {
    id:number = 0;
    companyId: number = 0;
    originalRevisionId:number = 0;
    groups:Group[] = [];
    flags:Flag[] = [];
    description:string = '';
    sites:SiteTree[] = [];    
    name:string = '';
    departments: Dept[] = [];
}


export class JobItem {
    currentPage: number = 0;
    listCount: number = 0;
    jobs: Jobs[] = [];
    }

    export class JobsDetails {
        mainDescriptionHeading: string ='';
        mainDescriptionDuration: string[] = [];
        mainDescriptionFrequency: string[] = [];
        overViewDescription: string[] = [];
        associatedJobs: Jobs[] = [];
        gallery: string[] = [];
        lastUpdate: Date = new Date();
        notes: Notes[] = [];
        siteRelationship: SiteTree[] = [];
        flags: Flag[] = [];
        ppe: PPE[] = [];
        humanFactors: HumanFactor[] = [];
        environmentalFactors: Environmental[] = [];
        groups: Group[] = [];
        attachment: Attachments[] = [];
        functionalAnalysis: FunctionalAnalysis[] = [];
        departments: Dept[] = [];
        }
        

        export class CombineOptionsView {
            combineEntityName: string = '';
            firstEntityId: number = 0;
            flagsToRemove: SupplementaryEntity[] = [];
            flagsToSet: SupplementaryEntity[] = [];
            groupsToSet: SupplementaryEntity[] = [];
            groupsToRemove: SupplementaryEntity[] = [];
            secondEntityId: number = 0;
        }

        export class SupplementaryEntity {
            categoryId:number = 0;
            Id: number = 0;
            name: string = '';
            note:string = '';
            active:boolean = false;
        }
        export class BatchCopyOptions {
            associatedCopyOptions: PrimaryCopyOptions = new PrimaryCopyOptions();
            entityIds: number[] = [];
            primaryCopyOptions: PrimaryCopyOptions = new PrimaryCopyOptions();
        }
        export class PrimaryCopyOptions {
            copyAssociatedEntities?: boolean = undefined;
            copyIncludeOptions: number[] = [];
            flagsToRemove: SupplementaryEntity[] = [];
            flagsToSet: SupplementaryEntity[] = [];
            groupsToSet: SupplementaryEntity[] = [];
            groupsToRemove: SupplementaryEntity[] = [];
            renameOptions: RenameOptions = new RenameOptions()
        }
        export class RenameOptions {
            changeCaseOption: string = '';
            nameAppendEnd: string = '';
            nameAppendStart: string = '';
            nameDeleteEnd: string = '';
            nameDeleteStart: string = '';
        }
        export class JobPosition {
            id: number = 0;
            available: number = 0;
            isActive: boolean = false;
            jobId: number = 0;
            orgEntityId: number = 0;
            originalRevisionId: number = 0;
            details: string = '';
            job: Jobs = new Jobs();
        }
        export class HealthHygieneNextAssessmentSchedule{
            nextAssessmentScheduleId: number = 0;
            healthHygieneId: number = 0;
            originalRevisionId: number = 0;
            assessmentDateTime: Date = new Date;
            providerId: number|null = 0;
            comments: string = '';
            isActive: boolean = false;
        }