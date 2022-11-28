import { TaskJobs } from "./associatedjobs.model";
import { Attachments } from "./attachments.model";
import { Environmental } from "./enviromental.model";
import { Flags } from "./flags.models";
import { FunctionalAnalysis } from "./functional-analysis.model";
import { Groups } from "./groups.models";
import { HumanFactor } from "./human-factors.model";
import { Notes } from "./notes.model";
import { PPE } from "./ppe.model";
import { SiteTree } from "./sites.model";

export class TaskDetails {
  mainDescriptionHeading: string ='';
  mainDescriptionDuration: string[] = [];
  mainDescriptionFrequency: string[] = [];
  overViewDescription: string = '';
  associatedJobs: TaskJobs[] = [];
  gallery: string[] = [];
  lastUpdate: Date = new Date();
  notes: Notes[] = [];
  siteRelationship: SiteTree[] = [];
  flags: Flags[] = [];
  ppe: PPE[] = [];
  humanFactors: HumanFactor[] = [];
  environmentalFactors: Environmental[] = [];
  groups: Groups[] = [];
  attachment: Attachments[] = [];
  functionalAnalysis: FunctionalAnalysis[] = [];
  nextAssessmentScheduleId: number = 0;
  }

  export class NextAssesmentSchedule {
    originalRevisionId: number = 0;
    assessmentDateTime: Date = new Date;
    providerId: number|null = 0;
    comments: string = '';
    isActive: boolean = false;
}