import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerTaskComponent } from './worker-task.component';

describe('WorkerTaskComponent', () => {
  let component: WorkerTaskComponent;
  let fixture: ComponentFixture<WorkerTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
