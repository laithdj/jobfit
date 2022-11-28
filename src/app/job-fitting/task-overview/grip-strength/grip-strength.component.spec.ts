import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFitGripStrengthComponent } from './grip-strength.component';

describe('GripStrengthComponent', () => {
  let component: JobFitGripStrengthComponent;
  let fixture: ComponentFixture<JobFitGripStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobFitGripStrengthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFitGripStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
