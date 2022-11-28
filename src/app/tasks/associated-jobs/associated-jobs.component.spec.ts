import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedJobsComponent } from './associated-jobs.component';

describe('AssociatedJobsComponent', () => {
  let component: AssociatedJobsComponent;
  let fixture: ComponentFixture<AssociatedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociatedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
