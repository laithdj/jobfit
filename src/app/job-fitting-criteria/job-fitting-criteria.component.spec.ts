import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFittingCriteriaComponent } from './job-fitting-criteria.component';

describe('JobFittingCriteriaComponent', () => {
  let component: JobFittingCriteriaComponent;
  let fixture: ComponentFixture<JobFittingCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobFittingCriteriaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFittingCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
