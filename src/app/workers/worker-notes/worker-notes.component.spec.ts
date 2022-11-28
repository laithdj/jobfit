import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerNotesComponent } from './worker-notes.component';

describe('WorkerNotesComponent', () => {
  let component: WorkerNotesComponent;
  let fixture: ComponentFixture<WorkerNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
