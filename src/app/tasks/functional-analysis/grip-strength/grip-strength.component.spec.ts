import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGripStrengthComponent } from './grip-strength.component';

describe('GripStrengthComponent', () => {
  let component: TaskGripStrengthComponent;
  let fixture: ComponentFixture<TaskGripStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskGripStrengthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskGripStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
