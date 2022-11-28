import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsMaterialResultComponent } from './jobs-material-result.component';

describe('JobsMaterialResultComponent', () => {
  let component: JobsMaterialResultComponent;
  let fixture: ComponentFixture<JobsMaterialResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsMaterialResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsMaterialResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
