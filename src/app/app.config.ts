import { InjectionToken } from "@angular/core"

export class AppConfig {
    ServiceUrl: string = '';
    AuthUrl: string = '';
    ApplicationName: string = '';
    AppInsightsKey: string = '';
    AdminUrl: string = '';
    VersionNumber: string = '';
    BuildNumber: string = '';
    ReleaseNumber: string = '';
    ReleaseTime: string = '';
    ShortSHA: string = '';
    SHA: string = '';
    Branch: string = '';
    LastCommitAuthor: string = '';
    LastCommitTime: string = '';
    LastCommitMessage: string = '';
    LastCommitNumber: string = '';
    InactivityTimeout: string = '';
}

export let APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
