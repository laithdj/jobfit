import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RisksSearchListComponent } from './risk-search-list/risk-search-list.component';
import { RisksSearchComponent } from './risks-search.component';
import { RisksSearchRoutingModule } from './risks-search-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TabMenuModule } from 'primeng/tabmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { PerformRisksSearchComponent } from './perform-risk-search/perform-risk-search.component';


@NgModule({
  declarations: [
    RisksSearchListComponent,
    RisksSearchComponent,
    PerformRisksSearchComponent
  ],
  imports: [
    CommonModule,
    RisksSearchRoutingModule,
    SharedModule,
    TabMenuModule,
    CheckboxModule,
    
  ]
})
export class RisksSearchModule { }
