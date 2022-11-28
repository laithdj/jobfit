import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionalAnalysisComponent } from './functional-analysis.component';

describe('FunctionalAnalysisComponent', () => {
  let component: FunctionalAnalysisComponent;
  let fixture: ComponentFixture<FunctionalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunctionalAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
