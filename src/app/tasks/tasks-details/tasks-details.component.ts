import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {MenuItem} from 'primeng/api';
import { FetchAssociatedJobs, FetchCurrentFunctionalAnalysisForTask, 
   FetchTask, SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectAssociatedJobs, selectCurrentFunctionalAnalysis, selectFlagTree, selectFunctionList, selectGroupTree, selectLanguage,
   selectSelectedFlagTree, selectSideMenu, selectSiteTree, selectTask, selectTaskDetails } from 'src/app/store/job-fit.selectors';
import { TaskDetails } from '../../shared/models/task.details.model';
import { TasksService } from '../tasks-service.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AssociatedJob } from '../../shared/models/associatedjobs.model';
import { FunctionalAnalysis } from '../../shared/models/functional-analysis.model';
import { GroupsTree } from '../../shared/models/groups.models';
import { DeptTree } from 'src/app/shared/models/department.model';
import { Task } from 'src/app/shared/models/task.model';
import { FlagsTree } from 'src/app/shared/models/flags.models';
import { AttachmentSearchCriteria } from 'src/app/shared/models/attachment.result.model';
import { Attachments } from 'src/app/shared/models/attachments.model';
import { SiteTree } from 'src/app/shared/models/sites.model';
import { AuthorisedFunctionList, EFunctions } from 'src/app/shared/models/user.model';
import { SetError } from 'src/app/app-store/app-ui-state.actions';
import { ACCESS_DENIED_MESSAGE, ACCESS_DENIED_TITLE } from 'src/app/shared/models/alertPopUp.model';


@Component({
  selector: 'app-tasks-details',
  templateUrl: './tasks-details.component.html',
  styleUrls: ['./tasks-details.component.css']
})
export class TasksDetailsComponent implements OnInit {
  task:Task = new Task();
  editTaskBox: boolean = false;
  taskDetails: TaskDetails = new TaskDetails();
  taskLastUpdate = '';
  attachments: Attachments[] = [];
  attachmentCriteria:AttachmentSearchCriteria = new AttachmentSearchCriteria();
  gallery: Attachments[] = [];
  currentPage: number = 0;
  overviewImage: Attachments = new Attachments();
  associatedJob : AssociatedJob = new AssociatedJob();
  totalCount:number = 0;
  doctors$ = this.store.pipe(select(selectLanguage));
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
  activeIndex: number = 0;
  onFullScreenListener: any;
  selectedGroupTree: GroupsTree[] = [];
  name: string = '';
  description: string = '';
  tree = [        {
    "label": "Documents",
    "categoryId": 0,
    "expandedIcon": "pi pi-folder-open",
    "collapsedIcon": "pi pi-folder",
    "parent": {
            "label": "Work",
            "data": "Work Folder",
            "expandedIcon": "pi pi-folder-open",
            "collapsedIcon": "pi pi-folder",
        }}
  ];
  menuList$ = this.store.pipe(select(selectSideMenu));
  taskDetails$ = this.store.pipe(select(selectTaskDetails));
  associatedJobs$ = this.store.pipe(select(selectAssociatedJobs));
  groupTree$ = this.store.pipe(select(selectGroupTree));
  breadCrumbs: MenuItem[] = [];
  imageAttachmentIdSet: number[] = [];
  groupTree: GroupsTree[] = [];
  flagTree$ = this.store.pipe(select(selectFlagTree));
  task$ = this.store.pipe(select(selectTask));
  siteTree$ = this.store.pipe(select(selectSiteTree));
  selectedFlagTree$ = this.store.pipe(select(selectSelectedFlagTree));
  flagTree: FlagsTree[] = [];
  siteTree: DeptTree[] = [];
  selectedSiteNumbs:number[] = [];
  selectedSiteTree: SiteTree[] = [];
  selectedSiteTreeNode: SiteTree[] = [];
  taskSiteTree: SiteTree[]= [];
  mainSiteTree: SiteTree[]= [];
  imageLoaded = false;
  taskId: any;
  taskDetailsLoaded = true;
  functionList$ = this.store.pipe(select(selectFunctionList));
  selectedGroupNumbs:number[] = [];
  selectedFlagNumbs: number [] = [];
  selectedFlagTree: FlagsTree[] = [];
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  detailsSaved: boolean = true;
  galleryLoaded: boolean = true;
  showArchiveTask= false;
  displayInfo: boolean = false;
  infoMessage: string = "";
  isArchiving: boolean = false;
  isSiteTreeLoaded: boolean = true;
  errorMessage = '';
  displayError = false;
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  siteTreeLoaded: boolean = false;
  authorisedFunctionList: AuthorisedFunctionList = new AuthorisedFunctionList();
  eFunctions = EFunctions;
  constructor(private router: Router,
    private store: Store<JobFitAppState>,
    private tasksService: TasksService,
    private titleService: Title,
    private route: ActivatedRoute,
    private translateService: TranslateService,) {
    this.translateService.setDefaultLang('en');
    this.translateService.use(localStorage.getItem('lang') || 'en');
    this.store.dispatch(new ShowSideMenu(true));
    this.route.params.subscribe((params: Params) => {
      this.taskId = params?.taskId;
      
      this.authorisedFunctionList = JSON.parse(localStorage.getItem("authorisedList") ?? "");
      if (Object.keys(this.authorisedFunctionList.Function).length > 0){
        if (this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
          this.store.dispatch(new FetchCurrentFunctionalAnalysisForTask(params.taskId));
            this.tasksService.setMenu(params?.taskId);
            this.getTaskDetails(params?.taskId);
            setTimeout(() => {
              this.getGroupsTree();
              this.getFlagsTree();
            }, 2000);

            this.getTask(params?.taskId);
            this.getAttachmentsOverview(params.taskId , 1 , 10);

            this.currentFunctionalAnalysis$.subscribe(result => {
              this.currentFunctionalAnalysis = result;
            });
            this.store.dispatch(new SetSideMenu(this.tasksService?.menuList));
        } else {
          this.taskDetailsLoaded = true;
            this.store.dispatch(new SetError({
              errorMessages: [ACCESS_DENIED_MESSAGE],
              title: ACCESS_DENIED_TITLE}));
        }
      }
      this.functionList$.subscribe(result => {
        this.functionList = result;
        if (this.functionList.length > 0) {
          this.authorisedList = [];
          this.authorisedList.push(this.isFunctionValid(EFunctions.EditTask));
          this.authorisedList.push(this.isFunctionValid(EFunctions.DeleteTask));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewTasks));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewAttachments) 
                                || this.isFunctionValid(EFunctions.AddAttachment)
                                || this.isFunctionValid(EFunctions.EditAttachment)
                                || this.isFunctionValid(EFunctions.DeleteAttachment));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewJobs)
                                  || this.isFunctionValid(EFunctions.AddJob)
                                  || this.isFunctionValid(EFunctions.EditJob)
                                  || this.isFunctionValid(EFunctions.DeleteJob));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewNotes)
                                  || this.isFunctionValid(EFunctions.AddNote)
                                  || this.isFunctionValid(EFunctions.EditNote)
                                  || this.isFunctionValid(EFunctions.DeleteNote));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewOrganisationStructure));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewFlags)
                                  || this.isFunctionValid(EFunctions.AssignFlags));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewGroups)
                                  || this.isFunctionValid(EFunctions.AssignGroups));
          this.authorisedList.push(this.isFunctionValid(EFunctions.ViewFunctionalAnalyses)
                                  || this.isFunctionValid(EFunctions.AddFunctionalAnalysis)
                                  || this.isFunctionValid(EFunctions.EditFunctionalAnalysis)
                                  || this.isFunctionValid(EFunctions.DeleteFunctionalAnalysis)
                                  || this.authorisedFunctionList.Function[EFunctions.ViewTasks]); // ViewTask
        
          
        }
        
      });
      
    });
   }
  ngOnInit(): void {
  }

  editTask() {
    if (this.authorisedFunctionList.Function[EFunctions.EditTask]) {
      this.name = this.task.name;
      this.description = this.task.description;
      this.getTaskSiteTree();
      this.editTaskBox = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
    
  }
  getTask(id: number){
    this.taskDetailsLoaded = false;
    this.store.dispatch(new FetchTask(id));
    this.task$.subscribe(result => {
      this.task = _.cloneDeep(result);
      this.breadCrumbs = [
        {icon: 'pi pi-home', url: 'home'},
        {label:'Tasks', url: 'tasks'},
        {label:result.name }
      ];
      this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      this.titleService.setTitle(result.name);
      this.taskDetailsLoaded = true;
    });
  }

  goToReport(){
    if (this.authorisedFunctionList.Function[EFunctions.ViewReports] && this.authorisedFunctionList.Function[EFunctions.ViewTasks]) {
      this.router.navigate([`../reports/task/${this.taskId}`]);
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  getTaskSiteTree(){
    this.isSiteTreeLoaded = false;
    this.tasksService.getSiteTreeForTask(this.taskId).subscribe(result => {
      this.taskSiteTree = _.cloneDeep(result);
      this.isSiteTreeLoaded = true;
    });
  }
  navigateToTaskList() {
    this.router.navigate([`../tasks`]);
  }
  archiveTask(){
    this.isArchiving = true;
    this.tasksService.archiveTask(this.taskId).subscribe(result => {
      this.showArchiveTask = false;
      this.isArchiving = false;
      this.displayInfo = true;
      this.infoMessage = "The Task has been archived";
    });
  }
  showArchive() {
    if (this.authorisedFunctionList.Function[EFunctions.DeleteTask]) {
      this.showArchiveTask = true;
    } else {
      this.store.dispatch(new SetError({
        errorMessages: [ACCESS_DENIED_MESSAGE],
         title: ACCESS_DENIED_TITLE}));
    }
  }
  selectedSiteChange(e: any, site:SiteTree) {
    if (e?.checked == true && !this.selectedSiteNumbs.includes(site.id)) {
      this.selectedSiteNumbs.push(site.id);
    } else {
      const idx = this.selectedSiteNumbs.findIndex((x) => x === site.id);
      if (idx > -1) {
        this.selectedSiteNumbs.splice(idx, 1);
      }
    }
  }
  getIndexIcon(type: number) : string{
    if(type === 2){ // company
      return 'fas fa-building';
    } else if(type === 3){  // division
      return 'pi pi-th-large';
    } else if(type === 8){ // departments
      return 'pi pi-briefcase';
    } else if(type === 7){ // site
      return 'pi pi-sitemap';
    } else if(type === 0){ // job
      return 'fas fa-clipboard-list';
    }
    return '';
  }
  getTaskDetails(taskId:number){
    this.taskDetailsLoaded = false;
    this.tasksService.getTaskDetails(taskId).subscribe(result => {
      this.taskDetails = _.cloneDeep(result);

      this.taskLastUpdate = moment(result.lastUpdate).format('DD-MMM-YYYY');
      result.flags.forEach(element => {
        this.selectedFlagNumbs.push(element.id);
      });
      result.groups.forEach(element => {
        this.selectedGroupNumbs.push(element.id);
      });
      this.selectedSiteNumbs = [];
      this.selectedSiteTree = [];
      if (result.siteRelationship.length > 0) {
        result.siteRelationship.forEach(element => {
          this.selectedSiteNumbs.push(element.id);
        });
        this.getSelectedSitesTree();
      } else {
        this.taskDetailsLoaded = true;
      }

    });
  }

  getSelectedSitesTree(){
    if (this.authorisedFunctionList.Function[EFunctions.EditTask] || this.authorisedFunctionList.Function[EFunctions.ViewOrganisationStructure]) {
      this.siteTreeLoaded = false;
      this.tasksService.getSelectedTaskSiteTree(this.taskId).subscribe(result => {
        this.selectedSiteTree = _.cloneDeep(result);
        this.siteTreeLoaded = true;
      });
    }
  }
  saveTask(){
    if(this.name == ""){
      this.errorMessage = "A Task Name is Required";
      this.displayError = true;
    }
    else{
      var task = new Task();
      task.id = this.taskId;
      task.name = this.name;
      task.description = this.description;

      var siteIds: number[] = [];
      if(this.selectedSiteNumbs.length > 0){
        this.selectedSiteNumbs.forEach((id:any) => {
            siteIds.push(id);
        });
        task.siteIds = siteIds;
      }
      this.detailsSaved = false;
      this.tasksService.saveTask(task).subscribe(result => {
        this.editTaskBox = false;
        this.detailsSaved = true;
        this.getTaskDetails(this.taskId);
        this.getTask(this.taskId);
      });
    }
  }

  getFlagsTree() {
    if (this.authorisedFunctionList.Function[EFunctions.ViewFlags]) {
      this.tasksService.getSelectedFlags(this.taskId).subscribe(result => {
        this.selectedFlagTree = _.cloneDeep(result);
      });
    }
  }
  getGroupsTree() {
    if (this.authorisedFunctionList.Function[EFunctions.ViewGroups]) {
      this.tasksService.getSelectedGroups(this.taskId).subscribe(result => {
        this.selectedGroupTree = _.cloneDeep(result);
      });
    }
  }
  
  getAssociatedJobs(taskId:number){
    this.store.dispatch(new FetchAssociatedJobs(taskId));
    this.associatedJobs$.subscribe(result => {
      this.associatedJob = _.cloneDeep(result);
    });
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? true : false;
  }
  downloadAttachment(id: number, contentType:string){
    this.attachments.find((x) => x.id === id)
    this.tasksService.getAttachment(id).subscribe(result => {
      let file = new Blob([result], { type: contentType });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }
  getAttachmentsOverview(taskId:number, page:number , count:number){
    if (this.authorisedFunctionList.Function[EFunctions.ViewAttachments]) {
      this.attachmentCriteria.pageNumber= page;
      this.attachmentCriteria.count= count;
      this.attachmentCriteria.type= "Tasks";
      this.attachmentCriteria.sortField= "EntryDate";
      this.galleryLoaded = false;
      this.tasksService.getAttachmentsOverview(taskId,this.attachmentCriteria).subscribe(result => {
        if(result){
          this.gallery = result.attachments.filter(x=> x.contentType !== 'application/pdf');
          let reportableList = _.cloneDeep(this.gallery).filter((x) => x.isReportable);
          if(reportableList.length > 0){
            this.overviewImage = reportableList[0];
          }
          this.imageLoaded = true;
        }
        this.galleryLoaded = true;
      });
    } else {
      this.imageLoaded = true;
      this.galleryLoaded = true;
    }
    
  }
  changeToPlainText(text:string):string {
    let newText = text?.replace(/<[^>]+>/g, '');
    newText = newText?.replace(/\r?\n|\r/g, "");
    return newText;
  }
}
