import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { FetchTask, FetchTaskDetails, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList, selectTask, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { AttachmentSearchCriteria } from '../../shared/models/attachment.result.model';
import { AttachmentImage, Attachments } from '../../shared/models/attachments.model';
import { TaskDetails } from '../../shared/models/task.details.model';
import { TasksService } from '../tasks-service.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})

export class AttachmentsComponent implements OnInit {
  addAttachBox = false;
  attachments: Attachments[] = [];
  availableAttachments: Attachments[] = [];
  attachmentSubmitDisabled = true;
  isUploading = false;
  rowOptions = [10,20,30];
  attachment: Attachments = new Attachments();
  taskId: any;
  rowCount = 10;
  functionList$ = this.store.pipe(select(selectFunctionList));
  errorMessage = '';
  displayError = false;
  showArchiveAttachment = false;
  responsiveOptions = [
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
];
  images: any[] = [
    {
        "previewImageSrc": "assets/showcase/images/galleria/galleria1.jpg",
        "thumbnailImageSrc": "assets/showcase/images/galleria/galleria1s.jpg",
        "alt": "Description for Image 1",
        "title": "Title 1"
    }
];

  showThumbnails: boolean = true;
  fullscreen: boolean = false;
  taskDetails: TaskDetails = new TaskDetails();
  activeIndex: number = 0;
  gallery: AttachmentImage[] = [];
  totalCount:number = 0;
  editAttachBox = false;
  imageAttachmentIdSet: number[] = [];
  onFullScreenListener: any;
  currentPage: number = 1;
  attachmentCriteria:AttachmentSearchCriteria = new AttachmentSearchCriteria();
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  first: number =0;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  uploadedFiles: any[] = [];
  empLoaded = false;
  attachmentsLoaded = false;
  task$ = this.store.pipe(select(selectTask));
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  constructor(
    private store: Store<JobFitAppState>,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params: Params) => {
      this.taskId = params.taskId;
      this.tasksService.setMenu(params.taskId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewAttachments] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
          this.getTaskDetails(params.taskId);
          this.getAttachments(params.taskId, 1 , 10);
        } else {
          this.empLoaded = true;
          this.store.dispatch(new SetError({
            errorMessages: [ACCESS_DENIED_MESSAGE],
            title: ACCESS_DENIED_TITLE}));
        }
      }
    });


      if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {

      this.store.dispatch(new FetchTask(this.taskId));
        this.task$.subscribe(result => {
          this.breadCrumbs = [
            {icon: 'pi pi-home', url: 'home'},
            {label:'Tasks', url: 'tasks'},
            {label:result.name, url: `tasks/tasks-details/${result.originalRevisionId || result.id}` },
            {label:'Attachments'},
          ];
          this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
        });
    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.tasksService?.menuList));
  }
  }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`../reports/task/${this.taskId}`]);
  }

  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getAttachments(this.taskId, this.currentPage , e.value);
  }
  getTaskDetails(taskId:number){
    this.store.dispatch(new FetchTaskDetails(taskId));
    this.taskDetails$.subscribe(result => {
      this.taskDetails = _.cloneDeep(result);
    });
  }
  isFunctionValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  isReportable(id: number){
    this.errorMessage = '';
    let attachments = this.availableAttachments.filter((x) => x.isReportable);
    let attachment:Attachments = this.attachments.find((x) => x.id === id) ?? new Attachments();
    if((attachments.length < 2) && (attachment.contentType !== 'application/pdf')){
      attachment.isReportable = attachment.isReportable ? false : true;
    } else if(attachment.isReportable){
      attachment.isReportable = false;
    } else if(attachment.contentType === 'application/pdf') {
      this.errorMessage = "Only Image types can be shown on the report."
      this.displayError = true;
    }
     else{
      this.errorMessage = "Only 2 Images are allowed to be shown on the report."
      this.displayError = true;
    }
    if(this.errorMessage.length < 1){
      this.tasksService.updateAttachment(this.taskId,attachment).subscribe(result => {
          this.getAttachments(this.taskId, this.currentPage , this.rowCount);
        });
    }
  }
  getAttachmentImages(totalCount: number){
    let attachmentCriteria = new AttachmentSearchCriteria();
    attachmentCriteria.pageNumber = 1;
    attachmentCriteria.count = totalCount;
    attachmentCriteria.type= "Tasks";
    attachmentCriteria.sortField= "EntryDate";
    this.imageAttachmentIdSet = [];
    this.gallery = [];
    this.attachmentsLoaded = false;
    this.tasksService.getAttachments(this.taskId,attachmentCriteria).subscribe(result => {
      result.attachments.forEach(element => {
        if(element.contentType !== 'application/pdf'){
          this.imageAttachmentIdSet.push(element.id);
        }
      });
      if(this.imageAttachmentIdSet.length > 0){
        this.displayImageAttachment(this.imageAttachmentIdSet);
      }
      this.attachmentsLoaded = true;
    });
  }
  archiveAttachment(id:number){
    this.tasksService.archiveAttachment(id).subscribe(result => {
      this.getAttachments(this.taskId, this.currentPage , this.rowCount);
      this.getAttachmentImages(10000);
      this.editAttachBox = false;
      this.showArchiveAttachment = false;
    });
  }
  getAllAttachments(taskId:number, page:number , count:number){
    this.attachmentsLoaded = false;
    this.attachmentCriteria.pageNumber= page;
    this.attachmentCriteria.count= count;
    this.attachmentCriteria.type= "Tasks";
    this.attachmentCriteria.sortField= "EntryDate";
    this.tasksService.getAttachments(taskId,this.attachmentCriteria).subscribe(result => {
          this.availableAttachments = result.attachments;
          this.attachmentsLoaded = true;
    });
  }

  getAttachments(taskId:number, page:number , count:number){
    this.attachmentCriteria.pageNumber= page;
    this.attachmentCriteria.count= count;
    this.attachmentCriteria.type= "Tasks";
    this.attachmentCriteria.sortField= "EntryDate";
    this.currentPage = page;
    this.attachmentsLoaded = false;
    this.tasksService.getAttachments(taskId,this.attachmentCriteria).subscribe(result => {
      this.totalCount = result.listCount;
      this.attachments = result.attachments;
      if(result.listCount > 0) {
        this.getAllAttachments(this.taskId,1,result.listCount);
        this.getAttachmentImages(10000);
      } else {
        this.attachmentsLoaded = true;
      }
    });
  }

  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getAttachments(this.taskId, e.page + 1,this.rowCount);
  }
  editAttachment(attachment: Attachments, functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.attachment = _.cloneDeep(attachment);
          this.editAttachBox = true;
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
  updateAttachment() {
    if (this.attachment.displayFileName == ""){
      this.errorMessage = "File name is required";
      this.displayError = true;
    }
    else{
      this.detailsSaved = false;
      this.tasksService.updateAttachment(this.attachment.originalRevisionId ?? this.attachment.id  ,this.attachment).subscribe(result => {
        this.getAttachments(this.taskId, this.currentPage , 10);
        this.detailsSaved = true;
        this.editAttachBox = false;
      });
    }
  }
  addAttachment(functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.addAttachBox = true;
          this.uploadedFiles = [];
          this.attachment = new Attachments();
          this.attachmentSubmitDisabled = true;
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
  archiveAttchBtn(functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {

      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.showArchiveAttachment = true
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
  

  saveAttachment(){
    this.isUploading = true;
    if (this.attachment.displayFileName == ""){
      this.errorMessage = "File Name is required";
      this.displayError = true;
    } else if (this.attachment.fileName == ""){
      this.errorMessage = "File attachment is required";
      this.displayError = true;
    }
    else{
      this.attachment.jobReport = false;
      this.detailsSaved = false;
      this.tasksService.saveAttachment(this.taskId,this.attachment).subscribe(result => {
        this.getAttachments(this.taskId, this.currentPage , this.rowCount);
        this.addAttachBox = false;
        if(result > 0){
          this.isUploading = false;
        }
        this.detailsSaved = true;
      });
    }

  }

  onSelectFile(e: any){
    if ((e) && (e.currentFiles.length > 0)) {
      this.attachmentSubmitDisabled = false;
      this.attachment.fileType = e.files[0]?.type;
      this.attachment.fileName = e.files[0]?.name;
      this.attachment.displayFileName = this.attachment.displayFileName == "" ?  e.files[0]?.name: this.attachment.displayFileName;
      this.attachment.fileSize = e.files[0]?.size;
      this.attachment.contentLength = e.currentFiles[0]?.size;
      let fileReader = new FileReader();
      fileReader.readAsDataURL(e.files[0]);
      fileReader.onload =  () => {
        this.attachment.fileContent = fileReader.result;
      }
      };
    }

  downloadAttachment(id: number, contentType:string){
    this.attachments.find((x) => x.id === id)
    this.tasksService.getAttachment(id).subscribe(result => {
      let file = new Blob([result], { type: contentType });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }
  displayImageAttachment(ids: number[]){
    this.gallery = [];
    this.attachmentsLoaded = false;
    this.tasksService.getAttachmentImages(ids).subscribe(result => {
      this.gallery = result;
      this.attachmentsLoaded = true;
    });
  }
  onRemoveImage(e: any) {
    this.attachment.fileName = '';
    this.attachment.fileType = '';
    this.attachment.fileSize = 0;
  }

}
