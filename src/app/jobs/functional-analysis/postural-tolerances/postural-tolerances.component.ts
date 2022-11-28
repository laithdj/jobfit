import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { PosturalTolerancesValueChange } from 'src/app/store/job-fit.actions';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { FetchPosturalToleranceGroups, FetchPosturalTolerances } from 'src/app/store/jobs-store/jobs.actions';
import { selectJobsFunctionalAnalysis, selectPosturalBackAssessment, selectPosturalBackSecondAssessment, selectPosturalHandAssessment, selectPosturalLegFeetAssessment, selectPosturalNeckAssessment, selectPosturalShoulderAssessment, selectPosturalToleranceGroups, selectPosturalWristHandAssessment } from 'src/app/store/jobs-store/jobs.selectors';
import { EPosturalToleranceGroup, FunctionalAnalysis, PosturalToleranceGroup, PosturalToleranceResult } from '../../../shared/models/functional-analysis.model';
import { Postural } from '../../../shared/models/postural-tolerance.model';

@Component({
  selector: 'jobs-postural-tolerances',
  templateUrl: './postural-tolerances.component.html',
  styleUrls: ['./postural-tolerances.component.css']
})
export class JobsPosturalTolerancesComponent implements OnInit {
  posturalBackTolerances$ = this.store.pipe(select(selectPosturalBackAssessment));
  posturalShoulderTolerances$ = this.store.pipe(select(selectPosturalShoulderAssessment));
  posturalHandTolerances$ = this.store.pipe(select(selectPosturalHandAssessment));
  posturalNeckTolerances$ = this.store.pipe(select(selectPosturalNeckAssessment));
  posturalWristHandTolerances$ = this.store.pipe(select(selectPosturalWristHandAssessment));
  posturalSecondBackTolerances$ = this.store.pipe(select(selectPosturalBackSecondAssessment));
  posturalLegFeetTolerances$ = this.store.pipe(select(selectPosturalLegFeetAssessment));
  postural: Postural = new Postural();
  posturalGroups$ = this.store.pipe(select(selectPosturalToleranceGroups));
  currentFunctionalAnalysis$ = this.store.pipe(select(selectJobsFunctionalAnalysis));
  posturalGroups: PosturalToleranceGroup[]= [];
  // currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  posturalBackTolerancesResult: PosturalToleranceResult[] = [];
  posturalShoulderTolerancesResult: PosturalToleranceResult[] = [];
  posturalHandTolerancesResult: PosturalToleranceResult[] = [];
  posturalNeckTolerancesResult: PosturalToleranceResult[] = [];
  posturalWristHandTolerancesResult: PosturalToleranceResult[] = [];
  posturalLegFeetTolerancesResult: PosturalToleranceResult[] = [];
  posturalGeneralTolerancesResult: PosturalToleranceResult[] = [];
  @Input() editMode: boolean = false;
  @Input() currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  posturalOptions: any[] = [{label:"" , key:"N "},{label:'' , key:"O "},
  {label:'' , key:"F "},{label:'' , key:"C "},{label:'' , key:"NT"}];
  constructor(private store: Store<JobFitAppState>) {
    this.store.dispatch(new FetchPosturalToleranceGroups());
    this.currentFunctionalAnalysis$.subscribe(result => {
      this.currentFunctionalAnalysis = result;
      if(this.currentFunctionalAnalysis.posturalToleranceResults.length > 0) {
        this.getResults();
      }
    });
  }

  ngOnInit(): void {
  }

  getResults(){
    var posturalResult = this.currentFunctionalAnalysis.posturalToleranceResults;
    this.posturalBackTolerancesResult = this.sortDisplayOrder(posturalResult.filter(x=> x.groupId == EPosturalToleranceGroup.Back));
    this.posturalShoulderTolerancesResult = this.sortDisplayOrder(posturalResult.filter(x=> x.groupId == EPosturalToleranceGroup.Shoulder));
    this.posturalHandTolerancesResult = this.sortDisplayOrder(posturalResult.filter(x=> x.groupId == EPosturalToleranceGroup.HandFingers));
    this.posturalNeckTolerancesResult = this.sortDisplayOrder(posturalResult.filter(x=> x.groupId == EPosturalToleranceGroup.Neck));
    this.posturalWristHandTolerancesResult = this.sortDisplayOrder(posturalResult.filter(x=> x.groupId == EPosturalToleranceGroup.WristHands));
    this.posturalLegFeetTolerancesResult = this.sortDisplayOrder(posturalResult.filter(x=> x.groupId == EPosturalToleranceGroup.LegFeet));
    this.posturalGeneralTolerancesResult = this.sortDisplayOrder(posturalResult.filter(x=> x.groupId == EPosturalToleranceGroup.General));
  }
  sortDisplayOrder(result: PosturalToleranceResult[]) {
    return result.sort((a,b) => a.displayOrder < b.displayOrder ? -1 : a.displayOrder > b.displayOrder ? 1 : 0)
  }
  valueChange(value: any, id: number, type:number , e:any){
    if(value.key !== e){
      this.store.dispatch(new PosturalTolerancesValueChange({id: id , value: value.key , type: type}))
    }
  }
}
