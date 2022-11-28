import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { take } from 'rxjs/operators';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';
import { JobsDetails } from 'src/app/shared/models/jobs.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchJobDetails } from 'src/app/store/jobs-store/jobs.actions';
import { selectJobDetails } from 'src/app/store/jobs-store/jobs.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { AttachmentSearchCriteria } from '../../shared/models/attachment.result.model';
import { Attachments, AttachmentImage } from '../../shared/models/attachments.model';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  addAttachBox = false;
  attachments: Attachments[] = [];
  availableAttachments: Attachments[] = [];
  attachment: Attachments = new Attachments();
  jobId: any;
  attachmentsLoaded = false;
  errorMessage = '';
  displayError = false;
  attachmentSubmitDisabled = true;
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
  isUploading = false;
  jobDetails: JobsDetails = new JobsDetails();
  activeIndex: number = 0;
  totalCount:number = 0;
  onFullScreenListener: any;
  attachmentCriteria:AttachmentSearchCriteria = new AttachmentSearchCriteria();
  jobDetails$ = this.store.pipe(select(selectJobDetails));
  first: number = 0;
  uploadedFiles: any[] = [];
  editAttachBox = false;
  currentPage: number = 1;
  showArchiveAttachment = false;
  imageAttachmentIdSet: number[] = [];
  gallery: AttachmentImage[] = [];
  rowCount = 10;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  rowOptions = [10,20,30];
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  empLoaded = false;
  job$ = this.store.pipe(select(selectJobDetails));
  breadCrumbs: MenuItem[] = [];
  detailsSaved: boolean = true;
  constructor(private router: Router,
    private store: Store<JobFitAppState>,
    private jobsService: JobsService,
    private tasksService: TasksService,
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.jobId = params.jobId;
      this.jobsService.setMenu(params.jobId);
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (this.authorisedFunctionList) {
        if (this.authorisedFunctionList.Function[EFunctions.ViewAttachments] && this.authorisedFunctionList.Function[EFunctions.ViewJobs]) {
          this.getJobDetails(params.jobId);
          this.getAttachments(params.jobId, 1 , 10);
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
    this.store.dispatch(new SetSideMenu(this.jobsService?.menuList));
    }
  }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`./reports/job/${this.jobId}`]);

  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getJobDetails(jobId:number){
    this.store.dispatch(new FetchJobDetails(jobId));
    this.jobDetails$.subscribe(result => {
      this.jobDetails = _.cloneDeep(result);
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Jobs', url: 'jobs'},
        {label:result.mainDescriptionHeading, url: `jobs/jobs-details/${this.jobId}` },
        {label:'Attachments'},
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
    });
  }
  archiveAttachment(id:number){
    this.jobsService.archiveAttachment(id).subscribe(result => {
      this.getAttachments(this.jobId, this.currentPage , this.rowCount);
      this.getAttachmentImages(1000);
      this.editAttachBox = false;
      this.showArchiveAttachment = false;
    });
  }
  addAttach(){
    this.attachment = new Attachments();
    this.uploadedFiles = [];
    this.addAttachBox = true;
    this.attachmentSubmitDisabled = true;

  }
  getAttachmentImages(totalCount: number){
    let attachmentCriteria = new AttachmentSearchCriteria();
    attachmentCriteria.pageNumber = 1;
    attachmentCriteria.count = totalCount;
    attachmentCriteria.type= "Jobs";
    attachmentCriteria.sortField= "EntryDate";
    this.imageAttachmentIdSet = [];
    this.jobsService.getJobAttachments(this.jobId, this.attachmentCriteria).subscribe(result => {
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
  displayImageAttachment(ids: number[]){
    this.tasksService.getAttachmentImages(ids).subscribe(result => {
      this.gallery = result;
    });
  }
  getAttachments(jobId:number, page:number , count:number){
    this.attachmentsLoaded = false;
    this.attachmentCriteria.pageNumber= page;
    this.attachmentCriteria.count= count;
    this.attachmentCriteria.type= "Jobs";
    this.attachmentCriteria.sortField= "EntryDate";
    this.currentPage = page;
    this.jobsService.getJobAttachments(jobId, this.attachmentCriteria).subscribe(result => {
      this.totalCount = result.listCount;
      this.attachments = result.attachments;
      if(result.listCount > 0) {
        this.getAllAttachments(this.jobId,1,result.listCount);
        this.getAttachmentImages(10000);
      } else {
        this.attachmentsLoaded = true;
      }
    });
  }
  getAllAttachments(taskId:number, page:number , count:number){
    this.attachmentsLoaded = false;
    this.attachmentCriteria.pageNumber= page;
    this.attachmentCriteria.count= count;
    this.attachmentCriteria.type= "Jobs";
    this.attachmentCriteria.sortField= "EntryDate";
    this.tasksService.getAttachments(taskId,this.attachmentCriteria).subscribe(result => {
          this.availableAttachments = result.attachments;
          this.attachmentsLoaded = true;
    });
  }
  onPageChange(e:any){
    this.first = e.first;
    this.currentPage = e.page + 1;
    this.getAttachments(this.jobId, e.page + 1,this.rowCount);
  }

  updateAttachment() {
    if (this.attachment.displayFileName == ""){
      this.errorMessage = "File name is required";
      this.displayError = true;
    }
    else{
      this.detailsSaved = false;
      this.tasksService.updateAttachment(this.attachment.originalRevisionId ?? this.attachment.id  ,this.attachment).subscribe(result => {
        this.getAttachments(this.jobId, this.currentPage , this.rowCount);
        this.editAttachBox = false;
        this.detailsSaved = true;
      });
    }
  }
  setRows(e: any){
    this.rowCount = e.value;
    this.currentPage = 1;
    this.first = 0;
    this.getAttachments(this.jobId, this.currentPage , e.value);
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
      this.detailsSaved = false;
      this.attachment.jobReport = false;
      this.jobsService.saveAttachments(this.jobId,this.attachment).subscribe((result:any) => {
        this.getAttachments(this.jobId, this.currentPage , this.rowCount);
        this.addAttachBox = false;
        if(result > 0){
          this.isUploading = false;
        }
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

  onRemoveImage(e: any) {
    this.attachment.fileName = '';
    this.attachment.fileType = '';
    this.attachment.fileSize = 0;
  }
  isReportable(id: number){
    this.errorMessage = '';
    let attachments = this.attachments.filter((x) => x.isReportable == true);
    let attachment:Attachments = this.attachments.find((x) => x.id === id) ?? new Attachments();
    if((attachments.length < 2) && (attachment.contentType !== 'application/pdf')){
      attachment.isReportable = attachment.isReportable ? false : true;
    } else if(attachment.isReportable){
      attachment.isReportable = false;
    } else if(attachment.contentType === 'application/pdf') {
      this.errorMessage = "Only Image types can be show on the report."
      this.displayError = true;
    }
     else{
      this.errorMessage = "Only 2 Images are allowed to be shown on the report."
      this.displayError = true;
    }
    if(this.errorMessage.length < 1){
      this.tasksService.updateAttachment(attachment.originalRevisionId ?? attachment.id, attachment).subscribe(result => {
        this.getAttachments(this.jobId, this.currentPage , this.rowCount);
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
  isFunctionBtnValid(functionList: number[] | null ,functionId: number): boolean{
    if(functionList)
    var indx = functionList.find((x) => x === functionId);
    return indx ? false : true
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

}
