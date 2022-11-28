import { Notes } from "./notes.model";

export class Note {
    id: number = 0;
    generalNotes: string = '';
    note: string = '';
    flagId: string = '';
}
export class NoteEntity {
    id:number = 0;
    isActive: boolean = false;
    text:string = '';
    dateTime: Date = new Date();
}
export class NotesResult {
    notes: Notes[] = [];
    listCount:number = 0;
    currentPage: number = 0;
}
