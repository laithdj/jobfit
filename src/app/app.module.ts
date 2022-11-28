import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS, } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeAu from '@angular/common/locales/en-AU';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { jobFitReducers } from './store/job-fit.reducers';
import { AppRoutingModule } from './app.routing.module';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material/material.module';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthorizeInterceptor } from './api-authorization/authorize.interceptor';
import { UserManager } from 'oidc-client';
import { metaReducers, reducers } from './app-store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { JobFitEffects } from './store/job-fit.effects';
import { JobsEffects } from './store/jobs-store/jobs.effects';
import { jobsReducers } from './store/jobs-store/jobs.reducers';
import { AuthenticatedGuard } from './auth/authentication.guard';
import { WorkersEffects } from './store/workers-store/workers.effects';
import { AppConfig } from './app.config';
import { workersReducers } from './store/workers-store/workers.reducers';
import { AuthorizeService } from './api-authorization/authorize.service';


registerLocaleData(localeAu);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    MaterialModule,
  //  ApiAuthorizationModule,    
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreModule.forFeature('jobFitState', jobFitReducers),
    StoreDevtoolsModule.instrument(),
    EffectsModule.forRoot([JobFitEffects]),
    StoreModule.forFeature('jobsState', jobsReducers),
    EffectsModule.forFeature([JobsEffects]),
    StoreModule.forFeature('workersState', workersReducers),
    EffectsModule.forFeature([WorkersEffects]),
  ],
  providers: [
    HttpClient,
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true },
    UserManager,
    AppComponent,
    AuthenticatedGuard,
    AppConfig,
    AuthorizeService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}