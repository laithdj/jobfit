import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsRiskRatingComponent } from './jobs-risk-rating.component';

describe('JobsRiskRatingComponent', () => {
  let component: JobsRiskRatingComponent;
  let fixture: ComponentFixture<JobsRiskRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsRiskRatingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsRiskRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
