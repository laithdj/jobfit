import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { ReportOptions, ReportResults } from '../shared/models/reports.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  
  private client: HttpClient;
  private baseURL: string;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, @Inject('APP_CONFIG') appConfig: AppConfig) {
    this.client = http;
    this.baseURL =  appConfig.ServiceUrl;
  }
  getReports(type:string): Observable<ReportResults> {
    return this.client.get<ReportResults>(this.baseURL + 'GetReports/' + type)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getPagedTaskSets(taskId: number): Observable<any> {
    return this.client.get<any>(this.baseURL + 'GetPagedTaskSets/' + taskId)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  viewReport(id: string, reportOptions: ReportOptions): Observable<any> {
    return this.client.post<ReportOptions>(this.baseURL + 'ViewReport/' + id, reportOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  viewBatchReport(reportOptions: ReportOptions): Observable<any> {
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
    };
    return this.client.post<any>(this.baseURL + 'ViewReports', reportOptions, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  private handleError(error: any) {
    let errorMessage = '';
    //let errors: any = JSON.stringify(error.json());
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}\nPlease Try again.`;
    }
    return throwError(errorMessage);
  };
}
