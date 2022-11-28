import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFitMaterialHandlingComponent } from './material-handling.component';

describe('JobFitMaterialHandlingComponent', () => {
  let component: JobFitMaterialHandlingComponent;
  let fixture: ComponentFixture<JobFitMaterialHandlingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobFitMaterialHandlingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFitMaterialHandlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
