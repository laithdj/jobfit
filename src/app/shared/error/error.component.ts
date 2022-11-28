import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectAlertPopup } from 'src/app/app-store/app-ui.selectors';
import { AlertPopup } from '../models/alertPopUp.model';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();
  showError = false;
  errorMessage = '';
  title = '';

  constructor(private store: Store<any>) {
    this.store.pipe(select(selectAlertPopup), takeUntil(this._destroyed$)).subscribe((ap: AlertPopup | undefined) => {
      if (ap && ap.errorMessages && ap.errorMessages.length > 0) {
        this.showError = true;
        this.errorMessage = ap?.errorMessages[0];
        if (ap.title && ap.title.length > 0) {
          this.title = ap.title;
        }
      }
    });
   }

   ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
