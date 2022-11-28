import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { MaterialHandling } from 'src/app/shared/models/materialHandling.model';
import { JobFitAppState } from 'src/app/store/job-fit.reducers';
import { selectCurrentFunctionalAnalysis } from 'src/app/store/job-fit.selectors';

@Component({
  selector: 'material-checkbox',
  templateUrl: './material-checkbox.component.html',
  styleUrls: ['./material-checkbox.component.css']
})
export class MaterialCheckboxComponent implements OnInit {
  materialValue: boolean | undefined = false;
  materialHandlingResults: MaterialHandling[] = [];
  @Input() materialId: number = 0;
  @Input() type: string = '';
  active = false;
  @Input() editMode: boolean = false;
  @Output() onChange =  new EventEmitter<MaterialHandling>();
  materialHandling: MaterialHandling | undefined = new MaterialHandling();

  @Input() materialHandlingFreqId: number = 0;
  @Input() materialHandlingItemId: number = 0;

  currentFunctionalAnalysis$ = this.store.pipe(select(selectCurrentFunctionalAnalysis));

  constructor(private store: Store<JobFitAppState>) {}

  ngOnInit(): void {
    this.materialValue = false;
    this.currentFunctionalAnalysis$.subscribe(result => {
      if(result){
        this.materialHandlingResults = result.materialHandlingResults;
        let valueFind = this.materialHandlingResults.find(x => ((x.materialHandlingItemId === this.materialId) ));
        this.materialHandling = _.cloneDeep(valueFind);
        if(this.type === 'awkwardLoad'){
          this.materialValue = valueFind ? valueFind.awkwardLoad : undefined;
        } else if(this.type === 'forceFullPull'){
          this.materialValue = valueFind ? valueFind.forceFullPull : undefined;
        } else if(this.type === 'forceFullPush'){
          this.materialValue = valueFind ? valueFind.forceFullPush : undefined;
        }
        if(this.type === 'enable'){
          this.active = true;
          if(valueFind){
            this.materialValue = valueFind.isActive;
          }
        } else if(valueFind){
          this.active = valueFind.isActive;
          if(this.type === 'awkwardLoad'){
            this.materialValue = valueFind.awkwardLoad;
          }
          else if(this.type === 'forceFullPull'){
            this.materialValue = valueFind.forceFullPull;
           } else if(this.type === 'forceFullPush'){
            this.materialValue = valueFind.forceFullPush;
          }
        } else {
          this.active = false;
        }
      }
    });
  }
  onValueChange(e:any){
    if(this.type === 'enable') {
      let list = this.materialHandlingResults.filter((x) => x.materialHandlingItemId === this.materialHandlingItemId);
      if(list.length > 1){
        const updatedList = list.map(item => ({ ...item, isActive: e.checked }));
        list = updatedList;
        updatedList.forEach(item => this.onChange.emit(item));
      } else{
        for(let i = 1 ; i <= 3 ; i ++){
          let matHandling = new MaterialHandling();
          matHandling.materialHandlingFreqId = i;
          matHandling.isActive = e.checked;
          matHandling.materialHandlingItemId = this.materialHandlingItemId;
          this.onChange.emit(matHandling);
        }
      }

    } else{
      let matHandling = new MaterialHandling();
      if(this.type === 'awkwardLoad'){
        matHandling.awkwardLoad = e.checked;
      }
      else if(this.type === 'forceFullPull'){
        matHandling.forceFullPull = e.checked;
       } else if(this.type === 'forceFullPush'){
        matHandling.forceFullPush = e.checked;
      }
      matHandling.materialHandlingItemId = this.materialHandlingItemId;
      matHandling.materialHandlingFreqId = this.materialHandlingFreqId;
      this.onChange.emit(matHandling);
    }
    }
  }

