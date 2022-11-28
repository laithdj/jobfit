import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppUiState } from '../app-store/app-ui-state.reducer';
import { Observable } from 'rxjs';
import { AppState } from '../app-store/reducers';
import { take, filter } from 'rxjs/operators';
import { AuthorizeService } from '../api-authorization/authorize.service';

/*** Prevent unauthorized activating and loading of routes ***/
@Injectable()
export class AuthenticatedGuard implements CanActivate {

  constructor(private store: Store<AppState>, public router: Router, private authorizeService: AuthorizeService) {}

  // true when user is authenticated
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

    // redirect to access-denied page if user is not authenticated
    const isAuthenticated$ = this.authorizeService.isAuthenticated();
    // role information for authorizeService

    isAuthenticated$.pipe(filter((auth: boolean) => auth === false), take(1))
      .subscribe(_ => {
        this.router.navigate(["/authentication/login/"], { queryParams: { returnUrl: window.location.pathname }} );
      });

    return isAuthenticated$;
  }
}
