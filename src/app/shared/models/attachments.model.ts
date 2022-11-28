import { User } from "./user.model";

export class Attachments {
    id:number = 0;
    taskId:number = 0;
    fileName:string = '';
    displayFileName: string = '';
    entryDate:Date = new Date();
    comment: string = '';
    originalRevisionId: number = 0;
    addedBy: User = new User();
    fileType: string = '';
    fileSize: number = 0;
    jobReport: boolean = false;
    company: Company = new Company;
    contentLength: number = 0;
    contentType: string = '';
    isReportable: boolean = false;
    fileContent: string | ArrayBuffer | null = "";
    image: string = '';
  }
  export class Company {
    companyId: string = "";
    companyName: string = "";
    contentLength: number = 0;
    contentType: string = '';
    displayFileName: string = '';
    isReportable: boolean = false;
  }
  export class AttachmentFile {
    contentType: string = "";
    file:any;
  }
  export class AttachmentImage {
    id: number = 0;
    name: string = '';
    image:string = '';
    comment:string = '';
    isReportable:boolean = false;
  }