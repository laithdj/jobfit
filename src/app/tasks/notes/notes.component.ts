import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { FetchTask, FetchTaskDetails, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList, selectTask, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { Notes } from '../../shared/models/notes.model';
import { Provider } from '../../shared/models/provider.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { TasksService } from '../tasks-service.service';
import { NoteType } from '../../shared/models/noteType.model';
import * as _ from 'lodash';
import { PagedList } from 'src/app/shared/models/paged.list.model';
import * as moment from 'moment';
import { NoteSearchCriteriaView } from 'src/app/shared/models/search.criteria.model';
import { MenuItem } from 'primeng/api';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {
  private _destroyed$: Subject<boolean> = new Subject<boolean>();
  newNotesBox = false;
  taskId: number = 0;
  pagedList: PagedList = new PagedList();
  noteType= [{id:1 , name:"Note"} ,{id:2 , name:"Recommendation"} ]
  providers:Provider[] = [];
  notes:Notes[] = [];
  rowCount = 10;
  rowOptions = [10,20,30];
  editMode = false;
  currentPage = 0;
  totalCount = 0;
  first = 0;
  noteTypes : NoteType[] = [];
  taskDetails: TaskDetails = new TaskDetails();
  note: Notes = new Notes();
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  errorMessage = '';
  displayError = false;
  empLoaded = false;
  showArchiveNote = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  functionList$ = this.store.pipe(select(selectFunctionList));
  isLoading: boolean = false;
  task$ = this.store.pipe(select(selectTask));
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  constructor(
    private store: Store<JobFitAppState>,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TasksService,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.taskId = params.taskId;
      this.tasksService.setMenu(params.taskId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewNotes] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
          this.getTaskDetails(params.taskId);
          this.getNoteTypes();
          this.getProviders();
          this.getPagedNotes(this.taskId, 1 , 10);
          this.store.dispatch(new FetchTask(this.taskId));
            this.task$.subscribe(result => {
              this.breadCrumbs = [
                {icon: 'pi pi-home', url: 'home'},
                {label:'Tasks', url: 'tasks'},
                {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
                {label:'Notes'},
              ];
              this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
            });
        } else {
          this.empLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }
    });
    if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.tasksService?.menuList));
    }
  }

  ngOnInit(): void {
  }
  ngOnDestroy() {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }
  goToReport(){
    this.router.navigate([`../reports/task/${this.taskId}`]);
  }
  archiveNote(noteId: number){
    this.tasksService.archiveNote(noteId).subscribe(result => {
      this.newNotesBox = false;
      this.showArchiveNote = false;
      this.getPagedNotes(this.taskId, this.currentPage , this.rowCount);
    });
  }
  setRows(e: any){
    console.log(e?.value);
    this.rowCount = e.value
    this.getPagedNotes(this.taskId, this.currentPage , e.value);
  }
  onPageChange(e:any){
    this.first = e.first;
    this.getPagedNotes(this.taskId, e.page + 1,this.rowCount);
  }
  getPagedNotes(workerId:number, page:number , count:number){
    let criteria = new NoteSearchCriteriaView();
    criteria.pageNumber = page;
    criteria.count = count;
    criteria.type = "Tasks";
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
  getTaskDetails(taskId:number){
    this.isLoading = true;
    this.store.dispatch(new FetchTaskDetails(taskId));
    this.taskDetails$.subscribe(result => {
      this.taskDetails = result;
      this.isLoading = false;
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getNoteType(type:number): string | undefined{
    let t = this.noteTypes.find((nt) => (nt.id === type))?.noteTypeName;
    return t
  }
  getNoteTypes(){
    this.tasksService.getNoteTypes().subscribe(result => {
      this.noteTypes = result;
    });

  }

  getProviders(){
    this.tasksService.getNoteProviders().subscribe(result => {
      this.providers = result;
    });
  }

  getProviderName(providerId:number): string{
    let providerName = this.providers.find((p) => (p.id === providerId))?.fullName;
    return providerName ?? "";
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
        this.tasksService.updateTaskNote(this.note).subscribe(response => {
        this.getPagedNotes(this.taskId, this.currentPage , this.rowCount);
          this.newNotesBox = false;
          this.detailsSaved = true;
          this.editMode = false;
        });
      } else {
        this.note.source = 'Created by User';
        this.tasksService.saveTaskNote(this.taskId , this.note).subscribe(response => {
        this.getPagedNotes(this.taskId, this.currentPage , this.rowCount);
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
      this.functionList$.pipe(take(1)).subscribe((result) => {
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
      this.functionList$.subscribe(result => {
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
