import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { Worker } from 'src/app/shared/models/worker.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';

import { AttachmentSearchCriteria } from '../../shared/models/attachment.result.model';
import { AttachmentImage, Attachments } from '../../shared/models/attachments.model';
import { WorkersService } from '../workers.service';


@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  addAttachBox = false;
  attachments: Attachments[] = [];
  attachment: Attachments = new Attachments();
  workerId: any;
  errorMessage = '';
  attachmentLoaded = false;
  displayError = false;
  isUploading = false;
  rowCount = 10;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  editAttachBox = false;
  availableAttachments: Attachments[] = [];
  showArchiveAttachment = false;
  imageAttachmentIdSet: number[] = [];
  gallery: AttachmentImage[] = [];
  attachmentDisabled = true;
  currentPage: number = 1;
  rowOptions = [10,20,30];
  images: any[] = [
    {
        "previewImageSrc": "assets/showcase/images/galleria/galleria1.jpg",
        "thumbnailImageSrc": "assets/showcase/images/galleria/galleria1s.jpg",
        "alt": "Description for Image 1",
        "title": "Title 1"
    }
];
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

  showThumbnails: boolean = true;
  fullscreen: boolean = false;
  workerDetails: Worker= new Worker();
  activeIndex: number = 0;
  totalCount:number = 0;
  onFullScreenListener: any;
  attachmentCriteria:AttachmentSearchCriteria = new AttachmentSearchCriteria();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  first: number = 0;
  uploadedFiles: any[] = [];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  empLoaded = false;
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  constructor(
    private store: Store<JobFitAppState>,
    private workersService: WorkersService,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params: Params) => {
      this.workerId = params.workerId;
      this.workersService.setMenu(params.workerId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewAttachments] && this.authorisedFunctionList.Function[EFunctions.ViewWorkers]) {
          this.getWorkerDetails(params.workerId);
          this.getAttachments(params.workerId, 1 , 10);
          this.functionList$.subscribe(result => {
            this.functionList = result;
            this.authorisedList = [];
            this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
          });
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
    this.store.dispatch(new SetSideMenu(this.workersService?.menuList));
    }
  }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`../reports/worker/${this.workerId}`]);
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getWorkerDetails(workerId:number){
    this.store.dispatch(new FetchWorkerDetails(workerId));
    this.workerDetails$.subscribe(result => {
      this.workerDetails = _.cloneDeep(result);
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Workers', url: 'workers'},
        {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
        {label:'Attachments'},
      ];

      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    });
  }
  archiveAttachment(id:number){
    this.workersService.archiveAttachment(id).subscribe(result => {
      this.getAttachments(this.workerId, this.currentPage , this.rowCount);
      this.getAttachmentImages(10000);
      this.editAttachBox = false;
      this.showArchiveAttachment = false;
    });
  }

  getAttachmentImages(totalCount: number){
    let attachmentCriteria = new AttachmentSearchCriteria();
    attachmentCriteria.pageNumber = 1;
    attachmentCriteria.count = totalCount;
    attachmentCriteria.type= "Workers";
    attachmentCriteria.sortField= "EntryDate";
    this.imageAttachmentIdSet = [];
    this.tasksService.getAttachments(this.workerId,attachmentCriteria).subscribe(result => {
      result.attachments.forEach(element => {
        if(element.contentType !== 'application/pdf'){
          this.imageAttachmentIdSet.push(element.id);
      }
      if(this.imageAttachmentIdSet.length > 0){
        this.displayImageAttachment(this.imageAttachmentIdSet);
      }
      });
    });
  }
  addAttach(){
    this.attachment = new Attachments();
    this.uploadedFiles = [];
    this.addAttachBox = true;
    this.attachmentDisabled = true;
  }
  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getAttachments(this.workerId, this.currentPage , e.value);
  }
  getAttachments(workerId:number, page:number , count:number){
    this.attachmentCriteria.pageNumber= page;
    this.attachmentCriteria.count= count;
    this.attachmentCriteria.type= "Workers";
    this.attachmentCriteria.sortField= "EntryDate";
    this.currentPage = page;
    this.attachmentLoaded = false;
    this.workersService.getAttachments(workerId,this.attachmentCriteria).subscribe(result => {
      this.totalCount = result.listCount;
      this.attachments = result.attachments;
      if(result.listCount > 0) {
        this.getAllAttachments(this.workerId,1,result.listCount);
        this.getAttachmentImages(10000);
      } else {
        this.attachmentLoaded = true;
      }
    });
  }
  getAllAttachments(taskId:number, page:number , count:number){
    this.attachmentLoaded = false;
    this.attachmentCriteria.pageNumber= page;
    this.attachmentCriteria.count= count;
    this.attachmentCriteria.type= "Workers";
    this.attachmentCriteria.sortField= "EntryDate";
    this.tasksService.getAttachments(taskId,this.attachmentCriteria).subscribe(result => {
          this.availableAttachments = result.attachments;
          this.attachmentLoaded = true;
    });
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getAttachments(this.workerId, e.page + 1, this.rowCount);
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
      this.workersService.saveAttachments(this.workerId,this.attachment).subscribe(result => {
        this.isUploading = false;
        this.addAttachBox = false;
        this.detailsSaved = true;
        this.getAttachments(this.workerId, this.currentPage , this.rowCount);

      });
    }
  }
  addAttachment(functionId:number){
    this.functionList$.pipe(take(1)).subscribe((result) => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.attachment = new Attachments();
          this.uploadedFiles = [];
          this.addAttachBox = true;
          this.attachmentDisabled = true;
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
    this.functionList$.subscribe(result => {
      if (result) {
        var indx = result.find((x) => x === functionId);
        if(indx){
          this.showArchiveAttachment = true
        } else {
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
        this.getAttachments(this.workerId, this.currentPage , this.rowCount);
        this.editAttachBox = false;
        this.detailsSaved = true;
      });
    }
  }

  downloadAttachment(id: number, contentType:string){
    this.attachments.find((x) => x.id === id)
    this.tasksService.getAttachment(id).subscribe(result => {
      let file = new Blob([result], { type: contentType });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }
  onSelectFile(e: any){
    if (e && e.currentFiles.length > 0) {
      this.attachmentDisabled = false;
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
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
  }

  displayImageAttachment(ids: number[]){
      this.tasksService.getAttachmentImages(ids).subscribe(result => {
        console.log(result);
        this.gallery = result;
      });
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

  onRemoveImage(e: any) {
    this.attachment.fileName = '';
    this.attachment.fileType = '';
    this.attachment.fileSize = 0;
  }

}
