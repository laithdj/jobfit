import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import { Notes } from 'src/app/shared/models/notes.model';
import { NoteType } from 'src/app/shared/models/noteType.model';
import { NoteSearchCriteriaView } from 'src/app/shared/models/search.criteria.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { ShowSideMenu, SetSideMenu, SetBreadCrumb} from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { Provider } from '../../shared/models/provider.model';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  newNotesBox = false;
  jobId: number = 0;
  providers:Provider[] = [];
  notes:Notes[] = [];
  editMode = false;
  rowCount = 10;
  rowOptions = [10,20,30];
  currentPage = 0;
  totalCount = 0;
  first = 0;
  noteTypes : NoteType[] = [];
  jobDetails: JobsDetails = new JobsDetails();
  note: Notes = new Notes();
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  showArchiveNote = false;
  errorMessage: string = '';
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  empLoaded = false;
  displayError: boolean = false;
  functionList$ = this.store.pipe(select(selectFunctionList));
  isLoading: boolean = false;
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  constructor(
    private store: Store<JobFitAppState>,
    private jobService: JobsService,
    private taskService: TasksService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params: Params) => {
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewNotes] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
          this.jobId = params.jobId;
          this.getJobDetails(this.jobId);
          this.getPagedNotes(this.jobId , 1 , 10);
          this.getNoteTypes();
          this.getProviders();
        } else {
          this.empLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }
    });
    if (this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.jobService?.menuList));
    }
  }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`./reports/job/${this.jobId}`]);
  }
  archiveNote(noteId: number){
    this.jobService.archiveNote(noteId).subscribe(result => {
      this.newNotesBox = false;
      this.showArchiveNote = false;
      this.getJobDetails(this.jobId);
      this.getPagedNotes(this.jobId , this.currentPage , 10);
    });
  }
  getJobDetails(jobId:number){
    this.isLoading = true;
    this.store.dispatch(new FetchJobDetails(jobId));
    this.jobDetails$.subscribe(result => {
      this.jobDetails = result;
      if (this.jobDetails) {
        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Jobs', url: 'jobs'},
          {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobId}` },
          {label:'Notes'},
        ];
        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      }
      this.isLoading = false;
    });
  }
  getNoteType(type:number): string | undefined{
    let t = this.noteTypes.find((nt) => (nt.id === type))?.noteTypeName;
    return t
  }
  getPagedNotes(workerId:number, page:number , count:number){
    let criteria = new NoteSearchCriteriaView();
    criteria.pageNumber = page;
    criteria.count = count;
    criteria.type = "Jobs";
    this.currentPage = page;
    this.isLoading = true;
    this.taskService.getNotesList(workerId, criteria).subscribe(result => {
      this.totalCount = result.listCount;
      this.notes = result.notes;
      this.notes.forEach(element => {
        element.entryDateField = new Date(element.entryDateField) ;
      });
      this.isLoading = false;
    });
  }

  onPageChange(e:any){
    this.first = e.first;
    this.getPagedNotes(this.jobId, e.page + 1,this.rowCount);
  }
  getNoteTypes(){
    this.jobService.getNoteTypes().subscribe(result => {
      this.noteTypes = result;
    });

  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getProviderName(providerId:number): string{
    let providerName = this.providers.find((p) => (p.id === providerId))?.fullName;
    return providerName ?? "";
  }
  getNotes(jobId: number){
    this.jobService.getNotes(jobId).subscribe(result => {
    //  this.notes = result;
    });
  }
  getProviders(){
    this.jobService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }
  setRows(e: any){
    this.rowCount = e.value
    this.getPagedNotes(this.jobId, this.currentPage , e.value);
  }
  saveNote(){
    this.note.isActive = true;
    if (this.note.noteField == null || this.note.noteField == ""){
      this.errorMessage = "A Note is required";
      this.displayError = true;
    }
    else if (this.note.noteType == null){
      this.errorMessage = "Note Type is required";
      this.displayError = true;
    }
    else if (this.note.entryDateField == null){
      this.errorMessage = "Entry Date is required";
      this.displayError = true;
    }
    else{
      this.detailsSaved = false;
      this.note.entryDateField = new Date(moment(this.note.entryDateField).format('YYYY-MM-DD'));
      if(this.note.id){
        this.note.source = 'Updated by User';
        this.jobService.updateNote(this.note).subscribe(response => {
        //  this.getJobDetails(this.jobId);
          this.getPagedNotes(this.jobId , this.currentPage , this.rowCount);
          this.detailsSaved = true;
          this.newNotesBox = false;
          this.editMode = false;
        });
      } else {
        this.note.source = 'Created by User';
        this.jobService.saveJobNote(this.jobId , this.note).subscribe(response => {
        //  this.getJobDetails(this.jobId);
        this.getPagedNotes(this.jobId , this.currentPage , this.rowCount);
        this.detailsSaved = true;
        this.newNotesBox = false;
        this.editMode = false;
        });
      }
    }
  }
  viewEditNote(note: Notes){
    this.note = new Notes();
    this.note.entryDateField =  new Date(note.entryDateField);
    this.note.id = note.id;
    this.note.noteField = note.noteField;
    this.note.providedBy = note.providedBy;
    this.note.noteType = note.noteType;
    this.newNotesBox = true;
  }

  changeToPlainText(text:string):string {
    let newText = text?.replace(/<[^>]+>/g, '');
    newText = newText?.replace(/\r?\n|\r/g, "");
    return newText;
  }
  newNote(functionId: number) {

      this.functionList$.pipe(take(1)).subscribe(result => {
        if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.note = new Notes();
          this.newNotesBox = true;
          this.editMode = true;
        } else {
        //  this.editMessage = true; // dispatch error message
        this.store.dispatch(new SetError({
           errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
            title: 'Access Denied'}));
        }
      }
    });
  }
  cancelViewEdit(){
    this.newNotesBox = false;
    this.editMode = false;
  }
  archiveNoteBtn(functionId: number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.showArchiveNote = true;
        } else {
          console.log('message dispatched');
        //  this.editMessage = true; // dispatch error message
        this.store.dispatch(new SetError({
           errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
            title: 'Access Denied'}));
        }
      }
    });
  }
  editNote(functionId: number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.editMode = true;
        } else {
          console.log('message dispatched');
        //  this.editMessage = true; // dispatch error message
        this.store.dispatch(new SetError({
           errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
            title: 'Access Denied'}));
        }
      }
    });
  }
}

