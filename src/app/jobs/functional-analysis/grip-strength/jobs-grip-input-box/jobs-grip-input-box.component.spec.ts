import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsGripInputBoxComponent } from './jobs-grip-input-box.component';

describe('JobsGripInputBoxComponent', () => {
  let component: JobsGripInputBoxComponent;
  let fixture: ComponentFixture<JobsGripInputBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsGripInputBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsGripInputBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
