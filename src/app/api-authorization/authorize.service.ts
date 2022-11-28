import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User, UserManager, WebStorageStateStore } from 'oidc-client';
import { BehaviorSubject, concat, from, Observable, throwError, Subscription } from 'rxjs';
import { catchError, filter, map, mergeMap, retry, take, tap } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { TasksService } from '../tasks/tasks-service.service';
import { ApplicationPaths, ApplicationName } from './api-authorization.constants';

export type IAuthenticationResult =
  SuccessAuthenticationResult |
  FailureAuthenticationResult |
  RedirectAuthenticationResult;

export interface SuccessAuthenticationResult {
  status: AuthenticationResultStatus.Success;
  state: any;
}

export interface FailureAuthenticationResult {
  status: AuthenticationResultStatus.Fail;
  message: string;
}

export interface RedirectAuthenticationResult {
  status: AuthenticationResultStatus.Redirect;
  redirectUrl: string;
}

export enum AuthenticationResultStatus {
  Success,
  Redirect,
  Fail
}

export interface IUser extends User {
  name: string;
  profile: any;
  role: string[];

}

// Private interfaces
enum LoginMode {
  Silent,
  PopUp,
  Redirect
}

interface IAuthenticationState {
  mode: LoginMode;
  userState?: any;
}

export var authUrl:string = 'b';

@Injectable({
  providedIn: 'root',
  deps: [Location],
})
export class AuthorizeService {
  // By default pop ups are disabled because they don't work properly on Edge.
  // If you want to enable pop up authentication simply set this flag to false.
  private settings: any;
  public static loadingUserManager: boolean = false;
  private user: any | null = null;
  private popUpDisabled = true;
  private userManager: UserManager;
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private location: string;
  public functionList: any[] = [];
  private client: HttpClient;
  private baseURL: string;
  private authUrl: string;
  private applicationName: string;
  private subscription: Subscription | null = null;

  returnUrl = '';

  constructor(@Inject('BASE_URL') baseUrl: string,
  http: HttpClient,
  @Inject('APP_CONFIG') appConfig: AppConfig
  ) {
    this.location = baseUrl;
    this.userManager = new UserManager(this.settings);
    this.client = http;
    this.baseURL =  appConfig.ServiceUrl;
    this.authUrl = appConfig.AuthUrl;
    this.applicationName = appConfig.ApplicationName;

  }

  public isAuthenticated(): Observable<boolean> {
    return this.getUser().pipe(map(u => !!u));
  }


  public getUser(): Observable<User | null> {
    if (this.user == null){
      this.user = concat(
        this.userSubject.pipe(take(1), filter(u => !!u)),
        this.getUserFromStorage().pipe(filter(u => !!u), tap(u => this.userSubject.next(u))),
        this.userSubject.asObservable());
      if (this.subscription == null) {
        this.subscription = this.getUserFromStorage().subscribe();
      }
    }
    return this.user;
  }

  public getAccessToken(): Observable<string | null> {
    return from(this.ensureUserManagerInitialized())
      .pipe(mergeMap(() => from(this.userManager.getUser())),
        map(user => user && user.access_token));
  }
  public startSilentRenew(): void {
    this.userManager.startSilentRenew();
    //console.log(this.userManager.querySessionStatus());
    //console.log(this.userManager.getUser);
  }

  // We try to authenticate the user in three different ways:
  // 1) We try to see if we can authenticate the user silently. This happens
  //    when the user is already logged in on the IdP and is done using a hidden iframe
  //    on the client.
  // 2) We try to authenticate the user using a PopUp Window. This might fail if there is a
  //    Pop-Up blocker or the user has disabled PopUps.
  // 3) If the two methods above fail, we redirect the browser to the IdP to perform a traditional
  //    redirect flow.
  public async checkSignIn(): Promise<any> {
    await this.ensureUserManagerInitialized();
    let user: User | null = null;
    try {
      user = await this.userManager.signinSilent(this.createArguments(LoginMode.Silent));
      this.userSubject.next(user);

      return this.success(user.state);
    } catch (silentError) {

    }
  }
  public getUserDetails(): Observable<User> {
    return this.client.get<User>(this.baseURL + 'GetUserDetails')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  };

  // We try to authenticate the user in three different ways:
  // 1) We try to see if we can authenticate the user silently. This happens
  //    when the user is already logged in on the IdP and is done using a hidden iframe
  //    on the client.
  // 2) We try to authenticate the user using a PopUp Window. This might fail if there is a
  //    Pop-Up blocker or the user has disabled PopUps.
  // 3) If the two methods above fail, we redirect the browser to the IdP to perform a traditional
  //    redirect flow.
  public async signIn(state: any): Promise<IAuthenticationResult> {
    await this.ensureUserManagerInitialized();
    let user: User | null = null;
    try {
      user = await this.userManager.signinSilent(this.createArguments(LoginMode.Silent, state));
      this.userSubject.next(user);
      return this.success(state);
    } catch (silentError) {
      // User might not be authenticated, fallback to popup authentication
      console.log('Silent authentication error: ', silentError);

      try {
        if (this.popUpDisabled) {
          throw new Error('Popup disabled. Change \'authorize.service.ts:AuthorizeService.popupDisabled\' to false to enable it.');
        }
        user = await this.userManager.signinPopup(this.createArguments(LoginMode.PopUp, state));
        this.userSubject.next(user);
        return this.success(state);
      } catch (popupError:any) {
        if (popupError.message === 'Popup window closed') {
          // The user explicitly cancelled the login action by closing an opened popup.
          return this.error('The user closed the window.');
        } else if (!this.popUpDisabled) {
          console.log('Popup authentication error: ', popupError);
        }
        // PopUps might be blocked by the user, fallback to redirect
        try {
          const signInRequest = await this.userManager.createSigninRequest(
            this.createArguments(LoginMode.Redirect, state));
          return this.redirect(signInRequest.url);
        } catch (redirectError:any) {
          console.log('Redirect authentication error: ', redirectError);
          return this.error(redirectError);
        }
      }
    }
  }

  // We are receiving a callback from the IdP. This code can be running in 3 situations:
  // 1) As a hidden iframe started by a silent login on signIn (above). The code in the main
  //    browser window will close the iframe after returning from signInSilent.
  // 2) As a PopUp window started by a pop-up login on signIn (above). The code in the main
  //    browser window will close the pop-up window after returning from signInPopUp
  // 3) On the main browser window when the IdP redirects back to the app. We will process
  //    the response and redirect to the return url or display an error message.
  public async completeSignIn(url: string): Promise<IAuthenticationResult> {
    await this.ensureUserManagerInitialized();
    try {
      const { state } = await (this.userManager as any).readSigninResponseState(url, this.userManager.settings.stateStore);
      if (state.request_type === 'si:r' || !state.request_type) {
        const user = await this.userManager.signinRedirectCallback(url);
        this.userSubject.next(user);
        return this.success(state.data.userState);
      }
      if (state.request_type === 'si:p') {
        await this.userManager.signinPopupCallback(url);
        return this.success(undefined);
      }
      if (state.request_type === 'si:s') {
        await this.userManager.signinSilentCallback(url);
        return this.success(undefined);
      }

      throw new Error(`Invalid login mode '${state.request_type}'.`);
    } catch (signInResponseError) {
      console.log('There was an error signing in', signInResponseError);
      return this.error('Sign in callback authentication error.');
    }
  }

  // We try to sign out the user in two different ways:
  // 1) We try to do a sign-out using a PopUp Window. This might fail if there is a
  //    Pop-Up blocker or the user has disabled PopUps.
  // 2) If the method above fails, we redirect the browser to the IdP to perform a traditional
  //    post logout redirect flow.
  public async signOut(state: any): Promise<IAuthenticationResult> {
    await this.ensureUserManagerInitialized();
    try {
      // remove local storage settings
      localStorage.removeItem('jod_settings');
      localStorage.removeItem('jod_config');
      localStorage.removeItem('jod_activityTime');
      localStorage.removeItem('jod_activityTimeExpires');
      localStorage.removeItem('jod_activityTimeCheckId');
      localStorage.removeItem('jod_actSessionExpiryTime');
      localStorage.removeItem('jod_countdownTimeInSeconds');
      localStorage.removeItem('authorisedList');
      await this.userManager.signoutPopup(this.createArguments(LoginMode.PopUp, state));
      this.user = null;
      this.userSubject.next(null);
      return this.success(state);
    } catch (popupSignOutError) {
      console.log('Popup signout error: ', popupSignOutError);
      try {
        const signInRequest = await this.userManager.createSignoutRequest(
          this.createArguments(LoginMode.Redirect, state));
        return this.redirect(signInRequest.url);
      } catch (redirectSignOutError:any) {
        console.log('Redirect signout error: ', popupSignOutError);
        return this.error(redirectSignOutError);
      }
    }
  }

  // We are receiving a callback from the IdP. This code can be running in 2 situations:
  // 1) As a PopUp window started by a pop-up login on signOut (above). The code in the main
  //    browser window will close the pop-up window after returning from signOutPopUp
  // 2) On the main browser window when the IdP redirects back to the app. We will process
  //    the response and redirect to the logged-out url or display an error message.
  public async completeSignOut(url: string): Promise<any> {
    await this.ensureUserManagerInitialized();
    try {
      const { state } = await (this.userManager as any).readSignoutResponseState(url, this.userManager.settings.stateStore);
      if (state) {
        if (state.request_type === 'so:r') {
          await this.userManager.signoutRedirectCallback(url);
          this.userSubject.next(null);
          return this.success(state.data.userState);
        }
        if (state.request_type === 'so:p') {
          await this.userManager.signoutPopupCallback(url);
          return this.success(state.data && state.data.userState);
        }
        throw new Error(`Invalid login mode '${state.request_type}'.`);
      }
    } catch (signInResponseError) {
      console.log('There was an error signing out', signInResponseError);
      return this.error('Sign out callback authentication error.');
    }
  }

  private createArguments(mode: LoginMode, state?: any): any {
    if (mode !== LoginMode.Silent) {
      return { data: { mode, userState: state }, popupWindowTarget: 'jod-sign-out' };
    } else {
      return { data: { mode, userState: state }, redirect_uri: this.userManager.settings.redirect_uri, popupWindowTarget: 'jod-sign-out' };
    }
  }

  private error(message: string): IAuthenticationResult {
    return { status: AuthenticationResultStatus.Fail, message };
  }

  private success(state: any): IAuthenticationResult {
    return { status: AuthenticationResultStatus.Success, state };
  }

  private redirect(redirectUrl: string): IAuthenticationResult {
    return { status: AuthenticationResultStatus.Redirect, redirectUrl };
  }

  private async ensureUserManagerInitialized(): Promise<void> {
    // Note: This method gets called a lot, we should only need get settings from the Hub once
    // per instantiation of this service. This interval waits for the first call to hub to finish.
    // When that happens we shouldn't need to get settings again and we can resolve our promises.
    if (AuthorizeService.loadingUserManager) {
      return new Promise((resolve, reject) => {
        let intervalId = setInterval(() => {
          if (AuthorizeService.loadingUserManager == false) {
            // clear this interval
            clearInterval(intervalId);
            // now resolve promise
            resolve();
          }
        }, 25);
      });
    }

    if (this.settings?.automaticSilentRenew) {
      return;
    }

    let localSettings = localStorage.getItem('jod_settings');
    if (localSettings) {
      try{
        this.settings = JSON.parse(localSettings);
      } catch {
        localStorage.removeItem('jod_settings');
        this.settings = null; // reload
      }
    }

    if (!this.settings) {
      // delay other parallel calls to this method whilst this one finishes.
      AuthorizeService.loadingUserManager = true;
      const response = await fetch(this.getConfigurationURL());
      if (!response.ok) {
        throw new Error(`Could not load settings for '${ApplicationName}'`);
      }

      this.settings = await response.json();
      this.settings.automaticSilentRenew = true;
      this.settings.includeIdTokenInSilentRenew = true;

      // Allow other call to resolve promises
      AuthorizeService.loadingUserManager = false;

      localStorage.setItem('jod_settings', JSON.stringify(this.settings));
    }

    this.userManager = new UserManager(this.settings);

    // Stop the endless looping in safari browser
    let isSafari = navigator.userAgent.match(/Version\/([0-9\._]+).*Safari/);
    if (isSafari) {
      if (location.href.indexOf('authentication/') == -1) {
        this.userManager.events.addUserSignedOut(async () => {
          // remove session
          await this.userManager.removeUser();
          this.userSubject.next(null);
        });
      }
    } else {
      this.userManager.events.addUserSignedOut(async () => {
        // remove session
        await this.userManager.removeUser();
        this.userSubject.next(null);
      });
    }
  }
  private handleError(error: any) {
    let errorMessage = '';
    //let errors: any = JSON.stringify(error.json());
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}\nPlease Try again.`;
      console.log(error);
    }
    return throwError(errorMessage);
  };
  private getUserFromStorage(): Observable<User | null> {
    return from(this.ensureUserManagerInitialized())
      .pipe(
        mergeMap(() => this.userManager.getUser()),
        map(u => u && u));
  }

  private getConfigurationURL(): string {
    /*
    if (this.location.startsWith("https://localhost")) {
      return ApplicationPaths.ApiAuthorizationClientConfigurationUrlDev;
    } else if (this.location.startsWith("https://console.jobfitsystem.com")) {
      return ApplicationPaths.ApiAuthorizationClientConfigurationUrlProd;
    } else {
      return ApplicationPaths.ApiAuthorizationClientConfigurationUrl;
    }
    */
  //  return ApplicationPaths.ApiAuthorizationClientConfigurationUrl;
    return this.authUrl + "/_configuration/" + this.applicationName;

  }
}
