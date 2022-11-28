import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { RiskSearchResultsView, RiskSearchSelectDataView, RisksSearchCriteria, RisksSearchResult, RisksSearchView, RunRiskSearchView } from '../shared/models/risks.search.model';

@Injectable({
  providedIn: 'root'
})
export class RisksSearchService {
  private client: HttpClient;
  private baseURL: string;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string , @Inject('APP_CONFIG') appConfig: AppConfig) {
    this.client = http;
    this.baseURL = appConfig.ServiceUrl;
  }
  getRisksSearchList(searchCriteria: RisksSearchCriteria): Observable<RisksSearchResult> {
    return this.client.post<RisksSearchResult>(this.baseURL + 'GetRisksSearch/', searchCriteria)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getRiskSearchSelectionData(): Observable<RiskSearchSelectDataView> {
    return this.client.get<RiskSearchSelectDataView>(this.baseURL + 'GetRiskSearchSelectionData/')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  printList(id: number, runRiskSearch:RunRiskSearchView): Observable<any> {
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
    };
    return this.client.post<any>(this.baseURL + 'PrintRiskResultList/' + id, runRiskSearch, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  export(id: number, runRiskSearch:RunRiskSearchView): Observable<any> {
    const httpOptions = {
      'responseType'  : 'blob' as 'json'
    };
    return this.client.post<any>(this.baseURL + 'ExportRiskResultList/' + id, runRiskSearch, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  archiveRisks(ids:number[]): Observable<boolean> {
    return this.client.post<boolean>(this.baseURL + 'ArchiveRisksSearch/', ids)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }; 
  archiveRiskCriteria(id:number): Observable<boolean> {
    return this.client.get<boolean>(this.baseURL + 'ArchiveRisksCriteria/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  getRiskSearchData(id: number): Observable<RisksSearchView>{
    return this.client.get<RisksSearchView>(this.baseURL + 'GetRiskSearchData/' + id).pipe(
      retry(1),
      catchError(this.handleError)
    );
   }
  saveRiskSearch(riskSearch:RisksSearchView): Observable<number> {
    return this.client.post<number>(this.baseURL + 'SaveRiskSearch', riskSearch)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };
  performRiskSearch(riskSearchId:number, runRiskSearch:RunRiskSearchView): Observable<RiskSearchResultsView[]> {
    return this.client.post<RiskSearchResultsView[]>(this.baseURL + 'RunRiskSearch/' + riskSearchId, runRiskSearch)
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
