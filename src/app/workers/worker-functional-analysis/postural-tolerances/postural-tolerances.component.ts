import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { FetchPosturalToleranceGroups } from 'src/app/store/workers-store/workers.actions';
import { selectCurrentFunctionalAnalysis, selectPosturalBackAssessment, selectPosturalBackSecondAssessment, selectPosturalHandAssessment, selectPosturalLegFeetAssessment, selectPosturalNeckAssessment, selectPosturalShoulderAssessment, selectPosturalWristHandAssessment } from 'src/app/store/workers-store/workers.selectors';
import { EPosturalToleranceGroup, FunctionalAnalysis, PosturalToleranceGroup, PosturalToleranceGroupItems, PosturalToleranceResult } from '../../../shared/models/functional-analysis.model';
import { Postural } from '../../../shared/models/postural-tolerance.model';

@Component({
  selector: 'postural-tolerances',
  templateUrl: './postural-tolerances.component.html',
  styleUrls: ['./postural-tolerances.component.css']
})
export class PosturalTolerancesComponent implements OnInit {
  posturalBackTolerances$ = this.store.pipe(select(selectPosturalBackAssessment));
  posturalShoulderTolerances$ = this.store.pipe(select(selectPosturalShoulderAssessment));
  posturalHandTolerances$ = this.store.pipe(select(selectPosturalHandAssessment));
  posturalNeckTolerances$ = this.store.pipe(select(selectPosturalNeckAssessment));
  posturalWristHandTolerances$ = this.store.pipe(select(selectPosturalWristHandAssessment));
  posturalSecondBackTolerances$ = this.store.pipe(select(selectPosturalBackSecondAssessment));
  posturalLegFeetTolerances$ = this.store.pipe(select(selectPosturalLegFeetAssessment));
  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));
  postural: Postural = new Postural();
  posturalResults: PosturalToleranceResult[] = [];
  posturalBackTolerancesResult: PosturalToleranceResult[] = [];
  posturalShoulderTolerancesResult: PosturalToleranceResult[] = [];
  posturalHandTolerancesResult: PosturalToleranceResult[] = [];
  posturalNeckTolerancesResult: PosturalToleranceResult[] = [];
  posturalWristHandTolerancesResult: PosturalToleranceResult[] = [];
  posturalLegFeetTolerancesResult: PosturalToleranceResult[] = [];
  posturalGeneralTolerancesResult: PosturalToleranceResult[] = [];
  currentFunctionalAnalysis: FunctionalAnalysis = new FunctionalAnalysis();
  posturalBackTolerancesGroup: PosturalToleranceGroupItems[] = [];
  posturalShoulderTolerancesGroup:PosturalToleranceGroupItems[] = [];
  posturalHandTolerancesGroup:PosturalToleranceGroupItems[] = [];
  posturalNeckTolerancesGroup:PosturalToleranceGroupItems[] = [];
  posturalWristHandTolerancesGroup:PosturalToleranceGroupItems[] = [];
  posturalSecondBackTolerancesGroup:PosturalToleranceGroupItems[] = [];
  posturalLegFeetTolerancesGroup:PosturalToleranceGroupItems[] = [];
  @Input() editMode: boolean = false;
  @Input() set faToleranceResult( faToleranceResult: PosturalToleranceResult[]|undefined ) {
    this.posturalResults = faToleranceResult != null ? _.cloneDeep(faToleranceResult) : [];
    this.store.dispatch(new FetchPosturalToleranceGroups());
    this.posturalBackTolerances$.subscribe(result => {
      this.posturalBackTolerancesGroup = result;
    });
    this.posturalShoulderTolerances$.subscribe(result => {
      this.posturalShoulderTolerancesGroup = result;
    });
    this.posturalHandTolerances$.subscribe(result => {
      this.posturalHandTolerancesGroup = result;
    });
    this.posturalNeckTolerances$.subscribe(result => {
      this.posturalNeckTolerancesGroup = result;
    });
    this.posturalWristHandTolerances$.subscribe(result => {
      this.posturalWristHandTolerancesGroup = result;
    });
    this.posturalSecondBackTolerances$.subscribe(result => {
      this.posturalSecondBackTolerancesGroup = result;
    });
    this.posturalLegFeetTolerances$.subscribe(result => {
      this.posturalLegFeetTolerancesGroup = result;
    });
    if(this.posturalResults.length > 0) {
      this.getResults();
    }
    else {
      this.createNewResults();
    }
  } 
  @Output() onChange =  new EventEmitter<PosturalToleranceResult[]>();
  posturalOptions: any[] = [{label:"" , key:"N "},{label:'' , key:"O "},
  {label:'' , key:"F "},{label:'' , key:"X "},{label:'' , key:"NT"}];
  constructor(private store: Store<JobFitAppState>) {
   
  }

  ngOnInit(): void {
  }
  createNewResults() {
    this.posturalResults = [];
    this.posturalBackTolerancesResult = [];
    this.posturalBackTolerancesGroup.forEach(element => {
        var pt: PosturalToleranceResult = new PosturalToleranceResult();
        pt.functionalAnalysisId = 0;
        pt.displayOrder = element.displayOrder;
        pt.posturalToleranceItemId= element.id;
        pt.groupId = EPosturalToleranceGroup.Back;
        pt.frequency.char = 'NT'; 
        this.posturalBackTolerancesResult.push(pt);
        this.posturalResults.push(pt);
    });
    this.posturalShoulderTolerancesResult = [];
    this.posturalShoulderTolerancesGroup.forEach(element => {
        var pt: PosturalToleranceResult = new PosturalToleranceResult();
        pt.functionalAnalysisId = 0;
        pt.displayOrder = element.displayOrder;
        pt.posturalToleranceItemId= element.id;
        pt.groupId = EPosturalToleranceGroup.Shoulder;
        pt.frequency.char = 'NT'; 
        this.posturalShoulderTolerancesResult.push(pt);
        this.posturalResults.push(pt);
    });
    this.posturalHandTolerancesResult = [];
    this.posturalHandTolerancesGroup.forEach(element => {
        var pt: PosturalToleranceResult = new PosturalToleranceResult();
        pt.functionalAnalysisId = 0;
        pt.displayOrder = element.displayOrder;
        pt.posturalToleranceItemId= element.id;
        pt.groupId = EPosturalToleranceGroup.HandFingers;
        pt.frequency.char = 'NT'; 
        this.posturalHandTolerancesResult.push(pt)
        this.posturalResults.push(pt);
    });
    this.posturalNeckTolerancesResult = [];
    this.posturalNeckTolerancesGroup.forEach(element => {
        var pt: PosturalToleranceResult = new PosturalToleranceResult();
        pt.functionalAnalysisId = 0;
        pt.displayOrder = element.displayOrder;
        pt.posturalToleranceItemId= element.id;
        pt.groupId = EPosturalToleranceGroup.Neck;
        pt.frequency.char = 'NT'; 
        this.posturalNeckTolerancesResult.push(pt);
        this.posturalResults.push(pt);
    });
    this.posturalWristHandTolerancesResult = [];
    this.posturalWristHandTolerancesGroup.forEach(element => {
        var pt: PosturalToleranceResult = new PosturalToleranceResult();
        pt.functionalAnalysisId = 0;
        pt.displayOrder = element.displayOrder;
        pt.posturalToleranceItemId= element.id;
        pt.groupId = EPosturalToleranceGroup.WristHands;
        pt.frequency.char = 'NT'; 
        this.posturalWristHandTolerancesResult.push(pt);
        this.posturalResults.push(pt);
    });
    this.posturalLegFeetTolerancesResult = [];
    this.posturalLegFeetTolerancesGroup.forEach(element => {
        var pt: PosturalToleranceResult = new PosturalToleranceResult();
        pt.functionalAnalysisId = 0;
        pt.displayOrder = element.displayOrder;
        pt.posturalToleranceItemId= element.id;
        pt.groupId = EPosturalToleranceGroup.LegFeet;
        pt.frequency.char = 'NT'; 
        this.posturalLegFeetTolerancesResult.push(pt);
        this.posturalResults.push(pt);
    });
    this.posturalGeneralTolerancesResult = [];
    this.posturalSecondBackTolerancesGroup.forEach(element => {
        var pt: PosturalToleranceResult = new PosturalToleranceResult();
        pt.functionalAnalysisId = 0;
        pt.displayOrder = element.displayOrder;
        pt.posturalToleranceItemId= element.id;
        pt.groupId = EPosturalToleranceGroup.General;
        pt.frequency.char = 'NT'; 
        this.posturalGeneralTolerancesResult.push(pt);
        this.posturalResults.push(pt);
    });
    this.onChange.emit(this.posturalResults);
  }
  valueChange(category: any, posturalItemId:number, groupId:number){
    switch (groupId) {
      case EPosturalToleranceGroup.Back:
        {
          var index = this.posturalBackTolerancesResult.findIndex(x=> x.posturalToleranceItemId == posturalItemId);
          this.posturalBackTolerancesResult[index].frequency.char = category.key;
          break;
        }
      case EPosturalToleranceGroup.Shoulder:
        {
          var index = this.posturalShoulderTolerancesResult.findIndex(x=> x.posturalToleranceItemId == posturalItemId);
          this.posturalShoulderTolerancesResult[index].frequency.char = category.key;
          break;
        }
      case EPosturalToleranceGroup.HandFingers:
        {
          var index = this.posturalHandTolerancesResult.findIndex(x=> x.posturalToleranceItemId == posturalItemId);
          this.posturalHandTolerancesResult[index].frequency.char = category.key;
          break;
        }
      case EPosturalToleranceGroup.Neck:
        {
          var index = this.posturalNeckTolerancesResult.findIndex(x=> x.posturalToleranceItemId == posturalItemId);
          this.posturalNeckTolerancesResult[index].frequency.char = category.key;
          break;
        }
      case EPosturalToleranceGroup.WristHands:
        {
          var index = this.posturalWristHandTolerancesResult.findIndex(x=> x.posturalToleranceItemId == posturalItemId);
          this.posturalWristHandTolerancesResult[index].frequency.char = category.key;
          break;
        }
      case EPosturalToleranceGroup.LegFeet:
        {
          var index = this.posturalLegFeetTolerancesResult.findIndex(x=> x.posturalToleranceItemId == posturalItemId);
          this.posturalLegFeetTolerancesResult[index].frequency.char = category.key;
          break;
        }
      case EPosturalToleranceGroup.General:
        {
          var index = this.posturalGeneralTolerancesResult.findIndex(x=> x.posturalToleranceItemId == posturalItemId);
          this.posturalGeneralTolerancesResult[index].frequency.char = category.key;
          break;
        }
    }
    this.changeResult(groupId, category, posturalItemId);
  }
  changeResult(groupId: number, category: any, posturalItemId: number) {
    var index = this.posturalResults.findIndex(x=> x.groupId == groupId && x.posturalToleranceItemId == posturalItemId);
    if (index > -1) {
      this.posturalResults[index].frequency.char = category.key;
      this.onChange.emit(this.posturalResults);
    }
  }
  getResults(){
    this.posturalBackTolerancesResult = this.sortDisplayOrder(this.posturalResults.filter(x=> x.groupId == EPosturalToleranceGroup.Back));
    this.posturalShoulderTolerancesResult = this.sortDisplayOrder(this.posturalResults.filter(x=> x.groupId == EPosturalToleranceGroup.Shoulder));
    this.posturalHandTolerancesResult = this.sortDisplayOrder(this.posturalResults.filter(x=> x.groupId == EPosturalToleranceGroup.HandFingers));
    this.posturalNeckTolerancesResult = this.sortDisplayOrder(this.posturalResults.filter(x=> x.groupId == EPosturalToleranceGroup.Neck));
    this.posturalWristHandTolerancesResult = this.sortDisplayOrder(this.posturalResults.filter(x=> x.groupId == EPosturalToleranceGroup.WristHands));
    this.posturalLegFeetTolerancesResult = this.sortDisplayOrder(this.posturalResults.filter(x=> x.groupId == EPosturalToleranceGroup.LegFeet));
    this.posturalGeneralTolerancesResult = this.sortDisplayOrder(this.posturalResults.filter(x=> x.groupId == EPosturalToleranceGroup.General));
  }
  sortDisplayOrder(result: PosturalToleranceResult[]) {
    return result.sort((a,b) => a.displayOrder < b.displayOrder ? -1 : a.displayOrder > b.displayOrder ? 1 : 0)
  }
}
