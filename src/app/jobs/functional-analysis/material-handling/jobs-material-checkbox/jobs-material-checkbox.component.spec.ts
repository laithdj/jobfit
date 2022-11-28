import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsMaterialCheckboxComponent } from './jobs-material-checkbox.component';

describe('JobsMaterialCheckboxComponent', () => {
  let component: JobsMaterialCheckboxComponent;
  let fixture: ComponentFixture<JobsMaterialCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsMaterialCheckboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsMaterialCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
