import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerGroupsComponent } from './worker-groups.component';

describe('WorkerGroupsComponent', () => {
  let component: WorkerGroupsComponent;
  let fixture: ComponentFixture<WorkerGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
