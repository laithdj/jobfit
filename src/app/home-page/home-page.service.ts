import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { AppConfig } from '../app.config';
import { QuickSearchOption } from '../shared/models/quickSearchOption.model';
import { SearchCriteria } from '../shared/models/search.criteria.model';
import { TaskItem } from '../shared/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class HomePageService {
  taskId = 0;
  homePage = false;
  private client: HttpClient;
  private baseURL: string;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string , appComponent:AppComponent, @Inject('APP_CONFIG') appConfig: AppConfig ) {
    this.client = http;
    this.baseURL =  appConfig.ServiceUrl;
   }
   getQuickSearchList(term: string): Observable<QuickSearchOption[]> {
    return this.client.get<QuickSearchOption[]>(this.baseURL + 'QuickSearch/' + term )
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
