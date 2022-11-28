import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerEmploymentComponent } from './worker-employment.component';

describe('WorkerEmploymentComponent', () => {
  let component: WorkerEmploymentComponent;
  let fixture: ComponentFixture<WorkerEmploymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerEmploymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerEmploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
