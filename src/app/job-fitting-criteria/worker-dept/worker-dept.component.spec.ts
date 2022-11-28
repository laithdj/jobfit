import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerDeptComponent } from './worker-dept.component';

describe('WorkerDeptComponent', () => {
  let component: WorkerDeptComponent;
  let fixture: ComponentFixture<WorkerDeptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerDeptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerDeptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
