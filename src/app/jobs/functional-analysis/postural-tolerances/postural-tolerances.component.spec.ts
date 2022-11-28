import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsPosturalTolerancesComponent } from './postural-tolerances.component';

describe('PosturalTolerancesComponent', () => {
  let component: JobsPosturalTolerancesComponent;
  let fixture: ComponentFixture<JobsPosturalTolerancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsPosturalTolerancesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsPosturalTolerancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
