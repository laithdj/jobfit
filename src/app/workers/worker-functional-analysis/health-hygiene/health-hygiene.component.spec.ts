import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FAHealthHygieneComponent } from './health-hygiene.component';



describe('FAHealthHygeineComponent', () => {
  let component: FAHealthHygieneComponent;
  let fixture: ComponentFixture<FAHealthHygieneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FAHealthHygieneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FAHealthHygieneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
