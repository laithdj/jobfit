import { FlagsTree } from "./flags.models";

export class Notes {
  id:number = 0;
  entryDateField:Date = new Date;
  noteField:string = '';
  noteType: number = 1;
  lastUpdateField: Date = new Date();
  providedBy: number = 0;
  originalRevisionId: number = 0;
  source: string = ''
  flags: FlagsTree[] = [];
  addedBy: number = 0;
  isActive: boolean = false;
  addedByName: string = '';
  }
  export class NotesItem {
    currentPage: number = 0;
    listCount: number = 0;
    notes: Notes[] = [];
    }