import { Company } from "./attachments.model";
import { HealthHygiene } from "./health-hygeine.model";

export class User {
    id:number = 0;
    //name:string = '';
    firstName: string = '';
    lastName: string = '';
    fullName: string = '';
    comments:string = '';
    company:Company  = new Company();
    companyId:number = 0;
    isActive:boolean = false;
    isAdmin = false;
    isLocked:boolean = false;
    originalRevisionId:number = 0;
    securityGroups: SecurityGroups[] = [];
    userName:string = '';
}

export class SecurityGroups {
    companyId:number = 0;
    description:string = '';
    functionSets: FunctionSets[] = [];
    healthHygiene: HealthHygiene[] = [];
    id:number = 0;
    isActive: boolean = false;
    name: string = '';
    orgEntityActionSets: string = '';
    reports: string = '';
}
export class FunctionSets {
    allow: boolean = false;
    forceAllow: boolean = false;
    functionId: number = 0;
    Id:number = 0;
    isActive: boolean = false;
    securityGroupId: number = 0;
}

export enum EFunctions{
    ViewJobFit = 2,
    SearchRisks = 4,
    SearchWorkers = 6,
    AddWorker = 7,
    SearchTasks = 8, 
    AddTask = 9,
    CopyTasks = 10,
    SearchJobs = 11,
    AddJob = 12,
    CopyJobs = 13,
    AddReport = 15,
    ViewOrganisationStructure = 16,
    ViewProviders = 17,
    ViewFlags = 18,
    ViewGroups = 19,
    ViewSystemSettings = 20,
    ViewHumanFactors = 21,
    ViewPPEs = 22,
    ViewEnvironmentalFactors = 23,
    ViewHealthHygienes = 24,
    ViewNextReviewDate = 25,
    ViewAttachments = 26,
    AddAttachment = 27,
    ViewSecurityGroups = 29,
    ViewSecuritySettings = 31,
    ViewTasks = 32,
    AddProvider = 34,
    ViewJobs = 35,
    Admin = 36,
    EditAttachment = 37,
    EditWorker = 38,
    DeleteWorker = 39,
    ViewWorkers = 40,
    EditJob = 41,
    DeleteJob = 42,
    EditTask = 43,
    DeleteTask = 44,
    ViewReports = 45,
    EditProvider = 46,
    AssignFlags = 48,
    AssignGroups = 50,
    AssignHumanFactors = 52,
    AssignPPEs = 54,
    AssignEnvironmentalFactors = 56,
    EditHealthHygiene = 58,
    DeleteHealthHygiene = 59,
    DeleteAttachment = 60,
    ViewDepartmentManager = 61,
    ViewNotes = 62,
    EditNote = 63,
    AddNote = 64,
    DeleteNote = 65,
    ViewFunctionalAnalyses = 66,
    AddFunctionalAnalysis = 67,
    EditFunctionalAnalysis = 68,
    DeleteFunctionalAnalysis = 69,
    ViewJobFitScores = 70,
    AddHealthHygiene = 71,
    AddEmployment = 72,
    ViewEmployments = 73,
    EditEmployment = 74,
    DeleteEmployment = 75,
    EditUser = 76,
    EditReport = 77,
    DeleteReport = 78,
    AddRisk = 79,
    DeleteRisk = 80,
    RunRisk = 81,
    ViewDepartments = 82,
    EditDepartments = 83,
    DefaultValues = 84
}

interface Dictionary<T> {
    [Key: number]: T;
}
export class AuthorisedFunctionList {
    Function: Dictionary<boolean> = {};
}