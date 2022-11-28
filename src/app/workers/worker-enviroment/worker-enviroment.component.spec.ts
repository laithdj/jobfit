import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerEnvironmentComponent } from './worker-enviroment.component';

describe('EnviromentComponent', () => {
  let component: WorkerEnvironmentComponent;
  let fixture: ComponentFixture<WorkerEnvironmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerEnvironmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
