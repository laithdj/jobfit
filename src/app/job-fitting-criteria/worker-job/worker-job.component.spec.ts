import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerJobComponent } from './worker-job.component';

describe('WorkerJobComponent', () => {
  let component: WorkerJobComponent;
  let fixture: ComponentFixture<WorkerJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
