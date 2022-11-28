import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobfitScoresComponent } from './jobfit-scores.component';

describe('JobfitScoresComponent', () => {
  let component: JobfitScoresComponent;
  let fixture: ComponentFixture<JobfitScoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobfitScoresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobfitScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
