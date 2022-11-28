import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobEmploymentComponent } from './job-employment.component';

describe('JobEmploymentComponent', () => {
  let component: JobEmploymentComponent;
  let fixture: ComponentFixture<JobEmploymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobEmploymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobEmploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
