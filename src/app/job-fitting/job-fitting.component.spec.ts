import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFittingComponent } from './job-fitting.component';

describe('JobFittingComponent', () => {
  let component: JobFittingComponent;
  let fixture: ComponentFixture<JobFittingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobFittingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFittingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
