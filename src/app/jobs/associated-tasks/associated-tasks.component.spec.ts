import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedTasksComponent } from './associated-tasks.component';

describe('AssociatedTasksComponent', () => {
  let component: AssociatedTasksComponent;
  let fixture: ComponentFixture<AssociatedTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociatedTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
