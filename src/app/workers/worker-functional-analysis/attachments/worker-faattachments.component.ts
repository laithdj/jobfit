import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { AttachmentSearchCriteria } from 'src/app/shared/models/attachment.result.model';
import { Attachments } from 'src/app/shared/models/attachments.model';
import { Worker } from 'src/app/shared/models/worker.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis, selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { TasksService } from 'src/app/tasks/tasks-service.service';
import { WorkersService } from '../../workers.service';


@Component({
  selector: 'worker-faattachments',
  templateUrl: './worker-faattachments.component.html',
  styleUrls: ['./worker-faattachments.component.css']
})
export class WorkerFAAttachmentsComponent implements OnInit {
  @Input() editMode: boolean = false;
  @Input() set functionalAnalysisId(functionalAnalysisId: number) {
    this.faId = functionalAnalysisId;
    this.getAttachments(this.faId, 1 , 10);
  } 
  addAttachBox = false;
  attachmentSubmitDisabled = true;
  attachments: Attachments[] = [];
  attachment: Attachments = new Attachments();
  images: any[] = [
    {
        "previewImageSrc": "assets/showcase/images/galleria/galleria1.jpg",
        "thumbnailImageSrc": "assets/showcase/images/galleria/galleria1s.jpg",
        "alt": "Description for Image 1",
        "title": "Title 1"
    }
];

  showThumbnails: boolean = true;
  faId: number = 0;
  fullscreen: boolean = false;
  worker: Worker = new Worker();
  activeIndex: number = 0;
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  totalCount:number = 0;
  onFullScreenListener: any;
  attachmentCriteria:AttachmentSearchCriteria = new AttachmentSearchCriteria();
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  first: number = 0;
  editAttachBox = false;
  showArchiveAttachment = false;
  uploadedFiles: any[] = [];
  errorMessage = '';
  displayError = false;
  rowOptions = [10,20,30];
  rowCount = 10;
  constructor(
    private store: Store<JobFitAppState>,
    private workersService: WorkersService,
    private tasksService: TasksService
  ) {
  }

  ngOnInit(): void {
  }
  getAttachments(faId:number, page:number , count:number){
    this.attachmentCriteria.pageNumber = page;
    this.attachmentCriteria.count = count;
    this.attachmentCriteria.type = "FunctionalAnalysis";
    this.attachmentCriteria.sortField= "EntryDate";
   
    this.workersService.getWorkerAttachments(faId,this.attachmentCriteria).subscribe(result => {
      this.totalCount = result.listCount;
      this.attachments = result.attachments;
    });
  }
  setRows(e: any){
    this.first = 0;
    this.getAttachments(this.faId, 1,e.value);
  }
  onPageChange(e:any){
    this.first = e.first;
    this.getAttachments(this.faId, e.page + 1,10);
  }
  editAttachment(attachment: Attachments){
    this.attachment = _.cloneDeep(attachment);
    this.editAttachBox = true;
  }
  archiveAttachment(id:number){
    this.workersService.archiveAttachment(id).subscribe(result => {
      this.getAttachments(this.faId, 1 , 10);
      this.editAttachBox = false;
      this.showArchiveAttachment = false;
    });
  }
  addNew() {
    this.attachment = new Attachments();
    this.uploadedFiles = [];
    this.addAttachBox = true;
    this.attachmentSubmitDisabled = true;

  }
  downloadAttachment(id: number, contentType:string){
    this.attachments.find((x) => x.id === id)
    this.workersService.getAttachment(id).subscribe(result => {
      let file = new Blob([result], { type: contentType });            
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }
  updateAttachment() {
    if (this.attachment.displayFileName == ""){
      this.errorMessage = "File name is required";
      this.displayError = true;
    }
    else{
      this.tasksService.updateAttachment(this.attachment.originalRevisionId ?? this.attachment.id  ,this.attachment).subscribe(result => {
        this.getAttachments(this.faId, 1 , 10);
        this.editAttachBox = false;
      });
    }
  }
  saveAttachment(){
    if (this.attachment.displayFileName == ""){
      this.errorMessage = "File Name is required";
      this.displayError = true;
    } else if (this.attachment.fileName == ""){
      this.errorMessage = "File attachment is required";
      this.displayError = true;
    }
    else{
      this.workersService.saveFAAttachments(this.faId,this.attachment).subscribe(result => {
        if(result){
          this.addAttachBox = false;
        }
        this.getAttachments(this.faId, 1 , 10);
      });
    }
  }
  onSelectFile(e: any){
    if (e && e.files.length > 0) {
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

}
