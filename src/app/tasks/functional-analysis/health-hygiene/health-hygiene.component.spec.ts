import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFAHealthHygieneComponent } from './health-hygiene.component';



describe('TaskFAHealthHygieneComponent', () => {
  let component: TaskFAHealthHygieneComponent;
  let fixture: ComponentFixture<TaskFAHealthHygieneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskFAHealthHygieneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFAHealthHygieneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
