import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Notes } from 'src/app/shared/models/notes.model';
import { NoteType } from 'src/app/shared/models/noteType.model';
import { ShowSideMenu, SetSideMenu, SetBreadCrumb} from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { Provider } from '../../shared/models/provider.model';
import { WorkersService } from '../workers.service';
import { Worker } from 'src/app/shared/models/worker.model';
import { selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import * as _ from 'lodash';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import * as moment from 'moment';
import { MenuItem } from 'primeng/api';
import { NoteSearchCriteriaView } from 'src/app/shared/models/search.criteria.model';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { take } from 'rxjs/operators';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-worker-notes',
  templateUrl: './worker-notes.component.html',
  styleUrls: ['./worker-notes.component.css']
})
export class WorkerNotesComponent implements OnInit {
  newNotesBox = false;
  workerId: number = 0;
  providers:Provider[] = [];
  notes:Notes[] = [];
  first = 0;
  editMode = false;
  noteTypes : NoteType[] = [];
  workerDetails: Worker = new Worker();
  note: Notes = new Notes();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  errorMessage = '';
  functionList$ = this.store.pipe(select(selectFunctionList));
  displayError = false;
  showArchiveNote = false;
  empLoaded = false;
  isLoading: boolean = false;
  breadCrumbs: MenuItem[] = [];
  totalCount = 0;
  rowCount = 10;
  currentPage = 0;
  rowOptions = [10,20,30];
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  detailsSaved: boolean = true;
  constructor(
    private store: Store<JobFitAppState>,
    private workerService: WorkersService,
    private taskService: TasksService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params: Params) => {
      this.workerService.setMenu(params?.workerId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewNotes] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
          this.workerId = params.workerId;
          this.getWDetails(this.workerId);
          this.getNoteTypes();
          this.getProviders();
          this.getPagedNotes(this.workerId , 1 , 10);
        } else {
          this.empLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }

    });
    if (this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.workerService?.menuList));
    }
  }

  ngOnInit(): void {
  }
  goToReport(functionId:number){
    this.functionList$.pipe(take(1)).subscribe(result => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.router.navigate([`../reports/worker/${this.workerId}`]);

        } else {
        //  this.editMessage = true; // dispatch error message
        this.store.dispatch(new SetError({
           errorMessages: ['Your current security setting does not give you access to this information.  Please check with your Administrator for access.'] ,
            title: 'Access Denied'}));
        }
      }
    });
  }
  onPageChange(e:any){
    this.first = e.first;
    this.getPagedNotes(this.workerId, e.page + 1,this.rowCount);
  }
  setRows(e: any){
    this.rowCount = e.value
    this.getPagedNotes(this.workerId, this.currentPage , e.value);
  }
  archiveNote(noteId: number){
    this.workerService.archiveNote(noteId).subscribe(result => {
      this.newNotesBox = false;
      this.showArchiveNote = false;
      this.getPagedNotes(this.workerId , this.currentPage , this.rowCount);
    });
  }
  getPagedNotes(workerId:number, page:number , count:number){
    let criteria = new NoteSearchCriteriaView();
    criteria.pageNumber = page;
    criteria.count = count;
    criteria.type = "Workers";
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
  getWDetails(workerId:number){
    this.isLoading = true;
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(result => {
      this.workerDetails = result;
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Workers', url: 'workers'},
        {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
        {label:'Notes'},
      ];

      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.isLoading = false;
     });
  }
  getNoteType(type:number): string | undefined{
    let t = this.noteTypes.find((nt) => (nt.id === type))?.noteTypeName;
    return t
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getNoteTypes(){
    this.workerService.getNoteTypes().subscribe(result => {
      this.noteTypes = result;
    });

  }
  getProviderName(providerId:number): string{
    let providerName = this.providers.find((p) => (p.id === providerId))?.fullName;
    return providerName ?? "No Provider Selected";
  }
  getProviders(){
    this.workerService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }

  saveNote(){
  this.note.isActive = true;
  if (this.note.noteField == null || this.note.noteField == ""){
    this.errorMessage = "Note is required";
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
      this.workerService.updateNote(this.note).subscribe(response => {
        this.getPagedNotes(this.workerId , this.currentPage , this.rowCount);
        this.newNotesBox = false;
        this.detailsSaved = true;
        this.editMode = false;
      });
    } else {
      this.note.source = 'Created by User';
      this.workerService.saveWorkerNote(this.workerId , this.note).subscribe(response => {
      this.getPagedNotes(this.workerId , this.currentPage , this.rowCount);
        this.newNotesBox = false;
        this.detailsSaved = true;
        this.editMode = false;
      });
    }
  }
  }
  viewEditNote(note: Notes){
    this.note = new Notes();
    this.note.id = note.id;
    this.note.entryDateField =  new Date(note.entryDateField);
    this.note.noteField = note.noteField;
    this.note.providedBy = note.providedBy;
    this.note.noteType = note.noteType;
    this.newNotesBox = true;
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
  changeToPlainText(text:string):string {
    let newText = text?.replace(/<[^>]+>/g, '');
    newText = newText?.replace(/\r?\n|\r/g, "");
    return newText;
  }
  archiveNoteBtn(functionId: number){
    this.functionList$.subscribe(result => {
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
  cancelViewEdit(){
    this.newNotesBox = false;
    this.editMode = false;
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

