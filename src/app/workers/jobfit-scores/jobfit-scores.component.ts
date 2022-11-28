import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ChartData, ChartOptions } from 'chart.js';
import * as moment from 'moment';
import { MenuItem } from 'primeng/api';
import { JobFitSummaryScore } from 'src/app/shared/models/employment.model';
import { SearchCriteria } from 'src/app/shared/models/search.criteria.model';
import { EFunctions } from 'src/app/shared/models/user.model';
import { SetBreadCrumb, SetSideMenu, ShowSideMenu } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectFunctionList } from 'src/app/store/job-fit.selectors';
import { FetchWorkerDetails } from 'src/app/store/workers-store/workers.actions';
import { selectWorkerDetails } from 'src/app/store/workers-store/workers.selectors';
import { WorkersService } from '../workers.service';

@Component({
  selector: 'app-jobfit-scores',
  templateUrl: './jobfit-scores.component.html',
  styleUrls: ['./jobfit-scores.component.css']
})
export class JobfitScoresComponent implements OnInit {
  jobFitScores: JobFitSummaryScore[] = [];
  workerId:number = 0;
  first:number = 0;
  totalCount:number = 0;
  currentPage:number = 0;
  rowCount = 10;
  rowOptions = [10,20,30];
  graphData: ChartData | undefined;
  graphStyle: ChartOptions | undefined;
  graphSeries: any;
  selectedGraphSeries: Array<string|number> = [];
  viewBtnClicked: boolean = false;
  functionList$ = this.store.pipe(select(selectFunctionList));
  functionList:number[] = [];
  authorisedList: boolean[] =[];
  breadCrumbs: MenuItem[] = [];
  workerDetails$ = this.store.pipe(select(selectWorkerDetails));
  jobfitScoresLoaded: boolean = true;
  constructor(
    private store: Store<JobFitAppState>,
    private workersService: WorkersService,
    private route: ActivatedRoute,
    private router: Router
   ) {
    this.route.params.subscribe((params: Params) => {
      this.workerId = params.workerId;
      this.workersService.setMenu(params.workerId);
      this.getJobFitSummaryScore(params.workerId, 1, 10);
      this.functionList$.subscribe(result => {
        this.functionList = result;
        this.authorisedList = [];
        this.authorisedList.push(this.isFunctionValid(EFunctions.ViewReports));
      });
      this.store.dispatch(new FetchWorkerDetails(params.workerId));
      this.workerDetails$.subscribe(result => {
        this.breadCrumbs = [
          {icon: 'pi pi-home', url: 'home'},
          {label:'Workers', url: 'workers'},
          {label:result.fullName, url: `workers/workers-details/${result.originalRevisionID || result.workerId}` },
          {label:'JobFit Scores'},
        ];
        this.store.dispatch(new SetBreadCrumb(this.breadCrumbs));
      });
    });

    this.store.dispatch(new ShowSideMenu(true));
    this.store.dispatch(new SetSideMenu(this.workersService?.menuList));
  }

  ngOnInit(): void {
  }
  goToReport(){
    this.router.navigate([`../reports/worker/${this.workerId}`]);
  }
  goToJobsDetails(jobId: number) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['../jobs/jobs-details/' + jobId])
    );
    window.open(url);
  }
  isFunctionValid(functionId: number): boolean{
    var indx = this.functionList.find((x) => x === functionId);
    return indx ? false : true
  }
  getJobFitSummaryScore(workerId:number, page:number , count:number){
    let criteria: SearchCriteria = new SearchCriteria();
    criteria.pageNumber = page;
    criteria.count = count;
    criteria.sortDir = 'desc';
    criteria.sortField = 'Date';
    this.jobfitScoresLoaded = false;
    this.workersService.getJobFitSummaryScoreList(workerId,criteria).subscribe(result => {
      this.jobFitScores = result.summaryScore;
      this.graphSeries = this.getUniqueJobNames();
      this.totalCount = result.listCount;
      this.jobfitScoresLoaded = true;
    });
  }
  onPageChange(e:any){
    this.first = e.first;
    this.getJobFitSummaryScore(this.workerId, e.page + 1,this.rowCount);
    this.currentPage = e.page + 1;
  }
  archive(id:number){
    this.workersService.archiveJobFitSummaryScoreList(id).subscribe(result => {
      this.getJobFitSummaryScore(this.workerId, this.currentPage , 10);
    });
  }
  setRows(e: any){
    this.rowCount = e.value
    this.getJobFitSummaryScore(this.workerId,this.currentPage , e.value);
  }
  getUniqueJobNames() {
    return (this.jobFitScores)
      ? [...new Set(this.jobFitScores.map(item => item.job.name))]
      : [];
  }
  viewGraph() {
    let datasets: any[] = [];
    let labels: any[] = [];
    this.jobfitScoresLoaded = false;
    const colours = this.getColours(this.selectedGraphSeries.length);

    for (const jobName of this.selectedGraphSeries) {
      let data = [];
      const jobfitEntries = this.jobFitScores.filter(jf => jf.job.name === jobName) ?? [];
      for (const [i, jobfitEntry] of jobfitEntries.entries()) {
        const date = moment(new Date(jobfitEntry.date)).format("DD-MMM-YYYY");
        const key = [`Score Record ${i}`, date];
        const score = jobfitEntry.jobFitScore.value;
        labels.push(key)
        data.push({x: key, y: score});
      }

      const colour = colours.shift();
      datasets.push({
        label: jobName,
        data: data,
        fill: false,
        backgroundColor: colour,
        borderColor: colour,
        tension: 0,
      });
    }

    this.graphStyle = this.getGraphStyle();
    this.graphData = { labels, datasets };
    this.viewBtnClicked = true;
    this.jobfitScoresLoaded = true;
  }
  getGraphStyle() {
    return {
      plugins: {
        tooltip: {
          enabled: false,
        },
        legend: {
          labels: {
            boxWidth: 16,
          }
        }
      },
      layout: {
        padding: 20,
      },
      scales: {
        x: {
          offset: true,
          ticks: {
            font: {
              weight: "bold",
            }
          }
        },
        y: {
          beginAtZero: true,
          min: 0,
          max: 4.5,
          ticks: {
            stepSize: 1,
            callback: function(value: any, index: any) {
              switch (value) {
                case 0: return 'Pending';
                default: return (value % 1 === 0) ? value : ""; // whole numebrs only
              }
            }
          }
        }
      }
    }
  }
  getColours(n: number) {
    let seed = 14;
    function random() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    let colours: string[] = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(random() * 255);
      const g = Math.floor(random() * 255);
      const b = Math.floor(random() * 255);
      colours.push(`rgb(${r},${g},${b})`);
    }
    return colours;
  }
  changeToPlainText(text:string):string {
    let newText = text?.replace(/<[^>]+>/g, '');
    newText = newText?.replace(/\r?\n|\r/g, "");
    return newText;
  }
}
