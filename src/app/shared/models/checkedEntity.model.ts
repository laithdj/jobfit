import { Environmental } from "./enviromental.model";
import { FlagsTree } from "./flags.models";
import { HumanFactor } from "./human-factors.model";
import { PPE } from "./ppe.model";
import { Flag, Group } from "./task.model";

export class CheckedEntity {
    id: number = 0;
    entityId: number = 0;
    specificNote: string = '';
    jobFitEntityType: string = ''
    generalNote:string = '';
    flagId: string = '';
    existingFlags?:Flag[] = [];
    existingFlagsFA?:FlagsTree[] = [];
    existingGroups?:Group[] = [];
    existingEnvs?: Environmental[] = [];
    existingHumanFactors?: HumanFactor[] = [];
    existingPpes?: PPE[] = [];
}