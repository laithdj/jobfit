import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerPpeComponent } from './worker-ppe.component';

describe('WorkerPpeComponent', () => {
  let component: WorkerPpeComponent;
  let fixture: ComponentFixture<WorkerPpeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerPpeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerPpeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
