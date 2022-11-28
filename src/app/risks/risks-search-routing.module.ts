
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerformRisksSearchComponent } from './perform-risk-search/perform-risk-search.component';
import { RisksSearchListComponent } from './risk-search-list/risk-search-list.component';
import { RisksSearchComponent } from './risks-search.component';


const routes: Routes = [
    { path: '', component: RisksSearchComponent,  children: [
    { path: '', component: RisksSearchListComponent},
    { path: 'perform-risk-search/:riskSearchId', component: PerformRisksSearchComponent },
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RisksSearchRoutingModule { }
