import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerHumanFactorsComponent } from './worker-human-factors.component';

describe('HumanFactorsComponent', () => {
  let component: WorkerHumanFactorsComponent;
  let fixture: ComponentFixture<WorkerHumanFactorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerHumanFactorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerHumanFactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
