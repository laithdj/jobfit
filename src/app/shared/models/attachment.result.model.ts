import { Attachments } from "./attachments.model";

export class AttachmentResult {
    attachments: Attachments[] = [];
    listCount: number = 0;
    currentPage: number = 0;
}
export class AttachmentSearchCriteria {
    pageNumber: number = 0;
    count: number = 0;
    sortField: string = '';
    type:string = '';
}