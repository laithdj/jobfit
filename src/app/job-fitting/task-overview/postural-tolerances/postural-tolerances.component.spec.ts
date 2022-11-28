import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFitPosturalTolerancesComponent } from './postural-tolerances.component';

describe('PosturalTolerancesComponent', () => {
  let component: JobFitPosturalTolerancesComponent;
  let fixture: ComponentFixture<JobFitPosturalTolerancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobFitPosturalTolerancesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFitPosturalTolerancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
