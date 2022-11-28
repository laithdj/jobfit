import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerFunctionalAnalysisComponent } from './worker-functional-analysis.component';

describe('WorkerFunctionalAnalysisComponent', () => {
  let component: WorkerFunctionalAnalysisComponent;
  let fixture: ComponentFixture<WorkerFunctionalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerFunctionalAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerFunctionalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
