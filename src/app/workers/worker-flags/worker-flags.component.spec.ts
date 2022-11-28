import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerFlagsComponent } from './worker-flags.component';

describe('WorkerFlagsComponent', () => {
  let component: WorkerFlagsComponent;
  let fixture: ComponentFixture<WorkerFlagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerFlagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerFlagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
