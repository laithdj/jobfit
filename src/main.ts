import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

// read config from localStorage if we can
let configString = localStorage.getItem('jod_config');
let localConfig = null;
if (configString) {
  try{
    localConfig = JSON.parse(configString);
  } catch {
    localStorage.removeItem('jod_config');
    localConfig = null; // reload
  }
}

if (!localConfig) {
  fetch('/assets/config.json')
    .then((response)=> response.json())
    .then((config) => {
      localStorage.setItem('jod_config', JSON.stringify(config));

      if (environment.production) {
        enableProdMode();
      }

      platformBrowserDynamic([{provide: 'APP_CONFIG', useValue: config },{ provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }])
        .bootstrapModule(AppModule)
        .catch((err) => {console.error(err)});
  });
} else {
  platformBrowserDynamic([{provide: 'APP_CONFIG', useValue: localConfig },{ provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }])
  .bootstrapModule(AppModule)
  .catch((err) => {console.error(err)});
}

